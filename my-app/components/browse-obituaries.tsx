"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, AlertTriangle, CheckCircle, Clock, ExternalLink, TrendingUp, Users, Database, Zap } from "lucide-react"
import { ZGStorageClient, type ContractObituary } from "@/lib/0g-storage-client"

const mockObituaries: ContractObituary[] = [
  {
    id: "1",
    contractAddress: "0x1234567890123456789012345678901234567890",
    contractName: "FlashLoan Exploit Contract",
    reason: "exploited",
    description: "Contract exploited via flash loan attack, draining $2.3M from liquidity pools",
    evidence: ["Transaction hash: 0xabc123...", "Block explorer link", "Security audit report"],
    reportedBy: "0xsecurity_researcher",
    reportedAt: Date.now() - 3600000,
    verificationStatus: "verified",
    verificationCount: 12,
    riskLevel: "critical",
    tags: ["flash-loan", "defi", "exploit"],
    chainId: 1,
    blockNumber: 18500000,
    transactionHash: "0xabc123def456...",
    metadata: {
      exploitAmount: "2300000",
      affectedUsers: 450,
      aiGenerated: false,
    },
  },
  {
    id: "2",
    contractAddress: "0x2345678901234567890123456789012345678901",
    contractName: "Abandoned Token Contract",
    reason: "abandoned",
    description: "Token contract abandoned by developers, no updates for 18 months",
    evidence: ["GitHub repository archived", "Last commit 18 months ago", "Team social media inactive"],
    reportedBy: "0xcommunity_member",
    reportedAt: Date.now() - 7200000,
    verificationStatus: "pending",
    verificationCount: 3,
    riskLevel: "medium",
    tags: ["abandoned", "token", "inactive"],
    chainId: 1,
    metadata: {
      affectedUsers: 1200,
      aiGenerated: true,
      similarityScore: 0.85,
    },
  },
  {
    id: "3",
    contractAddress: "0x3456789012345678901234567890123456789012",
    contractName: "Rug Pull NFT Collection",
    reason: "rugpull",
    description: "NFT collection creators disappeared with funds after mint, website taken down",
    evidence: ["Website offline", "Social media deleted", "Funds withdrawn"],
    reportedBy: "0xnft_tracker",
    reportedAt: Date.now() - 10800000,
    verificationStatus: "verified",
    verificationCount: 28,
    riskLevel: "high",
    tags: ["rugpull", "nft", "scam"],
    chainId: 1,
    metadata: {
      exploitAmount: "850000",
      affectedUsers: 2100,
      aiGenerated: false,
    },
  },
  {
    id: "4",
    contractAddress: "0x4567890123456789012345678901234567890123",
    contractName: "Deprecated DeFi Protocol",
    reason: "deprecated",
    description: "Old version of DeFi protocol with known vulnerabilities, replaced by v2",
    evidence: ["Official deprecation notice", "Migration guide", "Security advisory"],
    reportedBy: "0xprotocol_team",
    reportedAt: Date.now() - 14400000,
    verificationStatus: "verified",
    verificationCount: 8,
    riskLevel: "low",
    tags: ["deprecated", "defi", "migration"],
    chainId: 1,
    metadata: {
      affectedUsers: 500,
      aiGenerated: false,
    },
  },
  {
    id: "5",
    contractAddress: "0x5678901234567890123456789012345678901234",
    contractName: "Malicious Phishing Contract",
    reason: "malicious",
    description: "Contract designed to steal user funds through fake token approvals",
    evidence: ["Malicious code analysis", "Victim reports", "Blockchain forensics"],
    reportedBy: "0xsecurity_team",
    reportedAt: Date.now() - 18000000,
    verificationStatus: "verified",
    verificationCount: 35,
    riskLevel: "critical",
    tags: ["malicious", "phishing", "scam"],
    chainId: 1,
    metadata: {
      exploitAmount: "1200000",
      affectedUsers: 800,
      aiGenerated: false,
    },
  },
]

