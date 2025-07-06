"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, ExternalLink, Shield, Zap } from "lucide-react"
import Link from "next/link"
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
    reportedAt: Date.now() - 3600000, // 1 hour ago
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
    reportedAt: Date.now() - 7200000, // 2 hours ago
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
    reportedAt: Date.now() - 10800000, // 3 hours ago
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
]

export function RecentObituaries() {
  const [obituaries, setObituaries] = useState<ContractObituary[]>(mockObituaries)
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const fetchObituaries = async () => {
      try {
        const config = ZGStorageClient.getConfigurationStatus()

        if (config.isConfigured) {
          const connectionTest = await ZGStorageClient.testConnection()

          if (connectionTest.success) {
            const liveObituaries = await ZGStorageClient.getRecentObituaries(3)
            if (liveObituaries.length > 0) {
              setObituaries(liveObituaries)
              setIsLive(true)
            }
          }
        }
      } catch (error) {
        console.log("Using demo data for recent obituaries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchObituaries()
  }, [])

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
    const minutes = Math.floor(diff / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return "Just now"
    }
  }

  if (isLoading) {
    return (
      <div className="py-24 sm:py-32 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-600 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-600 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-600 rounded w-full"></div>
                    <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-24 sm:py-32 bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Recent Obituaries</h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">Latest contract deaths reported by our community</p>

          {/* Status Indicator */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-700/50 px-4 py-2 text-sm">
              {isLive ? (
                <>
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-green-400">Live Data</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400">Demo Data</span>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {obituaries.map((obituary) => (
            <Card
              key={obituary.id}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">
                      {obituary.contractName || formatAddress(obituary.contractAddress)}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {formatAddress(obituary.contractAddress)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {obituary.verificationStatus === "verified" && <CheckCircle className="h-4 w-4 text-green-400" />}
                    <Badge variant="outline" className={getRiskColor(obituary.riskLevel)}>
                      {obituary.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{obituary.description}</p>

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
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(obituary.reportedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{obituary.verificationCount} verifications</span>
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
                    className="flex-1 border-slate-600 text-white hover:bg-slate-700 bg-transparent"
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/browse">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              View All Obituaries
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
