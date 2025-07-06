"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Activity, Zap, Globe, TrendingUp, Users, AlertTriangle } from "lucide-react"
import { ZGStorageClient, type ZGContractObituary } from "@/lib/0g-storage-client"
import { useToast } from "@/hooks/use-toast"

export function RealTime0GKnowledgeGraph() {
  const [stats, setStats] = useState({
    totalObituaries: 0,
    totalVerifications: 0,
    chainDistribution: {} as Record<number, number>,
    reasonDistribution: {} as Record<string, number>,
    riskDistribution: {} as Record<string, number>,
  })
  const [recentUpdates, setRecentUpdates] = useState<ZGContractObituary[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadStats()
    loadRecentUpdates()
    setupRealTimeSubscription()
  }, [])

  const loadStats = async () => {
    try {
      const statsData = await ZGStorageClient.getStats()
      setStats(statsData)
    } catch (error) {
      console.error("Error loading 0G stats:", error)
      toast({
        title: "Failed to load statistics",
        description: "Could not connect to 0G knowledge graph",
        variant: "destructive",
      })
    }
  }

  const loadRecentUpdates = async () => {
    try {
      const recent = await ZGStorageClient.getRecentObituaries(5)
      setRecentUpdates(recent)
    } catch (error) {
      console.error("Error loading recent updates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealTimeSubscription = () => {
    try {
      const unsubscribe = ZGStorageClient.subscribeToUpdates(
        (obituary) => {
          setRecentUpdates((prev) => [obituary, ...prev.slice(0, 4)])
          setStats((prev) => ({
            ...prev,
            totalObituaries: prev.totalObituaries + 1,
          }))

          toast({
            title: "New obituary detected",
            description: `${obituary.contractName || "Contract"} marked as ${obituary.reason}`,
            variant: "destructive",
          })
        },
        { chainId: 1 }, // Ethereum mainnet
      )

      setIsConnected(true)

      // Cleanup on unmount
      return () => {
        unsubscribe()
        setIsConnected(false)
      }
    } catch (error) {
      console.error("Error setting up real-time subscription:", error)
      setIsConnected(false)

      // Show user-friendly error message
      toast({
        title: "Real-time connection failed",
        description: "Using cached data. Real-time updates are temporarily unavailable.",
        variant: "destructive",
      })
    }
  }

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      56: "BSC",
      42161: "Arbitrum",
      10: "Optimism",
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Connecting to 0G Knowledge Graph...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 0G Connection Status */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-400" />
              <div>
                <CardTitle className="text-white">0G Knowledge Graph</CardTitle>
                <CardDescription className="text-gray-300">
                  Decentralized storage for contract obituary data
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-600" : ""}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalObituaries.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Obituaries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalVerifications.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Verifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Object.keys(stats.chainDistribution).length}</div>
              <div className="text-sm text-gray-400">Chains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {isConnected ? <Activity className="h-6 w-6 mx-auto animate-pulse text-green-400" /> : "—"}
              </div>
              <div className="text-sm text-gray-400">Real-time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chain Distribution */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-400" />
            Chain Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.chainDistribution).map(([chainId, count]) => (
              <div key={chainId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-white">{getChainName(Number(chainId))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(stats.chainDistribution))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-300 text-sm w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Level Distribution */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
            Risk Level Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(stats.riskDistribution).map(([risk, count]) => (
              <div key={risk} className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    risk === "high" ? "text-red-400" : risk === "medium" ? "text-yellow-400" : "text-green-400"
                  }`}
                >
                  {count}
                </div>
                <div className="text-sm text-gray-400 capitalize">{risk} Risk</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Real-time Updates
            </CardTitle>
            {isConnected && (
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentUpdates.length > 0 ? (
            <div className="space-y-3">
              {recentUpdates.map((obituary) => (
                <div key={obituary.id} className="flex items-center justify-between bg-slate-900/30 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <div>
                      <p className="text-white font-medium">
                        {obituary.contractName || formatAddress(obituary.contractAddress)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {obituary.reason} • {new Date(obituary.reportedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      obituary.riskLevel === "high"
                        ? "destructive"
                        : obituary.riskLevel === "medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {obituary.riskLevel}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">No recent updates</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Alert */}
      {!isConnected && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to 0G Knowledge Graph. Real-time updates are disabled. Check your network connection and
            0G storage configuration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
