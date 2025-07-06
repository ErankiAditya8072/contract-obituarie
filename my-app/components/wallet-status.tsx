"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, AlertTriangle, CheckCircle } from "lucide-react"

interface WalletStatusProps {
  showDetails?: boolean
}

export function WalletStatus({ showDetails = false }: WalletStatusProps) {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: null as string | null,
    chainId: null as number | null,
    isMetaMaskInstalled: false,
  })

  useEffect(() => {
    checkWalletStatus()
  }, [])

  const checkWalletStatus = async () => {
    const isMetaMaskInstalled = typeof window !== "undefined" && !!window.ethereum

    if (isMetaMaskInstalled) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        const chainId = await window.ethereum.request({ method: "eth_chainId" })

        setWalletState({
          isConnected: accounts.length > 0,
          address: accounts[0] || null,
          chainId: Number.parseInt(chainId, 16),
          isMetaMaskInstalled: true,
        })
      } catch (error) {
        console.error("Error checking wallet status:", error)
        setWalletState((prev) => ({ ...prev, isMetaMaskInstalled: true }))
      }
    } else {
      setWalletState((prev) => ({ ...prev, isMetaMaskInstalled: false }))
    }
  }

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: "Ethereum Mainnet",
      137: "Polygon",
      56: "BSC",
      42161: "Arbitrum",
      10: "Optimism",
      5: "Goerli Testnet",
      11155111: "Sepolia Testnet",
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        {walletState.isConnected ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">Wallet Connected</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">Wallet Not Connected</span>
          </>
        )}
      </div>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="h-5 w-5 text-purple-400" />
          <h3 className="text-white font-medium">Wallet Status</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">MetaMask</span>
            <Badge
              variant={walletState.isMetaMaskInstalled ? "default" : "destructive"}
              className={walletState.isMetaMaskInstalled ? "bg-green-600" : ""}
            >
              {walletState.isMetaMaskInstalled ? "Installed" : "Not Installed"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Connection</span>
            <Badge
              variant={walletState.isConnected ? "default" : "secondary"}
              className={walletState.isConnected ? "bg-green-600" : ""}
            >
              {walletState.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {walletState.isConnected && walletState.chainId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Network</span>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                {getChainName(walletState.chainId)}
              </Badge>
            </div>
          )}

          {walletState.isConnected && walletState.address && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Address</span>
              <span className="text-sm font-mono text-white">
                {`${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
