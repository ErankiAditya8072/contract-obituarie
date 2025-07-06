"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Skull, AlertTriangle, CheckCircle, Loader2, Brain, Shield, Database, Sparkles } from "lucide-react"
import { WalletGuard } from "./wallet-guard"
import { ZGStorageClient } from "@/lib/0g-storage-client"
import { ZGAIClient } from "@/lib/0g-ai-client"

interface FormData {
  contractAddress: string
  chainId: string
  title: string
  description: string
  causeOfDeath: string
  evidence: string
  reporterNotes: string
}

interface AIAnalysis {
  riskScore: number
  vulnerabilities: string[]
  recommendations: string[]
  generatedDescription: string
  confidence: number
}

const CAUSE_OF_DEATH_OPTIONS = [
  { value: "exploit", label: "Security Exploit", icon: "🔓" },
  { value: "rug-pull", label: "Rug Pull", icon: "🏃" },
  { value: "abandoned", label: "Abandoned by Team", icon: "👻" },
  { value: "deprecated", label: "Deprecated/Superseded", icon: "📦" },
  { value: "bug", label: "Critical Bug", icon: "🐛" },
  { value: "governance", label: "Governance Attack", icon: "🗳️" },
  { value: "oracle", label: "Oracle Manipulation", icon: "🔮" },
  { value: "other", label: "Other", icon: "❓" },
]

const CHAIN_OPTIONS = [
  { value: "1", label: "Ethereum Mainnet" },
  { value: "137", label: "Polygon" },
  { value: "56", label: "BNB Smart Chain" },
  { value: "42161", label: "Arbitrum One" },
  { value: "10", label: "Optimism" },
  { value: "43114", label: "Avalanche" },
  { value: "250", label: "Fantom" },
  { value: "100", label: "Gnosis Chain" },
]

