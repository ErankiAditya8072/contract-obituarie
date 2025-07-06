import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, ExternalLink } from "lucide-react"
import { WalletStatus } from "@/components/wallet-status"

export function MetaMaskDemo() {
  return (
    <div className="py-24 sm:py-32 bg-slate-800/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">MetaMask Integration Demo</h2>
          <p className="mt-4 text-lg text-gray-300">See how Contract Obituaries protects users in real-time</p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Safe Contract */}
            <Card className="bg-green-900/20 border-green-700/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-400" />
                  <div>
                    <CardTitle className="text-white">Safe Contract</CardTitle>
                    <CardDescription className="text-green-300">0x1234...abcd</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    ✓ No obituary found
                  </Badge>
                  <p className="text-gray-300">
                    This contract is safe to interact with. No death certificate has been filed.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Proceed with Transaction</Button>
                </div>
              </CardContent>
            </Card>

            {/* Dangerous Contract */}
            <Card className="bg-red-900/20 border-red-700/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                  <div>
                    <CardTitle className="text-white">Dangerous Contract</CardTitle>
                    <CardDescription className="text-red-300">0x5678...efgh</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge variant="destructive">⚠️ Contract Exploited</Badge>
                  <p className="text-gray-300">This contract has been exploited. Last safe block: 18,234,567</p>
                  <div className="flex gap-2">
                    <Button variant="destructive" className="flex-1" disabled>
                      Transaction Blocked
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 bg-transparent">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <WalletStatus showDetails={true} />
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Integration available for MetaMask, WalletConnect, and other Web3 wallets
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
