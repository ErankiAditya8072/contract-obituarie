export interface ContractObituary {
  id: string
  contractAddress: string
  contractName?: string
  reason: "exploited" | "deprecated" | "abandoned" | "rugpull" | "malicious"
  description: string
  evidence: string[]
  reportedBy: string
  reportedAt: number
  verificationStatus: "pending" | "verified" | "disputed" | "rejected"
  verificationCount: number
  riskLevel: "low" | "medium" | "high" | "critical"
  tags: string[]
  chainId: number
  blockNumber?: number
  transactionHash?: string
  metadata: {
    gasUsed?: string
    exploitAmount?: string
    affectedUsers?: number
    aiGenerated?: boolean
    similarityScore?: number
  }
}

export interface ContractAnalysisRecord {
  id: string
  contractAddress: string
  analysis: any
  analyzedAt: number
  analyzedBy: string
  version: string
}

export interface StorageStats {
  totalObituaries: number
  totalVerifications: number
  chainDistribution: Record<number, number>
  reasonDistribution: Record<string, number>
  riskDistribution: Record<string, number>
}

export class ZGStorageClient {
  private static readonly STORAGE_ENDPOINT = process.env.NEXT_PUBLIC_ZG_STORAGE_ENDPOINT || "https://storage.0g.ai/v1"
  private static readonly STORAGE_KEY = process.env.ZG_STORAGE_API_KEY || process.env.NEXT_PUBLIC_ZG_STORAGE_KEY

  private static isConfigured(): boolean {
    return !!(this.STORAGE_KEY && this.STORAGE_KEY.length > 0)
  }