export function AIEnhancedSubmitForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    contractAddress: "",
    chainId: "",
    title: "",
    description: "",
    causeOfDeath: "",
    evidence: "",
    reporterNotes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  const zgStorage = new ZGStorageClient()
  const zgAI = new ZGAIClient()

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const analyzeContract = async () => {
    if (!formData.contractAddress || !formData.chainId) {
      toast({
        title: "Missing Information",
        description: "Please provide contract address and chain ID for analysis",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setError(null)

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Use 0G AI for contract analysis
      const analysis = await zgAI.analyzeContract({
        address: formData.contractAddress,
        chainId: Number.parseInt(formData.chainId),
        includeVulnerabilities: true,
        includeRecommendations: true,
      })

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      setAiAnalysis({
        riskScore: analysis.riskScore || 0,
        vulnerabilities: analysis.vulnerabilities || [],
        recommendations: analysis.recommendations || [],
        generatedDescription: analysis.description || "",
        confidence: analysis.confidence || 0,
      })

      // Auto-fill description if generated
      if (analysis.description && !formData.description) {
        setFormData((prev) => ({ ...prev, description: analysis.description }))
      }

      setActiveTab("analysis")

      toast({
        title: "Analysis Complete",
        description: `Contract analyzed with ${analysis.confidence}% confidence`,
      })
    } catch (error) {
      console.error("AI analysis failed:", error)
      setError("Failed to analyze contract. Please try again or submit manually.")
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze contract with 0G AI",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const generateDescription = async () => {
    if (!formData.contractAddress || !formData.causeOfDeath) {
      toast({
        title: "Missing Information",
        description: "Please provide contract address and cause of death",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingDescription(true)
    setError(null)

    try {
      const generatedDesc = await zgAI.generateObituaryDescription({
        contractAddress: formData.contractAddress,
        chainId: Number.parseInt(formData.chainId),
        causeOfDeath: formData.causeOfDeath,
        title: formData.title,
        evidence: formData.evidence,
        reporterNotes: formData.reporterNotes,
      })

      setFormData((prev) => ({ ...prev, description: generatedDesc }))

      toast({
        title: "Description Generated",
        description: "AI-generated obituary description has been added",
      })
    } catch (error) {
      console.error("Description generation failed:", error)
      toast({
        title: "Generation Failed",
        description: "Unable to generate description with 0G AI",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.contractAddress || !formData.chainId || !formData.title || !formData.causeOfDeath) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Submit to 0G Storage
      const obituaryData = {
        contractAddress: formData.contractAddress,
        chainId: Number.parseInt(formData.chainId),
        title: formData.title,
        description: formData.description,
        causeOfDeath: formData.causeOfDeath,
        evidence: formData.evidence ? formData.evidence.split("\n").filter((e) => e.trim()) : [],
        reporterNotes: formData.reporterNotes,
        aiAnalysis: aiAnalysis,
        timestamp: Date.now(),
        verified: false,
      }

      const result = await zgStorage.submitObituary(obituaryData)

      toast({
        title: "Obituary Submitted",
        description: "Your contract obituary has been submitted to 0G Storage",
      })

      // Reset form
      setFormData({
        contractAddress: "",
        chainId: "",
        title: "",
        description: "",
        causeOfDeath: "",
        evidence: "",
        reporterNotes: "",
      })
      setAiAnalysis(null)
      setActiveTab("basic")

      // Redirect to browse page
      router.push("/browse")
    } catch (error) {
      console.error("Submission failed:", error)
      setError("Failed to submit obituary. Please try again.")
      toast({
        title: "Submission Failed",
        description: "Unable to submit to 0G Storage",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WalletGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Submit Contract Obituary</h1>
            <p className="text-lg text-gray-300">Report a dead or exploited smart contract to protect the community</p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Skull className="h-5 w-5" />
                Contract Death Certificate
              </CardTitle>
              <CardDescription>Powered by 0G AI for enhanced analysis and verification</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="evidence">Evidence</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="mt-6">
                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contractAddress" className="text-white">
                          Contract Address *
                        </Label>
                        <Input
                          id="contractAddress"
                          placeholder="0x..."
                          value={formData.contractAddress}
                          onChange={(e) => handleInputChange("contractAddress", e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="chainId" className="text-white">
                          Blockchain *
                        </Label>
                        <Select value={formData.chainId} onValueChange={(value) => handleInputChange("chainId", value)}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select blockchain" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {CHAIN_OPTIONS.map((chain) => (
                              <SelectItem key={chain.value} value={chain.value} className="text-white">
                                {chain.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">
                        Obituary Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., 'DeFi Protocol XYZ - Exploited for $10M'"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="causeOfDeath" className="text-white">
                        Cause of Death *
                      </Label>
                      <Select
                        value={formData.causeOfDeath}
                        onValueChange={(value) => handleInputChange("causeOfDeath", value)}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select cause of death" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {CAUSE_OF_DEATH_OPTIONS.map((cause) => (
                            <SelectItem key={cause.value} value={cause.value} className="text-white">
                              <span className="flex items-center gap-2">
                                <span>{cause.icon}</span>
                                {cause.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="description" className="text-white">
                          Description
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateDescription}
                          disabled={isGeneratingDescription || !formData.contractAddress || !formData.causeOfDeath}
                          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 bg-transparent"
                        >
                          {isGeneratingDescription ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          Generate with AI
                        </Button>
                      </div>
                      <Textarea
                        id="description"
                        placeholder="Detailed description of what happened to this contract..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                        rows={6}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={analyzeContract}
                        disabled={isAnalyzing || !formData.contractAddress || !formData.chainId}
                        className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 bg-transparent"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4 mr-2" />
                        )}
                        Analyze with 0G AI
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setActiveTab("evidence")}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Next: Add Evidence
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-6">
                    {isAnalyzing && (
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Brain className="h-5 w-5 text-blue-400 animate-pulse" />
                            <span className="text-white">Analyzing contract with 0G AI...</span>
                          </div>
                          <Progress value={analysisProgress} className="h-2" />
                          <p className="text-sm text-gray-400 mt-2">
                            This may take a few moments while we analyze the contract code and transaction history.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {aiAnalysis && (
                      <div className="space-y-4">
                        <Card className="bg-slate-700/50 border-slate-600">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Shield className="h-5 w-5" />
                              Risk Assessment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-gray-300">Risk Score</span>
                              <Badge
                                variant={
                                  aiAnalysis.riskScore > 70
                                    ? "destructive"
                                    : aiAnalysis.riskScore > 40
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {aiAnalysis.riskScore}/100
                              </Badge>
                            </div>
                            <Progress value={aiAnalysis.riskScore} className="h-3" />
                            <p className="text-sm text-gray-400 mt-2">Analysis confidence: {aiAnalysis.confidence}%</p>
                          </CardContent>
                        </Card>

                        {aiAnalysis.vulnerabilities.length > 0 && (
                          <Card className="bg-slate-700/50 border-slate-600">
                            <CardHeader>
                              <CardTitle className="text-white flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-400" />
                                Vulnerabilities Found
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {aiAnalysis.vulnerabilities.map((vuln, index) => (
                                  <li key={index} className="flex items-start gap-2 text-gray-300">
                                    <span className="text-red-400 mt-1">•</span>
                                    {vuln}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {aiAnalysis.recommendations.length > 0 && (
                          <Card className="bg-slate-700/50 border-slate-600">
                            <CardHeader>
                              <CardTitle className="text-white flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                Recommendations
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {aiAnalysis.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2 text-gray-300">
                                    <span className="text-green-400 mt-1">•</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {!isAnalyzing && !aiAnalysis && (
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-6 text-center">
                          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-300 mb-4">No analysis available</p>
                          <p className="text-sm text-gray-400">
                            Go back to Basic Info and click "Analyze with 0G AI" to get detailed contract analysis.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("basic")}
                        className="border-slate-600"
                      >
                        Back to Basic Info
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab("evidence")}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Next: Add Evidence
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="evidence" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="evidence" className="text-white">
                        Evidence Links
                      </Label>
                      <Textarea
                        id="evidence"
                        placeholder="Provide links to evidence (one per line):&#10;- Transaction hashes&#10;- Block explorer links&#10;- Security reports&#10;- News articles&#10;- GitHub issues"
                        value={formData.evidence}
                        onChange={(e) => handleInputChange("evidence", e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white min-h-[120px]"
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reporterNotes" className="text-white">
                        Additional Notes
                      </Label>
                      <Textarea
                        id="reporterNotes"
                        placeholder="Any additional context or notes about this contract..."
                        value={formData.reporterNotes}
                        onChange={(e) => handleInputChange("reporterNotes", e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        rows={4}
                      />
                    </div>

                    {error && (
                      <Alert className="border-red-500/50 bg-red-500/10">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("analysis")}
                        className="border-slate-600"
                      >
                        Back to Analysis
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting to 0G...
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4 mr-2" />
                            Submit Obituary
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </WalletGuard>
  )
}
