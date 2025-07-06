"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Loader2, AlertTriangle, Shield, ExternalLink, Copy } from "lucide-react"
import { GraphClient, type ContractObituary } from "@/lib/graph-client"
import { useToast } from "@/hooks/use-toast"

interface ContractSearchProps {
  onObituaryFound?: (obituary: ContractObituary | null) => void
  placeholder?: string
  autoSearch?: boolean
}

export function ContractSearch({
  onObituaryFound,
  placeholder = "Enter contract address (0x...)",
  autoSearch = true,
}: ContractSearchProps) {
  const [address, setAddress] = useState("")
  const [obituary, setObituary] = useState<ContractObituary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()

  const isValidAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr)
  }

  const searchObituary = useCallback(
    async (searchAddress: string) => {
      if (!isValidAddress(searchAddress)) {
        setError("Please enter a valid Ethereum address")
        return
      }

      setIsLoading(true)
      setError(null)
      setHasSearched(true)

      try {
        // Use mock data for demo - replace with GraphClient.getObituaryByAddress in production
        const result = await GraphClient.getMockObituaryByAddress(searchAddress)
        setObituary(result)
        onObituaryFound?.(result)

        if (result) {
          toast({
            title: "Contract obituary found",
            description: `Found death certificate for ${result.contractName || "contract"}`,
            variant: "destructive",
          })
        }
      } catch (err) {
        setError("Failed to search contract obituary")
        console.error("Search error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [onObituaryFound, toast],
  )

  const handleSearch = () => {
    if (address.trim()) {
      searchObituary(address.trim())
    }
  }

  const handleInputChange = (value: string) => {
    setAddress(value)
    setError(null)

    // Auto-search when a complete address is entered
    if (autoSearch && isValidAddress(value)) {
      searchObituary(value)
    }
  }

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr)
    toast({
      title: "Address copied",
      description: "Contract address copied to clipboard",
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "exploited":
        return "🔥"
      case "deprecated":
        return "📦"
      case "abandoned":
        return "👻"
      case "rugpull":
        return "💸"
      case "malicious":
        return "☠️"
      default:
        return "⚠️"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={address}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 bg-slate-900/50 border-slate-600 text-white"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isLoading || !address.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              <span className="text-gray-300">Searching knowledge graph...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {hasSearched && !isLoading && !obituary && !error && (
        <Card className="bg-green-900/20 border-green-700/50">
          <CardContent className="py-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Contract appears safe</h3>
              <p className="text-gray-300">No death certificate found for this contract address.</p>
              <Badge variant="outline" className="mt-3 border-green-500 text-green-400">
                ✓ No obituary found
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Obituary Found */}
      {obituary && (
        <Card className="bg-red-900/20 border-red-700/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getReasonIcon(obituary.reason)}</span>
                  <div>
                    <CardTitle className="text-white">{obituary.contractName || "Unknown Contract"}</CardTitle>
                    <CardDescription className="text-red-300 font-mono text-sm">
                      {obituary.contractAddress}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">⚠️ {obituary.reason.toUpperCase()}</Badge>
                  <Badge variant={getRiskColor(obituary.riskLevel) as any}>
                    {obituary.riskLevel.toUpperCase()} RISK
                  </Badge>
                  {obituary.isVerified && (
                    <Badge variant="outline" className="border-blue-500 text-blue-400">
                      ✓ VERIFIED
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(obituary.contractAddress)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://etherscan.io/address/${obituary.contractAddress}`, "_blank")}
                  className="text-gray-400 hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Description</h4>
                <p className="text-gray-300">{obituary.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Last Safe Block:</span>
                  <p className="text-white font-mono">{obituary.lastSafeBlock}</p>
                </div>
                <div>
                  <span className="text-gray-400">Verifications:</span>
                  <p className="text-white">{obituary.verifications}</p>
                </div>
                <div>
                  <span className="text-gray-400">Reported By:</span>
                  <p className="text-white font-mono">{formatAddress(obituary.reportedBy)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Reported:</span>
                  <p className="text-white">{new Date(obituary.reportedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {obituary.alternatives.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Safer Alternatives</h4>
                  <div className="flex flex-wrap gap-2">
                    {obituary.alternatives.map((alt, index) => (
                      <Badge key={index} variant="outline" className="border-green-500 text-green-400 font-mono">
                        {formatAddress(alt)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {obituary.proofAttachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Proof Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {obituary.proofAttachments.map((proof, index) => (
                      <Badge key={index} variant="outline" className="border-blue-500 text-blue-400 font-mono">
                        {proof.slice(0, 10)}...
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This contract has been marked as dangerous. Interacting with it may result
                  in loss of funds.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
