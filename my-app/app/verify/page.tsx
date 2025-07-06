"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, AlertTriangle, Clock, Users } from "lucide-react"
import type { ContractObituary } from "@/lib/graph-client"
import { VerificationForm } from "@/components/verification-form"

export default function VerifyPage() {
  const [pendingObituaries, setPendingObituaries] = useState<ContractObituary[]>([])
  const [selectedObituary, setSelectedObituary] = useState<ContractObituary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPendingObituaries()
  }, [])

  const loadPendingObituaries = async () => {
    setIsLoading(true)
    try {
      // Mock pending obituaries for demo
      const mockPending: ContractObituary[] = [
        {
          id: "pending-1",
          contractAddress: "0xdeadbeef1234567890abcdef1234567890abcdef",
          contractName: "Suspicious DeFi Protocol",
          reason: "exploited",
          description: "Flash loan attack drained $500K from the protocol. Multiple users reported losses.",
          lastSafeBlock: "18345678",
          reportedAt: "2024-01-20T08:30:00Z",
          reportedBy: "0x1234...5678",
          verifications: 3,
          alternatives: [],
          proofAttachments: ["QmX1Y2Z3...", "QmA4B5C6..."],
          isVerified: false,
          riskLevel: "high",
        },
        {
          id: "pending-2",
          contractAddress: "0xcafebabe1234567890abcdef1234567890abcdef",
          contractName: "Old Token Contract",
          reason: "deprecated",
          description: "Team announced migration to V2. This contract is no longer maintained.",
          lastSafeBlock: "18300000",
          reportedAt: "2024-01-19T14:15:00Z",
          reportedBy: "0xabcd...efgh",
          verifications: 1,
          alternatives: ["0x9876543210fedcba9876543210fedcba98765432"],
          proofAttachments: ["QmP7Q8R9..."],
          isVerified: false,
          riskLevel: "medium",
        },
      ]

      setPendingObituaries(mockPending)
    } catch (error) {
      console.error("Error loading pending obituaries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationComplete = () => {
    // Refresh the list after verification
    loadPendingObituaries()
    setSelectedObituary(null)
  }

  if (selectedObituary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setSelectedObituary(null)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent mb-4"
            >
              ← Back to Pending Verifications
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Death Certificate</h1>
            <p className="text-gray-300">Review and verify this contract obituary</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Obituary Details */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{selectedObituary.contractName}</CardTitle>
                <CardDescription className="text-gray-300 font-mono">
                  {selectedObituary.contractAddress}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{selectedObituary.reason}</Badge>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    Pending Verification
                  </Badge>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Description</h4>
                  <p className="text-gray-300 text-sm">{selectedObituary.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Last Safe Block:</span>
                    <p className="text-white font-mono">{selectedObituary.lastSafeBlock}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Reported By:</span>
                    <p className="text-white font-mono">{selectedObituary.reportedBy}</p>
                  </div>
                </div>

                {selectedObituary.proofAttachments.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Proof Attachments</h4>
                    <div className="space-y-2">
                      {selectedObituary.proofAttachments.map((proof, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-900/50 p-2 rounded">
                          <span className="text-gray-300 font-mono text-sm">{proof}</span>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please review all evidence carefully before verifying. Your verification will be recorded on-chain.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Verification Form */}
            <VerificationForm obituary={selectedObituary} onVerificationComplete={handleVerificationComplete} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Community Verification</h1>
          <p className="text-lg text-gray-300">Help verify death certificates submitted by the community</p>
        </div>

        {isLoading ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading pending verifications...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingObituaries.map((obituary) => (
              <Card key={obituary.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        <CardTitle className="text-white">{obituary.contractName}</CardTitle>
                        <Badge variant="destructive">{obituary.reason}</Badge>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-300 font-mono">{obituary.contractAddress}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">{obituary.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{obituary.verifications} verifications</span>
                      </div>
                      <span>•</span>
                      <span>Reported: {new Date(obituary.reportedAt).toLocaleDateString()}</span>
                    </div>

                    <Button onClick={() => setSelectedObituary(obituary)} className="bg-purple-600 hover:bg-purple-700">
                      Review & Verify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingObituaries.length === 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No pending verifications</h3>
                  <p className="text-gray-400">All death certificates have been verified by the community</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
