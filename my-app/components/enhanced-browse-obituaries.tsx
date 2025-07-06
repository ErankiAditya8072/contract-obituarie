"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ExternalLink, Bug, Archive, AlertTriangle, Zap, Loader2 } from "lucide-react"
import { GraphClient, type ContractObituary } from "@/lib/graph-client"
import { ContractSearch } from "@/components/contract-search"

const reasonIcons = {
  exploited: Bug,
  deprecated: Archive,
  abandoned: AlertTriangle,
  rugpull: Zap,
  malicious: AlertTriangle,
}

const reasonColors = {
  exploited: "destructive",
  deprecated: "secondary",
  abandoned: "destructive",
  rugpull: "destructive",
  malicious: "destructive",
}

export function EnhancedBrowseObituaries() {
  const [obituaries, setObituaries] = useState<ContractObituary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterReason, setFilterReason] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecentObituaries()
  }, [])

  const loadRecentObituaries = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use mock data for demo - replace with GraphClient.getRecentObituaries in production
      const mockObituaries = await GraphClient.getMockObituaryByAddress("") // This will return null, so we'll use hardcoded data

      // Mock data for demonstration
      const mockData: ContractObituary[] = [
        {
          id: "1",
          contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
          contractName: "FlashLoan Protocol V1",
          reason: "exploited",
          description: "Reentrancy vulnerability exploited for $1.2M. Funds drained through flash loan attack.",
          lastSafeBlock: "18234567",
          reportedAt: "2024-01-15T10:30:00Z",
          reportedBy: "0xabcd...efgh",
          verifications: 23,
          alternatives: ["0xabcdefgh...1234", "0x9876543...abcd"],
          proofAttachments: ["QmX1Y2Z3...", "QmA4B5C6..."],
          isVerified: true,
          riskLevel: "high",
        },
        {
          id: "2",
          contractAddress: "0xabcdefghijklmnopqrstuvwxyz1234567890abcdef",
          contractName: "Legacy DEX Router",
          reason: "deprecated",
          description: "Officially deprecated by team. Use V2 router for all new integrations.",
          lastSafeBlock: "18156789",
          reportedAt: "2024-01-10T14:20:00Z",
          reportedBy: "0x1234...5678",
          verifications: 45,
          alternatives: ["0x1234abcd...efgh"],
          proofAttachments: ["QmP7Q8R9..."],
          isVerified: true,
          riskLevel: "medium",
        },
        {
          id: "3",
          contractAddress: "0x9876543210fedcba9876543210fedcba98765432",
          contractName: "Yield Farm Contract",
          reason: "abandoned",
          description: "Team abandoned project without notice. Funds locked, no admin keys.",
          lastSafeBlock: "17998234",
          reportedAt: "2024-01-05T09:15:00Z",
          reportedBy: "0x5678...9abc",
          verifications: 12,
          alternatives: [],
          proofAttachments: ["QmD1E2F3...", "QmG4H5I6...", "QmJ7K8L9..."],
          isVerified: false,
          riskLevel: "high",
        },
      ]

      setObituaries(mockData)
    } catch (err) {
      setError("Failed to load obituaries")
      console.error("Error loading obituaries:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadRecentObituaries()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await GraphClient.searchObituaries(searchTerm)
      setObituaries(results)
    } catch (err) {
      setError("Failed to search obituaries")
      console.error("Search error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredObituaries = obituaries.filter((obituary) => {
    const matchesFilter = filterReason === "all" || obituary.reason === filterReason
    return matchesFilter
  })

  const sortedObituaries = [...filteredObituaries].sort((a, b) => {
    switch (sortBy) {
      case "verified":
        return b.verifications - a.verifications
      case "dangerous":
        const riskOrder = { high: 3, medium: 2, low: 1 }
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
      case "recent":
      default:
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    }
  })

  return (
    <div className="space-y-8">
      {/* Contract Address Search */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Search Specific Contract</CardTitle>
          <CardDescription className="text-gray-300">
            Enter a contract address to check if it has a death certificate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContractSearch />
        </CardContent>
      </Card>

      {/* Browse All Obituaries */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Browse All Obituaries</CardTitle>
          <CardDescription className="text-gray-300">
            Search and filter through all reported contract deaths
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by contract name, address, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="exploited">Exploited</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                  <SelectItem value="rugpull">Rug Pull</SelectItem>
                  <SelectItem value="malicious">Malicious</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="verified">Most Verified</SelectItem>
                  <SelectItem value="dangerous">Most Dangerous</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">Loading obituaries from The Graph...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="bg-red-900/20 border-red-700/50">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-4" />
            <p className="text-red-300">{error}</p>
            <Button
              onClick={loadRecentObituaries}
              variant="outline"
              className="mt-4 border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          {sortedObituaries.map((obituary) => {
            const ReasonIcon = reasonIcons[obituary.reason as keyof typeof reasonIcons]
            return (
              <Card
                key={obituary.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <ReasonIcon className="h-5 w-5 text-red-400" />
                        <CardTitle className="text-white">{obituary.contractName}</CardTitle>
                        <Badge variant={reasonColors[obituary.reason as keyof typeof reasonColors] as any}>
                          {obituary.reason}
                        </Badge>
                        {obituary.isVerified && (
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-gray-300 font-mono text-sm">
                        {obituary.contractAddress}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{obituary.description}</p>

                  {obituary.alternatives.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-2">Safer Alternatives:</h4>
                      <div className="flex flex-wrap gap-2">
                        {obituary.alternatives.map((alt, index) => (
                          <Badge key={index} variant="outline" className="border-green-500 text-green-400 font-mono">
                            {alt.slice(0, 10)}...
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span>Block: {obituary.lastSafeBlock}</span>
                      <span>•</span>
                      <span>{obituary.verifications} verifications</span>
                      <span>•</span>
                      <span>{obituary.proofAttachments.length} proofs</span>
                      <span>•</span>
                      <Badge variant={obituary.riskLevel === "high" ? "destructive" : "secondary"} className="text-xs">
                        {obituary.riskLevel} risk
                      </Badge>
                    </div>
                    <span>Reported: {new Date(obituary.reportedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {sortedObituaries.length === 0 && !isLoading && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No obituaries found</h3>
                <p className="text-gray-400">Try adjusting your search terms or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
