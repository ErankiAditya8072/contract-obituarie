"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Activity, WifiOff, Clock } from "lucide-react"

interface RealTimeStatusProps {
  isConnected: boolean
  isDevelopment?: boolean
  lastUpdate?: Date
}

export function RealTimeStatusIndicator({ isConnected, isDevelopment = false, lastUpdate }: RealTimeStatusProps) {
  const [pulseCount, setPulseCount] = useState(0)

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setPulseCount((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isConnected])

  if (isDevelopment) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-yellow-500 text-yellow-400">
          <Clock className="h-3 w-3 mr-1" />
          Demo Mode
        </Badge>
        <span className="text-xs text-gray-400">Simulated real-time updates</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "destructive"} className={isConnected ? "bg-green-600" : ""}>
        {isConnected ? (
          <>
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Live
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </>
        )}
      </Badge>

      {isConnected && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Active</span>
        </div>
      )}

      {lastUpdate && <span className="text-xs text-gray-400">Last: {lastUpdate.toLocaleTimeString()}</span>}
    </div>
  )
}