  // Store contract obituary in 0G storage
  static async storeObituary(obituary: ContractObituary): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("0G Storage not configured")
    }

    try {
      const response = await fetch(`${this.STORAGE_ENDPOINT}/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
        body: JSON.stringify({
          type: "contract_obituary",
          data: obituary,
          metadata: {
            contractAddress: obituary.contractAddress,
            timestamp: obituary.reportedAt,
            riskLevel: obituary.riskLevel,
            chainId: obituary.chainId,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`0G Storage error: ${response.status}`)
      }

      const result = await response.json()
      return result.id || result.hash
    } catch (error) {
      console.error("Error storing obituary in 0G:", error)
      throw error
    }
  }

  // Retrieve contract obituaries from 0G storage
  static async getObituaries(contractAddress?: string): Promise<ContractObituary[]> {
    if (!this.isConfigured()) {
      throw new Error("0G Storage not configured")
    }

    try {
      const url = new URL(`${this.STORAGE_ENDPOINT}/query`)
      url.searchParams.set("type", "contract_obituary")
      if (contractAddress) {
        url.searchParams.set("contractAddress", contractAddress)
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`0G Storage error: ${response.status}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error("Error retrieving obituaries from 0G:", error)
      throw error
    }
  }

  // Get recent obituaries from 0G storage
  static async getRecentObituaries(limit = 10, chainId?: number): Promise<ContractObituary[]> {
    if (!this.isConfigured()) {
      throw new Error("0G Storage not configured")
    }

    try {
      const url = new URL(`${this.STORAGE_ENDPOINT}/query`)
      url.searchParams.set("type", "contract_obituary")
      url.searchParams.set("limit", limit.toString())
      url.searchParams.set("sort", "reportedAt:desc")

      if (chainId) {
        url.searchParams.set("chainId", chainId.toString())
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`0G Storage error: ${response.status}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error("Error retrieving recent obituaries from 0G:", error)
      throw error
    }
  }

  // Store contract analysis in 0G storage
  static async storeAnalysis(analysis: ContractAnalysisRecord): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("0G Storage not configured")
    }

    try {
      const response = await fetch(`${this.STORAGE_ENDPOINT}/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
        body: JSON.stringify({
          type: "contract_analysis",
          data: analysis,
          metadata: {
            contractAddress: analysis.contractAddress,
            timestamp: analysis.analyzedAt,
            riskLevel: analysis.analysis.riskLevel,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`0G Storage error: ${response.status}`)
      }

      const result = await response.json()
      return result.id || result.hash
    } catch (error) {
      console.error("Error storing analysis in 0G:", error)
      throw error
    }
  }

  // Retrieve contract analysis from 0G storage
  static async getAnalysis(contractAddress: string): Promise<ContractAnalysisRecord | null> {
    if (!this.isConfigured()) {
      throw new Error("0G Storage not configured")
    }

    try {
      const url = new URL(`${this.STORAGE_ENDPOINT}/query`)
      url.searchParams.set("type", "contract_analysis")
      url.searchParams.set("contractAddress", contractAddress)
      url.searchParams.set("limit", "1")
      url.searchParams.set("sort", "analyzedAt:desc")

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`0G Storage error: ${response.status}`)
      }

      const result = await response.json()
      return result.data?.[0] || null
    } catch (error) {
      console.error("Error retrieving analysis from 0G:", error)
      throw error
    }
  }

  // Search obituaries by various criteria
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
  ): Promise<ContractObituary[]> {
    if (!this.isConfigured()) {
      throw new Error("0G Storage not configured")
    }

    try {
      const url = new URL(`${this.STORAGE_ENDPOINT}/search`)
      url.searchParams.set("type", "contract_obituary")
      url.searchParams.set("q", query)
      url.searchParams.set("limit", limit.toString())
      url.searchParams.set("offset", offset.toString())

      if (filters.reason) url.searchParams.set("reason", filters.reason)
      if (filters.riskLevel) url.searchParams.set("riskLevel", filters.riskLevel)
      if (filters.chainId) url.searchParams.set("chainId", filters.chainId.toString())
      if (filters.verified !== undefined) {
        url.searchParams.set("verificationStatus", filters.verified ? "verified" : "pending")
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`0G Storage error: ${response.status}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error("Error searching obituaries in 0G:", error)
      throw error
    }
  }

  // Get storage statistics - FIXED METHOD
  static async getStats(): Promise<StorageStats> {
    if (!this.isConfigured()) {
      throw new Error("0G Storage not configured")
    }

    try {
      const response = await fetch(`${this.STORAGE_ENDPOINT}/stats`, {
        headers: {
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`0G Storage error: ${response.status}`)
      }

      const result = await response.json()

      // Return structured stats data
      return {
        totalObituaries: result.totalObituaries || 0,
        totalVerifications: result.totalVerifications || 0,
        chainDistribution: result.chainDistribution || { 1: 0, 137: 0, 56: 0 },
        reasonDistribution: result.reasonDistribution || { exploited: 0, deprecated: 0, abandoned: 0 },
        riskDistribution: result.riskDistribution || { high: 0, medium: 0, low: 0 },
      }
    } catch (error) {
      console.error("Error getting storage stats:", error)
      // Return default stats structure on error
      return {
        totalObituaries: 0,
        totalVerifications: 0,
        chainDistribution: { 1: 0, 137: 0, 56: 0 },
        reasonDistribution: { exploited: 0, deprecated: 0, abandoned: 0 },
        riskDistribution: { high: 0, medium: 0, low: 0 },
      }
    }
  }

  // Subscribe to real-time updates from 0G storage
  static subscribeToUpdates(
    callback: (obituary: ContractObituary) => void,
    filters: { chainId?: number; reason?: string } = {},
  ): () => void {
    if (!this.isConfigured()) {
      console.warn("0G Storage not configured, cannot subscribe to updates")
      return () => {}
    }

    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isConnecting = false

    const connect = () => {
      if (isConnecting || (ws && ws.readyState === WebSocket.CONNECTING)) {
        return
      }

      isConnecting = true

      try {
        // Convert HTTP endpoint to WebSocket endpoint
        const wsEndpoint = this.STORAGE_ENDPOINT.replace("https://", "wss://").replace("http://", "ws://")

        console.log("Connecting to 0G Storage WebSocket:", `${wsEndpoint}/subscribe`)

        ws = new WebSocket(`${wsEndpoint}/subscribe`)

        ws.onopen = () => {
          console.log("0G Storage WebSocket connected")
          isConnecting = false

          if (ws) {
            ws.send(
              JSON.stringify({
                type: "subscribe",
                dataType: "contract_obituary",
                filters,
                apiKey: this.STORAGE_KEY,
              }),
            )
          }
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("Received 0G Storage update:", data)

            if (data.type === "obituary:new" || data.type === "obituary:updated") {
              callback(data.obituary)
            }
          } catch (error) {
            console.error("Error parsing 0G Storage message:", error)
          }
        }

        ws.onerror = (error) => {
          console.error("0G Storage WebSocket error:", error)
          isConnecting = false

          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout)
          }

          reconnectTimeout = setTimeout(() => {
            console.log("Reconnecting to 0G Storage...")
            connect()
          }, 5000)
        }

        ws.onclose = (event) => {
          console.log("0G Storage WebSocket closed:", event.code, event.reason)
          isConnecting = false

          if (event.code !== 1000 && event.code !== 1001) {
            if (reconnectTimeout) {
              clearTimeout(reconnectTimeout)
            }

            reconnectTimeout = setTimeout(() => {
              console.log("Reconnecting to 0G Storage...")
              connect()
            }, 3000)
          }
        }
      } catch (error) {
        console.error("Error creating 0G Storage WebSocket:", error)
        isConnecting = false
      }
    }

    connect()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }

      if (ws) {
        ws.close(1000, "Manual disconnect")
        ws = null
      }
    }
  }

  // Update obituary verification status
  static async updateObituaryVerification(
    obituaryId: string,
    status: ContractObituary["verificationStatus"],
    verifierAddress: string,
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("0G Storage not configured")
    }

    try {
      const response = await fetch(`${this.STORAGE_ENDPOINT}/update/${obituaryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
        body: JSON.stringify({
          verificationStatus: status,
          verifiedBy: verifierAddress,
          verifiedAt: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error(`0G Storage error: ${response.status}`)
      }
    } catch (error) {
      console.error("Error updating obituary verification:", error)
      throw error
    }
  }

  // Test connection to 0G storage
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "0G Storage API key not configured" }
    }

    try {
      const response = await fetch(`${this.STORAGE_ENDPOINT}/health`, {
        headers: {
          Authorization: `Bearer ${this.STORAGE_KEY}`,
        },
      })

      return {
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static getConfigurationStatus(): {
    isConfigured: boolean
    endpoint: string
    hasApiKey: boolean
  } {
    return {
      isConfigured: this.isConfigured(),
      endpoint: this.STORAGE_ENDPOINT,
      hasApiKey: this.isConfigured(),
    }
  }
}

// Legacy compatibility - remove knowledge graph references
export type ZGContractObituary = ContractObituary
export type ZGVerification = {
  id: string
  obituaryId: string
  verifierAddress: string
  action: "approve" | "reject"
  comment: string
  timestamp: string
  transactionHash: string
  reputation: number
}
