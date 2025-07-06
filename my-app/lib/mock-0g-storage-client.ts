import type { ZGContractObituary, ZGVerification } from "./0g-storage-client"

// In-memory storage for development
const mockObituaries: ZGContractObituary[] = [
  {
    id: "mock-1",
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    contractName: "FlashLoan Protocol V1",
    reason: "exploited",
    description: "Reentrancy vulnerability exploited for $1.2M. Funds drained through flash loan attack.",
    lastSafeBlock: "18234567",
    reportedAt: "2024-01-15T10:30:00Z",
    reportedBy: "0xabcd1234567890abcdef1234567890abcdef1234",
    verifications: 23,
    alternatives: ["0xabcdefgh12345678", "0x987654321abcdef"],
    proofAttachments: ["proof1", "proof2"],
    isVerified: true,
    riskLevel: "high",
    transactionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    blockNumber: 18234567,
    chainId: 1,
    metadata: {
      aiGenerated: false,
      tags: ["exploited", "flashloan"],
    },
  },
  {
    id: "mock-2",
    contractAddress: "0xabcdefghijklmnopqrstuvwxyz1234567890abcdef",
    contractName: "Legacy DEX Router",
    reason: "deprecated",
    description: "Officially deprecated by team. Use V2 router for all new integrations.",
    lastSafeBlock: "18156789",
    reportedAt: "2024-01-10T14:20:00Z",
    reportedBy: "0x1234567890abcdef1234567890abcdef12345678",
    verifications: 45,
    alternatives: ["0x1234abcdefgh"],
    proofAttachments: ["proof3"],
    isVerified: true,
    riskLevel: "medium",
    transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    blockNumber: 18156789,
    chainId: 1,
    metadata: {
      aiGenerated: true,
      tags: ["deprecated", "dex"],
    },
  },
]

const mockVerifications: ZGVerification[] = []

export class MockZGStorageClient {
  static async storeObituary(obituary: ZGContractObituary): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    mockObituaries.unshift(obituary)
    console.log("Mock: Stored obituary", obituary.id)
    return obituary.id
  }

  static async getObituaryByAddress(contractAddress: string, chainId = 1): Promise<ZGContractObituary | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const obituary = mockObituaries.find(
      (o) => o.contractAddress.toLowerCase() === contractAddress.toLowerCase() && o.chainId === chainId,
    )

    return obituary || null
  }

  static async searchObituaries(
    query: string,
    filters: {
      reason?: string
      riskLevel?: string
      chainId?: number
      verified?: boolean
    } = {},
    limit = 20,
    offset = 0,
  ): Promise<ZGContractObituary[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const results = mockObituaries.filter((obituary) => {
      const matchesQuery =
        obituary.contractAddress.toLowerCase().includes(query.toLowerCase()) ||
        obituary.contractName?.toLowerCase().includes(query.toLowerCase()) ||
        obituary.description.toLowerCase().includes(query.toLowerCase())

      const matchesFilters =
        (!filters.reason || obituary.reason === filters.reason) &&
        (!filters.riskLevel || obituary.riskLevel === filters.riskLevel) &&
        (!filters.chainId || obituary.chainId === filters.chainId) &&
        (filters.verified === undefined || obituary.isVerified === filters.verified)

      return matchesQuery && matchesFilters
    })

    return results.slice(offset, offset + limit)
  }

  static async getRecentObituaries(limit = 10, chainId?: number): Promise<ZGContractObituary[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let results = mockObituaries
    if (chainId) {
      results = results.filter((o) => o.chainId === chainId)
    }

    return results.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()).slice(0, limit)
  }

  static async storeVerification(verification: ZGVerification): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    mockVerifications.push(verification)
    return verification.id
  }

  static async getVerifications(obituaryId: string): Promise<ZGVerification[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    return mockVerifications.filter((v) => v.obituaryId === obituaryId)
  }

  static async storeProofBlob(file: File | Blob, metadata: any): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const blobId = `blob-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("Mock: Stored proof blob", blobId)
    return blobId
  }

  static async getProofBlob(blobId: string): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return a mock blob
    return new Blob(["Mock proof data"], { type: "text/plain" })
  }

  static subscribeToUpdates(
    callback: (obituary: ZGContractObituary) => void,
    filters: { chainId?: number; reason?: string } = {},
  ): () => void {
    console.log("Mock: Setting up subscription with filters", filters)

    // Simulate periodic updates for demo
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        // 5% chance every second
        const mockUpdate: ZGContractObituary = {
          id: `live-${Date.now()}`,
          contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          contractName: `Live Contract ${Math.floor(Math.random() * 1000)}`,
          reason: ["exploited", "deprecated", "abandoned"][Math.floor(Math.random() * 3)] as any,
          description: "Real-time mock update for demonstration",
          lastSafeBlock: Math.floor(Math.random() * 1000000 + 18000000).toString(),
          reportedAt: new Date().toISOString(),
          reportedBy: `0x${Math.random().toString(16).substr(2, 40)}`,
          verifications: Math.floor(Math.random() * 50),
          alternatives: [],
          proofAttachments: [],
          isVerified: Math.random() > 0.5,
          riskLevel: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as any,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000 + 18000000),
          chainId: filters.chainId || 1,
          metadata: {
            aiGenerated: Math.random() > 0.5,
            tags: ["mock", "demo"],
          },
        }

        callback(mockUpdate)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      console.log("Mock: Unsubscribed from updates")
    }
  }

  static async getStats(): Promise<{
    totalObituaries: number
    totalVerifications: number
    chainDistribution: Record<number, number>
    reasonDistribution: Record<string, number>
    riskDistribution: Record<string, number>
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const chainDistribution: Record<number, number> = {}
    const reasonDistribution: Record<string, number> = {}
    const riskDistribution: Record<string, number> = {}

    mockObituaries.forEach((obituary) => {
      chainDistribution[obituary.chainId] = (chainDistribution[obituary.chainId] || 0) + 1
      reasonDistribution[obituary.reason] = (reasonDistribution[obituary.reason] || 0) + 1
      riskDistribution[obituary.riskLevel] = (riskDistribution[obituary.riskLevel] || 0) + 1
    })

    return {
      totalObituaries: mockObituaries.length,
      totalVerifications: mockVerifications.length,
      chainDistribution,
      reasonDistribution,
      riskDistribution,
    }
  }
}
