"use client"

import { useState, useEffect, useCallback } from "react"

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  const checkConnection = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          })

          setState({
            isConnected: true,
            address: accounts[0],
            balance: formatBalance(balance),
            chainId: Number.parseInt(chainId, 16),
            isConnecting: false,
            error: null,
          })
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message,
          isConnecting: false,
        }))
      }
    }
  }, [])

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask not installed",
      }))
      return false
    }

    // Prevent multiple simultaneous connection requests
    if (state.isConnecting) {
      return false
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }))

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

        setState({
          isConnected: true,
          address: existingAccounts[0],
          balance: formatBalance(balance),
          chainId: Number.parseInt(chainId, 16),
          isConnecting: false,
          error: null,
        })
        return true
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

      setState({
        isConnected: true,
        address: accounts[0],
        balance: formatBalance(balance),
        chainId: Number.parseInt(chainId, 16),
        isConnecting: false,
        error: null,
      })

      return true
    } catch (error: any) {
      let errorMessage = "Failed to connect wallet"

      if (error.code === 4001) {
        errorMessage = "Connection rejected by user"
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending. Please check MetaMask."
      } else if (error.message) {
        errorMessage = error.message
      }

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }))
      return false
    }
  }, [state.isConnecting])

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null,
    })
  }, [])

  const formatBalance = (balance: string) => {
    const eth = Number.parseInt(balance, 16) / Math.pow(10, 18)
    return eth.toFixed(4)
  }

  useEffect(() => {
    checkConnection()

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setState((prev) => ({ ...prev, address: accounts[0] }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        setState((prev) => ({ ...prev, chainId: Number.parseInt(chainId, 16) }))
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [checkConnection, disconnect])

  return {
    ...state,
    connect,
    disconnect,
    checkConnection,
  }
}
