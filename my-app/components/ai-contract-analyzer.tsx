"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Shield,
  Zap,
  Code,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Copy,
  Settings,
} from "lucide-react"
import { ZGAIClient, type ContractAnalysis } from "@/lib/0g-ai-client"
import { ZGStorageClient } from "@/lib/0g-storage-client"
import { useToast } from "@/hooks/use-toast"

export function AIContractAnalyzer() {
  const [contractAddress, setContractAddress] = useState("")
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const { toast } = useToast()

  const aiConfig = ZGAIClient.getConfigurationStatus()
  const storageConfig = ZGStorageClient.getConfigurationStatus()

  const analyzeContract = async () => {
    if (!contractAddress.trim()) {
      setError("Please enter a contract address")
      return
    }

    if (!aiConfig.isConfigured) {
      setError("0G AI is not configured. Please set your API key.")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setIsCached(false)

    try {
      // Check for cached analysis first
      if (storageConfig.isConfigured) {
        try {
          const cachedAnalysis = await ZGStorageClient.getAnalysis(contractAddress)
          if (cachedAnalysis && Date.now() - cachedAnalysis.analyzedAt < 24 * 60 * 60 * 1000) {
            setAnalysis(cachedAnalysis.analysis)
            setIsCached(true)
            toast({
              title: "Analysis loaded from cache",
              description: "Using cached analysis from 0G storage (less than 24 hours old)",
            })
            return
          }
        } catch (cacheError) {
          console.warn("Could not check cache:", cacheError)
        }
      }

      // Fetch contract source code from Etherscan
      let sourceCode: string | undefined
      let abi: any[] | undefined

      try {
        const etherscanKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
        if (etherscanKey) {
          const sourceResponse = await fetch(
            `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${etherscanKey}`,
          )
          const sourceData = await sourceResponse.json()

          if (sourceData.status === "1" && sourceData.result[0].SourceCode) {
            sourceCode = sourceData.result[0].SourceCode
            if (sourceData.result[0].ABI !== "Contract source code not verified") {
              try {
                abi = JSON.parse(sourceData.result[0].ABI)
              } catch (e) {
                console.warn("Could not parse ABI:", e)
              }
            }
          }
        }
      } catch (etherscanError) {
        console.warn("Could not fetch from Etherscan:", etherscanError)
      }

      // Analyze with 0G AI
      const analysisResult = await ZGAIClient.analyzeContract(contractAddress, sourceCode, abi)
      setAnalysis(analysisResult)

      // Cache the analysis in 0G storage
      if (storageConfig.isConfigured) {
        try {
          await ZGStorageClient.storeAnalysis({
            id: `analysis_${contractAddress}_${Date.now()}`,
            contractAddress,
            analysis: analysisResult,
            analyzedAt: Date.now(),
            analyzedBy: "0g-ai",
            version: "1.0",
          })
        } catch (storageError) {
          console.warn("Could not cache analysis:", storageError)
        }
      }

      toast({
        title: "Analysis complete",
        description: "Contract analysis completed successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Analysis failed"
      setError(errorMessage)
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied to your clipboard",
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20"
      case "high":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">0G AI</span>
              <Badge variant={aiConfig.isConfigured ? "default" : "destructive"}>
                {aiConfig.isConfigured ? "Configured" : "Not Configured"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">0G Storage</span>
              <Badge variant={storageConfig.isConfigured ? "default" : "secondary"}>
                {storageConfig.isConfigured ? "Configured" : "Optional"}
              </Badge>
            </div>
          </div>
          {!aiConfig.isConfigured && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                0G AI is required for contract analysis. Please configure your ZG_AI_API_KEY environment variable.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Input */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Contract Analyzer
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              Powered by 0G AI
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Analyze smart contracts for vulnerabilities, gas optimization, and security risks using 0G AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter contract address (0x...)"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-white"
              disabled={isAnalyzing}
            />
            <Button
              onClick={analyzeContract}
              disabled={isAnalyzing || !aiConfig.isConfigured}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Analysis Results
                {isCached && (
                  <Badge variant="secondary" className="text-xs">
                    Cached
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getRiskColor(analysis.riskLevel)}>{analysis.riskLevel.toUpperCase()} RISK</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(analysis, null, 2))}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-gray-300">
              Contract: {analysis.contractAddress}
              <Button
                variant="link"
                className="p-0 h-auto ml-2 text-blue-400 hover:text-blue-300"
                onClick={() => window.open(`https://etherscan.io/address/${analysis.contractAddress}`, "_blank")}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-slate-900/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                <TabsTrigger value="gas">Gas</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="similar">Similar</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analysis.confidence}%</div>
                    <div className="text-sm text-gray-400">Confidence</div>
                    <Progress value={analysis.confidence} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analysis.codeQuality.score}/100</div>
                    <div className="text-sm text-gray-400">Code Quality</div>
                    <Progress value={analysis.codeQuality.score} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{analysis.vulnerabilities.length}</div>
                    <div className="text-sm text-gray-400">Issues Found</div>
                  </div>
                </div>

                <div className="bg-slate-900/30 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Summary</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
                </div>

                <div className="text-xs text-gray-400">
                  Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}
                  {isCached && " (from cache)"}
                </div>
              </TabsContent>

              <TabsContent value="vulnerabilities" className="space-y-4">
                {analysis.vulnerabilities.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.vulnerabilities.map((vuln, index) => (
                      <div key={index} className="bg-slate-900/30 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(vuln.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-white font-medium">{vuln.type}</h4>
                              <Badge variant="outline" className={getRiskColor(vuln.severity)}>
                                {vuln.severity}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{vuln.description}</p>
                            {vuln.location && <p className="text-gray-400 text-xs mb-2">Location: {vuln.location}</p>}
                            <div className="bg-slate-800/50 p-2 rounded text-xs">
                              <span className="text-green-400">Recommendation:</span>
                              <span className="text-gray-300 ml-2">{vuln.recommendation}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-white font-medium">No vulnerabilities detected</p>
                    <p className="text-gray-400 text-sm">This contract appears to be secure</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gas" className="space-y-4">
                {analysis.gasOptimization.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.gasOptimization.map((opt, index) => (
                      <div key={index} className="bg-slate-900/30 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Zap className="h-4 w-4 text-yellow-400 mt-1" />
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-2">{opt.issue}</h4>
                            <p className="text-gray-300 text-sm mb-2">{opt.impact}</p>
                            <div className="bg-slate-800/50 p-2 rounded text-xs">
                              <span className="text-blue-400">Suggestion:</span>
                              <span className="text-gray-300 ml-2">{opt.suggestion}</span>
                            </div>
                            {opt.estimatedSavings && (
                              <div className="mt-2 text-xs">
                                <span className="text-green-400">Estimated Savings:</span>
                                <span className="text-gray-300 ml-2">{opt.estimatedSavings}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <p className="text-white font-medium">Gas optimization looks good</p>
                    <p className="text-gray-400 text-sm">No significant gas optimizations found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium mb-3">Issues</h4>
                    {analysis.codeQuality.issues.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.codeQuality.issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-400 mt-0.5" />
                            <span className="text-gray-300 text-sm">{issue}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No code quality issues found</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-3">Recommendations</h4>
                    {analysis.codeQuality.recommendations.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.codeQuality.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5" />
                            <span className="text-gray-300 text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No specific recommendations</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="similar" className="space-y-4">
                {analysis.similarContracts.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.similarContracts.map((similar, index) => (
                      <div key={index} className="bg-slate-900/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Code className="h-4 w-4 text-blue-400" />
                            <div>
                              <p className="text-white font-medium">{similar.address}</p>
                              <p className="text-gray-400 text-sm">{similar.similarity}% similarity</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getRiskColor(similar.riskLevel)}>{similar.riskLevel}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://etherscan.io/address/${similar.address}`, "_blank")}
                              className="text-gray-400 hover:text-white"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white font-medium">No similar contracts found</p>
                    <p className="text-gray-400 text-sm">This contract appears to be unique</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
