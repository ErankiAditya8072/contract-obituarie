"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Database, Zap, Globe, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ZGStorageClient } from "@/lib/0g-storage-client"

export function Hero() {
  const [connectionStatus, setConnectionStatus] = useState<{
    storage: boolean
    ai: boolean
    decentralized: boolean
  }>({
    storage: false,
    ai: false,
    decentralized: true, // Always true for demo
  })

  useEffect(() => {
    const checkConnections = async () => {
      try {
        const storageConfig = ZGStorageClient.getConfigurationStatus()
        const storageTest = await ZGStorageClient.testConnection()

        setConnectionStatus({
          storage: storageTest.success,
          ai: false, // 0G AI not implemented yet
          decentralized: true,
        })
      } catch (error) {
        console.log("Connection check failed:", error)
        // Keep default values for demo
      }
    }

    checkConnections()
  }, [])

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
        {/* Status Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 rounded-full bg-slate-800/50 px-6 py-3 ring-1 ring-slate-700">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">0G Storage</span>
              <div className={`w-2 h-2 rounded-full ${connectionStatus.storage ? "bg-green-500" : "bg-yellow-500"}`} />
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">0G AI</span>
              <div className={`w-2 h-2 rounded-full ${connectionStatus.ai ? "bg-green-500" : "bg-gray-500"}`} />
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Decentralized</span>
              <div
                className={`w-2 h-2 rounded-full ${connectionStatus.decentralized ? "bg-green-500" : "bg-red-500"}`}
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Contract{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Obituaries
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            A decentralized registry of dead, exploited, and abandoned smart contracts. Help protect the community by
            reporting dangerous contracts and verifying reports from other users.
          </p>

          {/* Key Features */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
              <CheckCircle className="h-3 w-3 mr-1" />
              Community Verified
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
              <Database className="h-3 w-3 mr-1" />
              0G Storage Powered
            </Badge>
            <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-500/10">
              <Zap className="h-3 w-3 mr-1" />
              0G AI Enhanced
            </Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-400 bg-orange-500/10">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Risk Assessment
            </Badge>
          </div>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/browse">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Browse Obituaries
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/submit">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-white hover:bg-slate-800 bg-transparent"
              >
                Report Contract
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white">Community Driven</h3>
              <p className="text-xs text-gray-400 mt-1">Verified by the community</p>
            </div>
            <div className="text-center">
              <Database className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white">Decentralized Storage</h3>
              <p className="text-xs text-gray-400 mt-1">Powered by 0G Network</p>
            </div>
            <div className="text-center">
              <Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white">Multi-Chain</h3>
              <p className="text-xs text-gray-400 mt-1">Ethereum, Polygon & more</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  )
}
