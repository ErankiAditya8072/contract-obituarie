"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, Zap, Copy, ExternalLink } from "lucide-react"
import { GraphClient, type ContractObituary } from "@/lib/graph-client"
import { useToast } from "@/hooks/use-toast"

interface TransactionSimulation {
  contractAddress: string
  functionName: string
  value: string
  gasLimit: string
}

export function RealTimeContractChecker() {
  const [transaction, setTransaction] = useState<TransactionSimulation>({
    contractAddress: "",
    functionName: "transfer",
    value: "0.1",
    gasLimit: "21000",
  })
  const [obituary, setObituary] = useState<ContractObituary | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const { toast } = useToast()

  const checkContractSafety = async (address: string) => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setObituary(null)
      setShowWarning(false)
      return
    }

    setIsChecking(true)

    try {
      const result = await GraphClient.getMockObituaryByAddress(address)
      setObituary(result)
      setShowWarning(!!result)

      if (result) {
        toast({
          title: "⚠️ Dangerous Contract Detected",
          description: `This contract has been marked as ${result.reason}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking contract:", error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkContractSafety(transaction.contractAddress)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [transaction.contractAddress])

  const handleProceedAnyway = () => {
    toast({
      title: "Transaction would proceed",
      description: "In a real wallet, this would execute the transaction despite warnings",
      variant: "default",
    })
  }

  const handleBlockTransaction = () => {
    toast({
      title: "Transaction blocked",
      description: "Transaction prevented due to contract obituary",
      variant: "default",
    })
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(transaction.contractAddress)
    toast({
      title: "Address copied",
      description: "Contract address copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Real-time Contract Safety Checker
          </CardTitle>
          <CardDescription className="text-gray-300">
            Simulates how wallets can integrate Contract Obituaries for real-time protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Contract Address</label>
              <div className="flex gap-2">
                <Input
                  placeholder="0x..."
                  value={transaction.contractAddress}
                  onChange={(e) => setTransaction((prev) => ({ ...prev, contractAddress: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600 text-white font-mono"
                />
                {transaction.contractAddress && (
                  <Button variant="ghost" size="sm" onClick={copyAddress} className="text-gray-400 hover:text-white">
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Function</label>
              <Input
                value={transaction.functionName}
                onChange={(e) => setTransaction((prev) => ({ ...prev, functionName: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Value (ETH)</label>
              <Input
                value={transaction.value}
                onChange={(e) => setTransaction((prev) => ({ ...prev, value: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Gas Limit</label>
              <Input
                value={transaction.gasLimit}
                onChange={(e) => setTransaction((prev) => ({ ...prev, gasLimit: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Quick Test Addresses */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Quick Test (Click to fill)</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTransaction((prev) => ({
                    ...prev,
                    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
                  }))
                }
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white bg-transparent text-xs"
              >
                Exploited Contract
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTransaction((prev) => ({
                    ...prev,
                    contractAddress: "0xabcdefghijklmnopqrstuvwxyz1234567890abcdef",
                  }))
                }
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white bg-transparent text-xs"
              >
                Deprecated Contract
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setTransaction((prev) => ({
                    ...prev,
                    contractAddress: "0x1111111111111111111111111111111111111111",
                  }))
                }
                className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-transparent text-xs"
              >
                Safe Contract
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Check Results */}
      {transaction.contractAddress && (
        <Card className={`${obituary ? "bg-red-900/20 border-red-700/50" : "bg-green-900/20 border-green-700/50"}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              {obituary ? (
                <AlertTriangle className="h-6 w-6 text-red-400" />
              ) : (
                <Shield className="h-6 w-6 text-green-400" />
              )}
              <div>
                <CardTitle className="text-white">
                  {obituary ? "⚠️ Dangerous Contract Detected" : "✅ Contract Appears Safe"}
                </CardTitle>
                <CardDescription className={obituary ? "text-red-300" : "text-green-300"}>
                  {obituary ? "Death certificate found in knowledge graph" : "No obituary found"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {obituary ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> This contract has been marked as <strong>{obituary.reason}</strong>.
                    Proceeding may result in loss of funds.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Reason</h4>
                    <Badge variant="destructive">{obituary.reason.toUpperCase()}</Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Description</h4>
                    <p className="text-gray-300 text-sm">{obituary.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Last Safe Block:</span>
                      <p className="text-white font-mono">{obituary.lastSafeBlock}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Verifications:</span>
                      <p className="text-white">{obituary.verifications}</p>
                    </div>
                  </div>

                  {obituary.alternatives.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Safer Alternatives</h4>
                      <div className="flex flex-wrap gap-2">
                        {obituary.alternatives.map((alt, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-green-500 text-green-400 font-mono text-xs"
                          >
                            {alt.slice(0, 10)}...
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="destructive" onClick={handleBlockTransaction} className="flex-1">
                    Block Transaction
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleProceedAnyway}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    Proceed Anyway
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/address/${transaction.contractAddress}`, "_blank")}
                    className="text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    ✓ No obituary found
                  </Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    Safe to proceed
                  </Badge>
                </div>

                <p className="text-gray-300 text-sm">
                  This contract address was not found in the Contract Obituaries knowledge graph. No death certificate
                  has been filed.
                </p>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() =>
                    toast({
                      title: "Transaction would proceed",
                      description: "Contract appears safe based on obituary database",
                    })
                  }
                >
                  Proceed with Transaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Integration Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-white font-medium">How This Works</h3>
            <p className="text-gray-400 text-sm">
              When you enter a contract address, the system queries The Graph protocol to check for any death
              certificates. This same integration can be built into MetaMask, WalletConnect, and other Web3 wallets.
            </p>
            <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
              <span>• Real-time GraphQL queries</span>
              <span>• Decentralized data storage</span>
              <span>• Community verification</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
