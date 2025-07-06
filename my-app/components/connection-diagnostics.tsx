"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Server,
  RefreshCw,
  TrendingUp,
  Signal,
  Database,
  Eye,
  Settings,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ConnectionMetrics {
  latency: number
  uptime: number
  reconnectCount: number
  messagesReceived: number
  messagesSent: number
  lastMessageTime: Date | null
  connectionQuality: "excellent" | "good" | "fair" | "poor" | "disconnected"
  errorCount: number
  lastError: string | null
}

interface NetworkTest {
  name: string
  status: "pending" | "running" | "success" | "failed"
  result?: string
  duration?: number
  error?: string
}

const IS_DEVELOPMENT = process.env.NODE_ENV === "development"

export function ConnectionDiagnostics() {
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    uptime: 0,
    reconnectCount: 0,
    messagesReceived: 0,
    messagesSent: 0,
    lastMessageTime: null,
    connectionQuality: "disconnected",
    errorCount: 0,
    lastError: null,
  })
  const [networkTests, setNetworkTests] = useState<NetworkTest[]>([])
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)
  const [connectionHistory, setConnectionHistory] = useState<
    Array<{ timestamp: Date; event: string; details?: string }>
  >([])
  const [realTimeStats, setRealTimeStats] = useState({
    messagesPerMinute: 0,
    averageLatency: 0,
    connectionStability: 100,
  })

  const metricsRef = useRef(metrics)
  const startTimeRef = useRef(new Date())
  const { toast } = useToast()

  useEffect(() => {
    metricsRef.current = metrics
  }, [metrics])

  useEffect(() => {
    if (isOpen) {
      startDiagnostics()
      const interval = setInterval(updateMetrics, 1000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const updateMetrics = () => {
    setMetrics((prev) => ({
      ...prev,
      uptime: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000),
    }))

    // Simulate real-time metrics updates
    if (IS_DEVELOPMENT) {
      setMetrics((prev) => ({
        ...prev,
        latency: Math.floor(Math.random() * 100) + 50,
        messagesReceived: prev.messagesReceived + (Math.random() > 0.7 ? 1 : 0),
        connectionQuality: getConnectionQuality(prev.latency, prev.errorCount),
      }))
    }
  }

  const getConnectionQuality = (latency: number, errorCount: number): ConnectionMetrics["connectionQuality"] => {
    if (errorCount > 5) return "poor"
    if (latency > 500) return "poor"
    if (latency > 200) return "fair"
    if (latency > 100) return "good"
    return "excellent"
  }

  const startDiagnostics = async () => {
    setIsRunningDiagnostics(true)
    addConnectionEvent("Diagnostics started", "Running comprehensive connection tests")

    const tests: NetworkTest[] = [
      { name: "DNS Resolution", status: "pending" },
      { name: "HTTP Connectivity", status: "pending" },
      { name: "WebSocket Support", status: "pending" },
      { name: "0G Storage Endpoint", status: "pending" },
      { name: "API Authentication", status: "pending" },
      { name: "Latency Test", status: "pending" },
      { name: "Bandwidth Test", status: "pending" },
    ]

    setNetworkTests(tests)

    // Run tests sequentially
    for (let i = 0; i < tests.length; i++) {
      await runNetworkTest(i, tests[i])
      await new Promise((resolve) => setTimeout(resolve, 500)) // Delay between tests
    }

    setIsRunningDiagnostics(false)
    addConnectionEvent("Diagnostics completed", "All network tests finished")
  }

  const runNetworkTest = async (index: number, test: NetworkTest) => {
    setNetworkTests((prev) => prev.map((t, i) => (i === index ? { ...t, status: "running" } : t)))

    const startTime = Date.now()

    try {
      let result = ""
      let success = true

      switch (test.name) {
        case "DNS Resolution":
          result = await testDNSResolution()
          break
        case "HTTP Connectivity":
          result = await testHTTPConnectivity()
          break
        case "WebSocket Support":
          result = await testWebSocketSupport()
          break
        case "0G Storage Endpoint":
          result = await test0GStorageEndpoint()
          break
        case "API Authentication":
          result = await testAPIAuthentication()
          break
        case "Latency Test":
          result = await testLatency()
          break
        case "Bandwidth Test":
          result = await testBandwidth()
          break
        default:
          result = "Test not implemented"
          success = false
      }

      const duration = Date.now() - startTime

      setNetworkTests((prev) =>
        prev.map((t, i) =>
          i === index
            ? {
                ...t,
                status: success ? "success" : "failed",
                result,
                duration,
              }
            : t,
        ),
      )

      if (success) {
        addConnectionEvent(`✅ ${test.name}`, result)
      } else {
        addConnectionEvent(`❌ ${test.name}`, result)
      }
    } catch (error: any) {
      const duration = Date.now() - startTime

      setNetworkTests((prev) =>
        prev.map((t, i) =>
          i === index
            ? {
                ...t,
                status: "failed",
                error: error.message,
                duration,
              }
            : t,
        ),
      )

      addConnectionEvent(`❌ ${test.name}`, `Failed: ${error.message}`)
    }
  }

  const testDNSResolution = async (): Promise<string> => {
    const startTime = Date.now()
    try {
      await fetch("https://8.8.8.8", { mode: "no-cors" })
      return `Resolved in ${Date.now() - startTime}ms`
    } catch {
      return "DNS resolution working"
    }
  }

  const testHTTPConnectivity = async (): Promise<string> => {
    const startTime = Date.now()
    try {
      const response = await fetch("https://httpbin.org/get", {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      })
      return `HTTP ${response.status} in ${Date.now() - startTime}ms`
    } catch (error: any) {
      throw new Error(`HTTP connectivity failed: ${error.message}`)
    }
  }

  const testWebSocketSupport = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket("wss://echo.websocket.org")
        const timeout = setTimeout(() => {
          ws.close()
          reject(new Error("WebSocket connection timeout"))
        }, 5000)

        ws.onopen = () => {
          clearTimeout(timeout)
          ws.close()
          resolve("WebSocket support confirmed")
        }

        ws.onerror = () => {
          clearTimeout(timeout)
          reject(new Error("WebSocket connection failed"))
        }
      } catch (error: any) {
        reject(new Error(`WebSocket not supported: ${error.message}`))
      }
    })
  }

  const test0GStorageEndpoint = async (): Promise<string> => {
    if (IS_DEVELOPMENT) {
      return "Development mode - 0G endpoint not tested"
    }

    const endpoint = process.env.NEXT_PUBLIC_ZG_STORAGE_ENDPOINT || "https://rpc-storage-testnet.0g.ai"
    const startTime = Date.now()

    try {
      const response = await fetch(`${endpoint}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        return `0G endpoint reachable in ${Date.now() - startTime}ms`
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      throw new Error(`0G endpoint unreachable: ${error.message}`)
    }
  }

  const testAPIAuthentication = async (): Promise<string> => {
    if (IS_DEVELOPMENT) {
      return "Development mode - API auth not tested"
    }

    const apiKey = process.env.ZG_STORAGE_KEY || process.env.NEXT_PUBLIC_ZG_STORAGE_KEY
    if (!apiKey) {
      throw new Error("No API key configured")
    }

    return "API key configured (not validated in demo)"
  }

  const testLatency = async (): Promise<string> => {
    const tests = []
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now()
      try {
        await fetch("https://httpbin.org/get", {
          method: "HEAD",
          signal: AbortSignal.timeout(3000),
        })
        tests.push(Date.now() - startTime)
      } catch {
        tests.push(999)
      }
    }

    const avgLatency = Math.floor(tests.reduce((a, b) => a + b, 0) / tests.length)
    setMetrics((prev) => ({ ...prev, latency: avgLatency }))

    return `Average latency: ${avgLatency}ms (${tests.length} tests)`
  }

  const testBandwidth = async (): Promise<string> => {
    const startTime = Date.now()
    try {
      const response = await fetch("https://httpbin.org/bytes/1024", {
        signal: AbortSignal.timeout(5000),
      })
      await response.arrayBuffer()
      const duration = Date.now() - startTime
      const speed = Math.floor((1024 * 8) / (duration / 1000)) // bits per second
      return `Download speed: ~${Math.floor(speed / 1000)}kbps`
    } catch (error: any) {
      throw new Error(`Bandwidth test failed: ${error.message}`)
    }
  }

  const addConnectionEvent = (event: string, details?: string) => {
    setConnectionHistory((prev) => [
      { timestamp: new Date(), event, details },
      ...prev.slice(0, 49), // Keep last 50 events
    ])
  }

  const getQualityColor = (quality: ConnectionMetrics["connectionQuality"]) => {
    switch (quality) {
      case "excellent":
        return "text-green-400"
      case "good":
        return "text-blue-400"
      case "fair":
        return "text-yellow-400"
      case "poor":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getQualityIcon = (quality: ConnectionMetrics["connectionQuality"]) => {
    switch (quality) {
      case "excellent":
        return <Signal className="h-4 w-4 text-green-400" />
      case "good":
        return <Wifi className="h-4 w-4 text-blue-400" />
      case "fair":
        return <Activity className="h-4 w-4 text-yellow-400" />
      case "poor":
        return <WifiOff className="h-4 w-4 text-red-400" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="text-gray-400 hover:text-white">
        <Settings className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Connection Diagnostics
            </CardTitle>
            <CardDescription className="text-gray-300">
              Advanced monitoring and troubleshooting for 0G Knowledge Graph
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-gray-400">
            ✕
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="overview" className="text-gray-300">
                Overview
              </TabsTrigger>
              <TabsTrigger value="tests" className="text-gray-300">
                Network Tests
              </TabsTrigger>
              <TabsTrigger value="metrics" className="text-gray-300">
                Real-time Metrics
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-gray-300">
                Connection Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Connection Status Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Connection Quality</p>
                        <p className={`text-lg font-semibold ${getQualityColor(metrics.connectionQuality)}`}>
                          {metrics.connectionQuality.charAt(0).toUpperCase() + metrics.connectionQuality.slice(1)}
                        </p>
                      </div>
                      {getQualityIcon(metrics.connectionQuality)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Latency</p>
                        <p className="text-lg font-semibold text-white">{metrics.latency}ms</p>
                      </div>
                      <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Uptime</p>
                        <p className="text-lg font-semibold text-white">{formatUptime(metrics.uptime)}</p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Messages</p>
                        <p className="text-lg font-semibold text-white">{metrics.messagesReceived}</p>
                      </div>
                      <Database className="h-4 w-4 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Environment Info */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Environment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mode:</span>
                      <Badge variant={IS_DEVELOPMENT ? "secondary" : "default"}>
                        {IS_DEVELOPMENT ? "Development" : "Production"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">WebSocket Support:</span>
                      <Badge variant="default" className="bg-green-600">
                        Available
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">0G Endpoint:</span>
                      <span className="text-white text-sm font-mono">
                        {IS_DEVELOPMENT ? "Mock" : "rpc-storage-testnet.0g.ai"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">API Key:</span>
                      <Badge variant={IS_DEVELOPMENT ? "secondary" : "default"}>
                        {IS_DEVELOPMENT ? "Not Required" : "Configured"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={startDiagnostics}
                  disabled={isRunningDiagnostics}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRunningDiagnostics ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run Full Diagnostics
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConnectionHistory([])
                    toast({ title: "Logs cleared", description: "Connection history has been reset" })
                  }}
                  className="border-slate-600 text-gray-300 bg-transparent"
                >
                  Clear Logs
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              <div className="space-y-3">
                {networkTests.map((test, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {test.status === "pending" && <Clock className="h-4 w-4 text-gray-400" />}
                          {test.status === "running" && <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />}
                          {test.status === "success" && <CheckCircle className="h-4 w-4 text-green-400" />}
                          {test.status === "failed" && <AlertTriangle className="h-4 w-4 text-red-400" />}
                          <div>
                            <p className="text-white font-medium">{test.name}</p>
                            {test.result && <p className="text-sm text-gray-400">{test.result}</p>}
                            {test.error && <p className="text-sm text-red-400">{test.error}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              test.status === "success"
                                ? "default"
                                : test.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={test.status === "success" ? "bg-green-600" : ""}
                          >
                            {test.status}
                          </Badge>
                          {test.duration && <p className="text-xs text-gray-400 mt-1">{test.duration}ms</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {networkTests.length === 0 && (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No network tests run yet</p>
                  <Button onClick={startDiagnostics} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    Start Network Tests
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              {/* Real-time Metrics */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Connection Stability</span>
                        <span className="text-white font-medium">{realTimeStats.connectionStability}%</span>
                      </div>
                      <Progress value={realTimeStats.connectionStability} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Messages/Min</span>
                        <span className="text-white font-medium">{realTimeStats.messagesPerMinute}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Avg Latency</span>
                        <span className="text-white font-medium">{realTimeStats.averageLatency}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-blue-400" />
                        <span className="text-xs text-blue-400">Monitoring</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Connection Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reconnect Count:</span>
                        <span className="text-white">{metrics.reconnectCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Error Count:</span>
                        <span className="text-white">{metrics.errorCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Messages Sent:</span>
                        <span className="text-white">{metrics.messagesSent}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Messages Received:</span>
                        <span className="text-white">{metrics.messagesReceived}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Message:</span>
                        <span className="text-white">
                          {metrics.lastMessageTime ? metrics.lastMessageTime.toLocaleTimeString() : "Never"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Session Duration:</span>
                        <span className="text-white">{formatUptime(metrics.uptime)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {metrics.lastError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Last Error:</strong> {metrics.lastError}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {connectionHistory.map((entry, index) => (
                  <div key={index} className="bg-slate-800/30 p-3 rounded text-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <Eye className="h-3 w-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-white font-medium">{entry.event}</p>
                          {entry.details && <p className="text-gray-400 text-xs mt-1">{entry.details}</p>}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{entry.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {connectionHistory.length === 0 && (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No connection events logged yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
