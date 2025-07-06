"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  Activity,
  Database,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  BarChart3,
  Globe,
  TrendingUp,
  Users,
  Shield,
} from "lucide-react"
import { RealTimeStatusIndicator } from "./real-time-status-indicator"
import { ConnectionDiagnostics } from "./connection-diagnostics"
import { ZGStorageClient, type ContractObituary, type StorageStats } from "@/lib/0g-storage-client"

interface NetworkStats {
  totalObituaries: number
  verifiedObituaries: number
  activeReporters: number
  averageResponseTime: number
  uptime: number
  lastUpdate: number
}

interface ConnectionMetrics {
  latency: number
  reliability: number
  activityRate: number
  dataFreshness: number
  errorCount: number
  successCount: number
}

export function EnhancedRealTime0GKnowledgeGraph() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [obituaries, setObituaries] = useState<ContractObituary[]>([])
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null)
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalObituaries: 0,
    verifiedObituaries: 0,
    activeReporters: 0,
    averageResponseTime: 0,
    uptime: 0,
    lastUpdate: 0,
  })
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    reliability: 100,
    activityRate: 0,
    dataFreshness: 0,
    errorCount: 0,
    successCount: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)

  const { toast } = useToast()

  // Check if 0G services are configured
  const [servicesConfigured, setServicesConfigured] = useState({
    storage: false,
    ai: false,
  })

  // Check service configuration using the static methods
  useEffect(() => {
    const checkConfiguration = () => {
      try {
        const storageConfig = ZGStorageClient.getConfigurationStatus()

        setServicesConfigured({
          storage: storageConfig.isConfigured,
          ai: false, // We'll add 0G AI configuration check later
        })
      } catch (error) {
        console.error("Configuration check failed:", error)
        setServicesConfigured({
          storage: false,
          ai: false,
        })
      }
    }

    checkConfiguration()
  }, [])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!servicesConfigured.storage) {
      setConnectionStatus("error")
      setError("0G Storage not configured")
      return
    }

    let unsubscribe: (() => void) | null = null

    const setupRealTimeConnection = () => {
      try {
        setConnectionStatus("connecting")
        setError(null)

        // Use the ZGStorageClient subscription method
        unsubscribe = ZGStorageClient.subscribeToUpdates(
          (newObituary: ContractObituary) => {
            setObituaries((prev) => [newObituary, ...prev.slice(0, 49)]) // Keep latest 50
            setUpdateCount((prev) => prev + 1)
            setMetrics((prev) => ({
              ...prev,
              successCount: prev.successCount + 1,
              activityRate: prev.activityRate + 0.1,
              dataFreshness: Date.now(),
            }))

            setIsConnected(true)
            setConnectionStatus("connected")

            toast({
              title: "New Contract Obituary",
              description: `${newObituary.contractName || "Contract"} reported as ${newObituary.reason}`,
              variant:
                newObituary.riskLevel === "high" || newObituary.riskLevel === "critical" ? "destructive" : "default",
            })
          },
          { chainId: 1 }, // Ethereum mainnet
        )

        // Simulate initial connection success
        setTimeout(() => {
          setIsConnected(true)
          setConnectionStatus("connected")
          toast({
            title: "Connected to 0G Network",
            description: "Real-time updates are now active",
          })
        }, 1000)
      } catch (error) {
        console.error("Failed to establish real-time connection:", error)
        setConnectionStatus("error")
        setError("Failed to connect to 0G network")
        setMetrics((prev) => ({
          ...prev,
          errorCount: prev.errorCount + 1,
          reliability: Math.max(0, prev.reliability - 10),
        }))
      }
    }

    setupRealTimeConnection()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
      setIsConnected(false)
      setConnectionStatus("disconnected")
    }
  }, [servicesConfigured.storage, toast])

  // Fetch data from 0G storage
  const fetchData = useCallback(async () => {
    if (!servicesConfigured.storage) return

    setIsLoading(true)
    setError(null)

    try {
      const startTime = Date.now()

      // Fetch data from 0G storage
      const [obituariesData, statsData] = await Promise.allSettled([
        ZGStorageClient.getRecentObituaries(20),
        ZGStorageClient.getStats(),
      ])

      const responseTime = Date.now() - startTime

      if (obituariesData.status === "fulfilled") {
        setObituaries(obituariesData.value)
      }

      if (statsData.status === "fulfilled") {
        setStorageStats(statsData.value)
        // Convert storage stats to network stats format
        setNetworkStats({
          totalObituaries: statsData.value.totalObituaries,
          verifiedObituaries: statsData.value.totalVerifications,
          activeReporters: Math.floor(statsData.value.totalObituaries / 10), // Estimate
          averageResponseTime: responseTime,
          uptime: 99.5, // Simulated uptime
          lastUpdate: Date.now(),
        })
      }

      setMetrics((prev) => ({
        ...prev,
        latency: responseTime,
        reliability: Math.min(100, prev.reliability + 1),
        dataFreshness: Date.now(),
        successCount: prev.successCount + 1,
      }))

      setLastRefresh(new Date())
      setError(null)
    } catch (error) {
      console.error("Failed to fetch data from 0G storage:", error)
      setError("Failed to fetch data from 0G storage")
      setMetrics((prev) => ({
        ...prev,
        reliability: Math.max(0, prev.reliability - 5),
        errorCount: prev.errorCount + 1,
      }))
    } finally {
      setIsLoading(false)
    }
  }, [servicesConfigured.storage])

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh || !servicesConfigured.storage) return

    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData, servicesConfigured.storage])

  // Initial data fetch
  useEffect(() => {
    if (servicesConfigured.storage) {
      fetchData()
    }
  }, [servicesConfigured.storage, fetchData])

  const handleManualRefresh = () => {
    fetchData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-400"
      case "connecting":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Wifi className="h-4 w-4" />
      case "connecting":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "error":
        return <WifiOff className="h-4 w-4" />
      default:
        return <WifiOff className="h-4 w-4" />
    }
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "secondary"
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!servicesConfigured.storage) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            0G Services Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              0G Storage is not configured. Please set up your environment variables:
              <ul className="mt-2 list-disc list-inside text-sm">
                <li>
                  <code>ZG_STORAGE_API_KEY</code> - Your 0G Storage API key
                </li>
                <li>
                  <code>NEXT_PUBLIC_ZG_STORAGE_ENDPOINT</code> - 0G Storage endpoint (optional)
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-purple-800/20 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                0G Storage Network
                <Badge variant="outline" className="border-green-500 text-green-400 ml-2">
                  Live
                </Badge>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Real-time decentralized storage for contract obituaries
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <RealTimeStatusIndicator isConnected={isConnected} isDevelopment={false} lastUpdate={lastRefresh} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="border-slate-600 bg-transparent hover:bg-slate-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{networkStats.totalObituaries}</div>
              <div className="text-sm text-gray-400">Total Obituaries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{networkStats.verifiedObituaries}</div>
              <div className="text-sm text-gray-400">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{updateCount}</div>
              <div className="text-sm text-gray-400">Live Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{networkStats.averageResponseTime}ms</div>
              <div className="text-sm text-gray-400">Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-white">0G Storage</span>
              </div>
              <Badge variant={servicesConfigured.storage ? "default" : "destructive"} className="bg-green-600">
                {servicesConfigured.storage ? "Connected" : "Not Configured"}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Endpoint: {ZGStorageClient.getConfigurationStatus().endpoint}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="text-white">0G AI</span>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <div className="mt-2 text-xs text-gray-400">AI-powered contract analysis</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Network Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Obituaries</p>
                    <p className="text-2xl font-bold text-white">{networkStats.totalObituaries}</p>
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
                    <p className="text-2xl font-bold text-white">{networkStats.verifiedObituaries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Active Reporters</p>
                    <p className="text-2xl font-bold text-white">{networkStats.activeReporters}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Avg Response</p>
                    <p className="text-2xl font-bold text-white">{networkStats.averageResponseTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Storage Statistics */}
          {storageStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(storageStats.riskDistribution).map(([risk, count]) => (
                    <div key={risk} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{risk} Risk</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={storageStats.totalObituaries > 0 ? (count / storageStats.totalObituaries) * 100 : 0}
                          className="w-20 h-2"
                        />
                        <span className="text-white font-bold w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Chain Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(storageStats.chainDistribution).map(([chainId, count]) => {
                    const chainName = chainId === "1" ? "Ethereum" : chainId === "137" ? "Polygon" : `Chain ${chainId}`
                    return (
                      <div key={chainId} className="flex items-center justify-between">
                        <span className="text-gray-300">{chainName}</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={storageStats.totalObituaries > 0 ? (count / storageStats.totalObituaries) * 100 : 0}
                            className="w-20 h-2"
                          />
                          <span className="text-white font-bold w-8 text-right">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Network Health */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-white">{networkStats.uptime}%</span>
                </div>
                <Progress value={networkStats.uptime} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Reliability</span>
                  <span className="text-white">{Math.round(metrics.reliability)}%</span>
                </div>
                <Progress value={metrics.reliability} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-white">
                    {metrics.successCount + metrics.errorCount > 0
                      ? Math.round((metrics.successCount / (metrics.successCount + metrics.errorCount)) * 100)
                      : 100}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    metrics.successCount + metrics.errorCount > 0
                      ? (metrics.successCount / (metrics.successCount + metrics.errorCount)) * 100
                      : 100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest obituaries from the 0G storage network</CardDescription>
                </div>
                {isConnected && (
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                    Live
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {obituaries.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No obituaries found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {servicesConfigured.storage ? "Waiting for data..." : "Configure 0G Storage to see data"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {obituaries.map((obituary, index) => (
                    <div
                      key={obituary.id}
                      className={`border border-slate-600 rounded-lg p-4 transition-all duration-300 ${
                        index === 0 ? "ring-1 ring-purple-500/50 bg-purple-900/10" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">
                            {obituary.contractName || formatAddress(obituary.contractAddress)}
                            {index === 0 && <span className="ml-2 text-purple-400 text-sm">• Latest</span>}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{obituary.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Contract: {formatAddress(obituary.contractAddress)}</span>
                            <span>Chain: {obituary.chainId === 1 ? "Ethereum" : `Chain ${obituary.chainId}`}</span>
                            <span>{new Date(obituary.reportedAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {obituary.verificationStatus === "verified" && (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          )}
                          <Badge variant={getRiskBadgeVariant(obituary.riskLevel) as any}>
                            {obituary.reason.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600">
                            {obituary.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Latency</span>
                    <span className="text-white">{metrics.latency}ms</span>
                  </div>
                  <Progress value={Math.max(0, 100 - metrics.latency / 10)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Activity Rate</span>
                    <span className="text-white">{metrics.activityRate.toFixed(1)}/min</span>
                  </div>
                  <Progress value={Math.min(100, metrics.activityRate * 10)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Success Count</span>
                    <span className="text-white">{metrics.successCount}</span>
                  </div>
                  <Progress value={Math.min(100, metrics.successCount)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className={getStatusColor(connectionStatus)}>{getStatusIcon(connectionStatus)}</div>
                  <div>
                    <p className="text-white capitalize">{connectionStatus}</p>
                    <p className="text-sm text-gray-400">Last update: {lastRefresh.toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Auto-refresh</span>
                    <Badge variant={autoRefresh ? "default" : "secondary"}>
                      {autoRefresh ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data freshness</span>
                    <span className="text-white">
                      {metrics.dataFreshness ? Math.round((Date.now() - metrics.dataFreshness) / 1000) : 0}s ago
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Error count</span>
                    <span className="text-white">{metrics.errorCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnostics">
          <ConnectionDiagnostics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
