"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface WalletGuardProps {
  children: React.ReactNode
  requireConnection?: boolean
}

export function WalletGuard({ children, requireConnection = false }: WalletGuardProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        setIsConnected(accounts.length > 0)
      } catch (error) {
        console.error("Error checking connection:", error)
        setIsConnected(false)
      }
    } else {
      setIsConnected(false)
    }
    setIsLoading(false)
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      return
    }

    try {
      // Check if already connected first
      const existingAccounts = await window.ethereum.request({ method: "eth_accounts" })

      if (existingAccounts.length > 0) {
        setIsConnected(true)
        return
      }

      // Only request if not already connected
      await window.ethereum.request({ method: "eth_requestAccounts" })
      setIsConnected(true)
    } catch (error: any) {
      console.error("Error connecting wallet:", error)

      if (error.code === -32002) {
        // Connection request already pending
        alert("Connection request already pending. Please check MetaMask and complete the pending request.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (requireConnection && !isConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-purple-400" />
          </div>
          <CardTitle className="text-white">Wallet Connection Required</CardTitle>
          <CardDescription className="text-gray-300">Please connect your wallet to access this feature</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={connectWallet} className="bg-purple-600 hover:bg-purple-700">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
