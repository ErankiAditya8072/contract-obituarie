import { ZGStorageClient } from "./0g-storage-client"

export interface ContractData {
  id: string
  address: string
  chainId: number
  name?: string
  symbol?: string
  totalSupply?: string
  decimals?: number
  createdAt: number
  lastActivity: number
  transactionCount: number
  holderCount: number
  isActive: boolean
  riskScore?: number
  tags: string[]
}

export interface GraphQueryResult {
  contracts: ContractData[]
  totalCount: number
  hasMore: boolean
}

export class GraphClient {
  private zgStorage: ZGStorageClient

  constructor() {
    this.zgStorage = new ZGStorageClient()
  }

  async searchContracts(query: string, limit = 10): Promise<GraphQueryResult> {
    try {
      // Redirect to 0G Storage search
      const obituaries = await this.zgStorage.searchObituaries(query, limit)

      // Convert obituaries to contract format for backward compatibility
      const contracts: ContractData[] = obituaries.map((obituary) => ({
        id: obituary.id,
        address: obituary.contractAddress,
        chainId: obituary.chainId,
        name: obituary.title,
        createdAt: obituary.timestamp,
        lastActivity: obituary.timestamp,
        transactionCount: 0,
        holderCount: 0,
        isActive: false, // All obituaries are for dead contracts
        riskScore: 100, // High risk since they're dead
        tags: [obituary.causeOfDeath, "deceased"],
      }))

      return {
        contracts,
        totalCount: contracts.length,
        hasMore: false,
      }
    } catch (error) {
      console.error("Graph client search failed, using 0G Storage:", error)
      return {
        contracts: [],
        totalCount: 0,
        hasMore: false,
      }
    }
  }

  async getContractById(id: string): Promise<ContractData | null> {
    try {
      const obituary = await this.zgStorage.getObituaryById(id)
      if (!obituary) return null

      return {
        id: obituary.id,
        address: obituary.contractAddress,
        chainId: obituary.chainId,
        name: obituary.title,
        createdAt: obituary.timestamp,
        lastActivity: obituary.timestamp,
        transactionCount: 0,
        holderCount: 0,
        isActive: false,
        riskScore: 100,
        tags: [obituary.causeOfDeath, "deceased"],
      }
    } catch (error) {
      console.error("Graph client getById failed:", error)
      return null
    }
  }

  async getContractsByAddress(address: string): Promise<ContractData[]> {
    try {
      const obituaries = await this.zgStorage.getObituariesByAddress(address)

      return obituaries.map((obituary) => ({
        id: obituary.id,
        address: obituary.contractAddress,
        chainId: obituary.chainId,
        name: obituary.title,
        createdAt: obituary.timestamp,
        lastActivity: obituary.timestamp,
        transactionCount: 0,
        holderCount: 0,
        isActive: false,
        riskScore: 100,
        tags: [obituary.causeOfDeath, "deceased"],
      }))
    } catch (error) {
      console.error("Graph client getByAddress failed:", error)
      return []
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      return await this.zgStorage.isConfigured()
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const graphClient = new GraphClient()
