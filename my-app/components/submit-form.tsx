"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Upload, Plus, X, Wallet, CheckCircle, Loader2 } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  contractAddress: string
  contractName: string
  reason: string
  lastSafeBlock: string
  description: string
  proofFiles: string[]
  alternatives: string[]
}

export function SubmitForm() {
  const wallet = useWallet()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    contractAddress: "",
    contractName: "",
    reason: "",
    lastSafeBlock: "",
    description: "",
    proofFiles: [""],
    alternatives: [""],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check wallet connection on component mount
  useEffect(() => {
    if (!wallet.isConnected) {
      wallet.checkConnection()
    }
  }, [wallet])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.contractAddress) {
      newErrors.contractAddress = "Contract address is required"
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.contractAddress)) {
      newErrors.contractAddress = "Please enter a valid Ethereum address"
    }

    if (!formData.reason) {
      newErrors.reason = "Please select a reason for the death certificate"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    if (formData.lastSafeBlock && !/^\d+$/.test(formData.lastSafeBlock)) {
      newErrors.lastSafeBlock = "Block number must be a valid number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit a death certificate",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) {
      toast({
        title: "Form validation failed",
        description: "Please fix the errors and try again",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would integrate with GRC-20-ts to submit the death certificate
      const submissionData = {
        ...formData,
        submittedBy: wallet.address,
        submittedAt: new Date().toISOString(),
        chainId: wallet.chainId,
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64), // Mock tx hash
      }

      console.log("Submitting death certificate:", submissionData)

      toast({
        title: "Death certificate submitted!",
        description: `Successfully submitted obituary for ${formData.contractAddress}`,
      })

      // Reset form
      setFormData({
        contractAddress: "",
        contractName: "",
        reason: "",
        lastSafeBlock: "",
        description: "",
        proofFiles: [""],
        alternatives: [""],
      })
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Submission failed",
        description: "Failed to submit death certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addProofFile = () => {
    setFormData((prev) => ({
      ...prev,
      proofFiles: [...prev.proofFiles, ""],
    }))
  }

  const removeProofFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      proofFiles: prev.proofFiles.filter((_, i) => i !== index),
    }))
  }

  const updateProofFile = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      proofFiles: prev.proofFiles.map((file, i) => (i === index ? value : file)),
    }))
  }

  const addAlternative = () => {
    setFormData((prev) => ({
      ...prev,
      alternatives: [...prev.alternatives, ""],
    }))
  }

  const removeAlternative = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      alternatives: prev.alternatives.filter((_, i) => i !== index),
    }))
  }

  const updateAlternative = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      alternatives: prev.alternatives.map((alt, i) => (i === index ? value : alt)),
    }))
  }

  // Show wallet connection requirement if not connected
  if (!wallet.isConnected) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-12">
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Wallet Connection Required</h3>
              <p className="text-gray-300 mb-6">
                You need to connect your wallet to submit a contract death certificate. This ensures accountability and
                prevents spam submissions.
              </p>
              <Button
                onClick={wallet.connect}
                disabled={wallet.isConnecting}
                className="bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {wallet.isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
            {wallet.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{wallet.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Status Card */}
      <Card className="bg-green-900/20 border-green-700/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Wallet Connected</p>
                <p className="text-green-300 text-sm font-mono">{wallet.address}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-400">
              Ready to Submit
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <CardTitle className="text-white">Death Certificate Form</CardTitle>
              <CardDescription className="text-gray-300">
                All submissions are recorded on-chain and verified by the community
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-address" className="text-white">
                Contract Address *
              </Label>
              <Input
                id="contract-address"
                placeholder="0x..."
                value={formData.contractAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, contractAddress: e.target.value }))}
                className={`bg-slate-900/50 border-slate-600 text-white ${errors.contractAddress ? "border-red-500" : ""}`}
              />
              {errors.contractAddress && <p className="text-red-400 text-sm">{errors.contractAddress}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-name" className="text-white">
                Contract Name
              </Label>
              <Input
                id="contract-name"
                placeholder="e.g., FlashLoan Protocol V1"
                value={formData.contractName}
                onChange={(e) => setFormData((prev) => ({ ...prev, contractName: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-white">
                Reason for Death *
              </Label>
              <Select
                value={formData.reason}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, reason: value }))}
              >
                <SelectTrigger
                  className={`bg-slate-900/50 border-slate-600 text-white ${errors.reason ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exploited">Exploited/Hacked</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                  <SelectItem value="rugpull">Rug Pull</SelectItem>
                  <SelectItem value="malicious">Malicious Code</SelectItem>
                </SelectContent>
              </Select>
              {errors.reason && <p className="text-red-400 text-sm">{errors.reason}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-safe-block" className="text-white">
                Last Safe Block Number
              </Label>
              <Input
                id="last-safe-block"
                placeholder="e.g., 18234567"
                value={formData.lastSafeBlock}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastSafeBlock: e.target.value }))}
                className={`bg-slate-900/50 border-slate-600 text-white ${errors.lastSafeBlock ? "border-red-500" : ""}`}
              />
              {errors.lastSafeBlock && <p className="text-red-400 text-sm">{errors.lastSafeBlock}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed explanation of what happened to this contract..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className={`bg-slate-900/50 border-slate-600 text-white min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
            />
            <div className="flex justify-between text-sm">
              {errors.description && <p className="text-red-400">{errors.description}</p>}
              <p className="text-gray-400 ml-auto">{formData.description.length}/500</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Proof Attachments (IPFS/Walrus)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProofFile}
                className="border-slate-600 text-gray-300 bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Proof
              </Button>
            </div>
            {formData.proofFiles.map((file, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="IPFS hash or Walrus blob ID"
                  value={file}
                  onChange={(e) => updateProofFile(index, e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                {formData.proofFiles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProofFile(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Safer Alternatives</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAlternative}
                className="border-slate-600 text-gray-300 bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Alternative
              </Button>
            </div>
            {formData.alternatives.map((alternative, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Contract address of safer alternative"
                  value={alternative}
                  onChange={(e) => updateAlternative(index, e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                {formData.alternatives.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAlternative(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-900/30 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Submission Process</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  1
                </Badge>
                <span>Your submission is recorded on-chain via GRC-20-ts</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                  2
                </Badge>
                <span>Community members verify the death certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-500 text-green-400">
                  3
                </Badge>
                <span>Once verified, the obituary becomes queryable via The Graph</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting to Blockchain...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Death Certificate
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
