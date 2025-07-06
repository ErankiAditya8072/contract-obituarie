"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, X, AlertTriangle, Loader2, Shield } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import type { ContractObituary } from "@/lib/graph-client"

interface VerificationFormProps {
  obituary: ContractObituary
  onVerificationComplete?: () => void
}

export function VerificationForm({ obituary, onVerificationComplete }: VerificationFormProps) {
  const wallet = useWallet()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationComment, setVerificationComment] = useState("")
  const [verificationAction, setVerificationAction] = useState<"approve" | "reject" | null>(null)

  const handleVerification = async (action: "approve" | "reject") => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to verify death certificates",
        variant: "destructive",
      })
      return
    }

    setVerificationAction(action)
    setIsVerifying(true)

    try {
      // Simulate blockchain transaction for verification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const verificationData = {
        obituaryId: obituary.id,
        verifierAddress: wallet.address,
        action,
        comment: verificationComment,
        timestamp: new Date().toISOString(),
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
      }

      console.log("Submitting verification:", verificationData)

      toast({
        title: `Verification ${action}d!`,
        description: `Successfully ${action}d the death certificate for ${obituary.contractName}`,
      })

      setVerificationComment("")
      onVerificationComplete?.()
    } catch (error) {
      console.error("Verification error:", error)
      toast({
        title: "Verification failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
      setVerificationAction(null)
    }
  }

  if (!wallet.isConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Connect Wallet to Verify</h3>
              <p className="text-gray-400 text-sm">
                You need to connect your wallet to participate in community verification
              </p>
            </div>
            <Button onClick={wallet.connect} className="bg-purple-600 hover:bg-purple-700">
              Connect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Community Verification</CardTitle>
        <CardDescription className="text-gray-300">
          Help verify this death certificate by reviewing the evidence and voting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Obituary Summary */}
        <div className="bg-slate-900/30 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">Death Certificate Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Contract:</span>
              <span className="text-white font-mono">{obituary.contractAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reason:</span>
              <Badge variant="destructive">{obituary.reason}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Verifications:</span>
              <span className="text-white">{obituary.verifications}</span>
            </div>
          </div>
        </div>

        {/* Verification Comment */}
        <div className="space-y-2">
          <Label htmlFor="verification-comment" className="text-white">
            Verification Comment (Optional)
          </Label>
          <Textarea
            id="verification-comment"
            placeholder="Add any additional context or evidence for your verification..."
            value={verificationComment}
            onChange={(e) => setVerificationComment(e.target.value)}
            className="bg-slate-900/50 border-slate-600 text-white min-h-[80px]"
          />
        </div>

        {/* Verification Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => handleVerification("approve")}
            disabled={isVerifying}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isVerifying && verificationAction === "approve" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Certificate
              </>
            )}
          </Button>
          <Button
            onClick={() => handleVerification("reject")}
            disabled={isVerifying}
            variant="destructive"
            className="flex-1"
          >
            {isVerifying && verificationAction === "reject" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Reject Certificate
              </>
            )}
          </Button>
        </div>

        {/* Verification Info */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your verification will be recorded on-chain with your wallet address. Only verify certificates you have
            personally reviewed and believe to be accurate.
          </AlertDescription>
        </Alert>

        {/* Connected Wallet Info */}
        <div className="bg-green-900/20 p-3 rounded-lg border border-green-700/50">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-green-300">Verifying as: </span>
            <span className="text-white font-mono">{wallet.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
