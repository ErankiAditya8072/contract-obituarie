"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

export function WalletConnect() {
  const { toast } = useToast()
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          })

          setWallet({
            isConnected: true,
            address: accounts[0],
            balance: formatBalance(balance),
            chainId: Number.parseInt(chainId, 16),
            isConnecting: false,
            error: null,
          })
        } else {
          setWallet((prev) => ({
            ...prev,
            isConnected: false,
            address: null,
            balance: null,
            chainId: null,
            isConnecting: false,
          }))
        }
      } catch (error: any) {
        console.error("Error checking connection:", error)
        setWallet((prev) => ({
          ...prev,
          error: error.message,
          isConnecting: false,
        }))
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      })
      return
    }

    // Prevent multiple simultaneous connection requests
    if (wallet.isConnecting) {
      toast({
        title: "Connection in progress",
        description: "Please wait for the current connection request to complete.",
        variant: "default",
      })
      return
    }

    setWallet((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Check if already connected first
      const existingAccounts = await window.ethereum.request({ method: "eth_accounts" })

      if (existingAccounts.length > 0) {
        // Already connected, just update state
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [existingAccounts[0], "latest"],
        })

        setWallet({
          isConnected: true,
          address: existingAccounts[0],
          balance: formatBalance(balance),
          chainId: Number.parseInt(chainId, 16),
          isConnecting: false,
          error: null,
        })

        toast({
          title: "Wallet connected",
          description: `Connected to ${formatAddress(existingAccounts[0])}`,
        })
        return
      }

      // Request new connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      })

      setWallet({
        isConnected: true,
        address: accounts[0],
        balance: formatBalance(balance),
        chainId: Number.parseInt(chainId, 16),
        isConnecting: false,
        error: null,
      })

      toast({
        title: "Wallet connected",
        description: `Connected to ${formatAddress(accounts[0])}`,
      })
    } catch (error: any) {
      console.error("Error connecting wallet:", error)

      let errorMessage = "Failed to connect wallet"

      if (error.code === 4001) {
        errorMessage = "Connection rejected by user"
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending. Please check MetaMask."
      } else if (error.message) {
        errorMessage = error.message
      }

      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }))

      toast({
        title: "Connection failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null,
    })

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setWallet((prev) => ({ ...prev, address: accounts[0] }))
    }
  }

  const handleChainChanged = (chainId: string) => {
    setWallet((prev) => ({ ...prev, chainId: Number.parseInt(chainId, 16) }))
  }

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    const eth = Number.parseInt(balance, 16) / Math.pow(10, 18)
    return eth.toFixed(4)
  }

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: "Ethereum",
      137: "Polygon",
      56: "BSC",
      42161: "Arbitrum",
      10: "Optimism",
      5: "Goerli",
      11155111: "Sepolia",
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  if (!wallet.isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={wallet.isConnecting}
        variant="outline"
        className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-transparent"
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="hidden sm:inline">{formatAddress(wallet.address!)}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-white">Connected</span>
            </div>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              {getChainName(wallet.chainId!)}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Address</p>
              <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded">
                <span className="text-sm font-mono text-white">{formatAddress(wallet.address!)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Balance</p>
              <div className="bg-slate-900/50 p-2 rounded">
                <span className="text-sm font-mono text-white">{wallet.balance} ETH</span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem
          onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, "_blank")}
          className="text-gray-300 hover:text-white hover:bg-slate-700"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Etherscan
        </DropdownMenuItem>

        <DropdownMenuItem onClick={disconnectWallet} className="text-red-400 hover:text-red-300 hover:bg-slate-700">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