export function BrowseObituaries() {
  const [obituaries, setObituaries] = useState<ContractObituary[]>(mockObituaries)
  const [filteredObituaries, setFilteredObituaries] = useState<ContractObituary[]>(mockObituaries)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [selectedReason, setSelectedReason] = useState<string>("all")
  const [selectedChain, setSelectedChain] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const fetchObituaries = async () => {
      try {
        const config = ZGStorageClient.getConfigurationStatus()

        if (config.isConfigured) {
          const connectionTest = await ZGStorageClient.testConnection()

          if (connectionTest.success) {
            const liveObituaries = await ZGStorageClient.getRecentObituaries(20)
            if (liveObituaries.length > 0) {
              setObituaries(liveObituaries)
              setFilteredObituaries(liveObituaries)
              setIsLive(true)
            }
          }
        }
      } catch (error) {
        console.log("Using demo data for browse obituaries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchObituaries()
  }, [])

  useEffect(() => {
    let filtered = obituaries

    if (searchQuery) {
      filtered = filtered.filter(
        (obituary) =>
          obituary.contractAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          obituary.contractName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          obituary.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          obituary.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedRisk !== "all") {
      filtered = filtered.filter((obituary) => obituary.riskLevel === selectedRisk)
    }

    if (selectedReason !== "all") {
      filtered = filtered.filter((obituary) => obituary.reason === selectedReason)
    }

    if (selectedChain !== "all") {
      filtered = filtered.filter((obituary) => obituary.chainId.toString() === selectedChain)
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((obituary) => obituary.verificationStatus === selectedStatus)
    }

    setFilteredObituaries(filtered)
  }, [obituaries, searchQuery, selectedRisk, selectedReason, selectedChain, selectedStatus])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-400 bg-red-400/10 border-red-400"
      case "high":
        return "text-orange-400 bg-orange-400/10 border-orange-400"
      case "medium":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400"
      case "low":
        return "text-green-400 bg-green-400/10 border-green-400"
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400"
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "exploited":
        return "text-red-400 bg-red-400/10"
      case "rugpull":
        return "text-orange-400 bg-orange-400/10"
      case "abandoned":
        return "text-yellow-400 bg-yellow-400/10"
      case "deprecated":
        return "text-blue-400 bg-blue-400/10"
      case "malicious":
        return "text-purple-400 bg-purple-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else {
      return "Just now"
    }
  }

  const getStats = () => {
    const total = obituaries.length
    const verified = obituaries.filter((o) => o.verificationStatus === "verified").length
    const critical = obituaries.filter((o) => o.riskLevel === "critical").length
    const totalLoss = obituaries.reduce((sum, o) => {
      const amount = o.metadata?.exploitAmount ? Number.parseInt(o.metadata.exploitAmount) : 0
      return sum + amount
    }, 0)

    return { total, verified, critical, totalLoss }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-600 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">Browse Contract Obituaries</h1>
          <div className="flex items-center gap-2">
            {isLive ? (
              <>
                <Database className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">Live Data</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">Demo Data</span>
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              </>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Obituaries</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Verified</p>
                  <p className="text-2xl font-bold text-white">{stats.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-sm text-gray-400">Critical Risk</p>
                  <p className="text-2xl font-bold text-white">{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Total Loss</p>
                  <p className="text-2xl font-bold text-white">${(stats.totalLoss / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by address, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <Select value={selectedRisk} onValueChange={setSelectedRisk}>
            <SelectTrigger className="w-full md:w-40 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedReason} onValueChange={setSelectedReason}>
            <SelectTrigger className="w-full md:w-40 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">All Reasons</SelectItem>
              <SelectItem value="exploited">Exploited</SelectItem>
              <SelectItem value="rugpull">Rug Pull</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
              <SelectItem value="deprecated">Deprecated</SelectItem>
              <SelectItem value="malicious">Malicious</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-40 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredObituaries.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No obituaries found</h3>
              <p className="text-gray-400">Try adjusting your search criteria or filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredObituaries.map((obituary) => (
            <Card
              key={obituary.id}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {obituary.contractName || formatAddress(obituary.contractAddress)}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{formatAddress(obituary.contractAddress)}</p>
                    <p className="text-gray-300 text-sm line-clamp-2">{obituary.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {obituary.verificationStatus === "verified" && <CheckCircle className="h-4 w-4 text-green-400" />}
                    <Badge variant="outline" className={getRiskColor(obituary.riskLevel)}>
                      {obituary.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className={getReasonColor(obituary.reason)}>
                    {obituary.reason.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-300">
                    Chain {obituary.chainId}
                  </Badge>
                  {obituary.metadata?.aiGenerated && (
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      AI
                    </Badge>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400 ml-auto">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(obituary.reportedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{obituary.verificationCount} verifications</span>
                    </div>
                  </div>
                </div>

                {obituary.metadata?.exploitAmount && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 font-medium">
                        ${Number.parseInt(obituary.metadata.exploitAmount).toLocaleString()} lost
                      </span>
                    </div>
                    {obituary.metadata.affectedUsers && (
                      <p className="text-red-300 text-xs mt-1">
                        {obituary.metadata.affectedUsers.toLocaleString()} users affected
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                  >
                    View Details
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                  {obituary.verificationStatus === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-400 hover:bg-green-600/10 bg-transparent"
                    >
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600/10 bg-transparent"
                  >
                    View on Explorer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination would go here */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          Showing {filteredObituaries.length} of {obituaries.length} obituaries
        </p>
      </div>
    </div>
  )
}
