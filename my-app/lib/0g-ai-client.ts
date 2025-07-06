export interface ContractAnalysis {
  contractAddress: string
  riskLevel: "low" | "medium" | "high" | "critical"
  vulnerabilities: Array<{
    type: string
    severity: "low" | "medium" | "high" | "critical"
    description: string
    location?: string
    recommendation: string
  }>
  gasOptimization: Array<{
    issue: string
    impact: string
    suggestion: string
    estimatedSavings?: string
  }>
  codeQuality: {
    score: number
    issues: string[]
    recommendations: string[]
  }
  similarContracts: Array<{
    address: string
    similarity: number
    riskLevel: string
  }>
  summary: string
  confidence: number
  analyzedAt: string
}

export class ZGAIClient {
  private static readonly AI_ENDPOINT = process.env.NEXT_PUBLIC_ZG_AI_ENDPOINT || "https://api.0g.ai/v1"
  private static readonly AI_KEY = process.env.ZG_AI_API_KEY || process.env.NEXT_PUBLIC_ZG_AI_KEY

  private static isConfigured(): boolean {
    return !!(this.AI_KEY && this.AI_KEY.length > 0)
  }

  static async analyzeContract(contractAddress: string, sourceCode?: string, abi?: any[]): Promise<ContractAnalysis> {
    if (!this.isConfigured()) {
      throw new Error("0G AI not configured")
    }

    try {
      const response = await fetch(`${this.AI_ENDPOINT}/analyze/contract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.AI_KEY}`,
        },
        body: JSON.stringify({
          contractAddress,
          sourceCode,
          abi,
          analysisType: "comprehensive",
          includeVulnerabilities: true,
          includeGasOptimization: true,
          includeSimilarContracts: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`0G AI error: ${response.status}`)
      }

      const result = await response.json()
      return result.analysis
    } catch (error) {
      console.error("Error analyzing contract with 0G AI:", error)
      throw error
    }
  }

  static async generateObituaryDescription(
    contractAddress: string,
    reason: string,
    evidence: string[],
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("0G AI not configured")
    }

    try {
      const response = await fetch(`${this.AI_ENDPOINT}/generate/obituary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.AI_KEY}`,
        },
        body: JSON.stringify({
          contractAddress,
          reason,
          evidence,
          style: "professional",
          includeRecommendations: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`0G AI error: ${response.status}`)
      }

      const result = await response.json()
      return result.description
    } catch (error) {
      console.error("Error generating obituary with 0G AI:", error)
      throw error
    }
  }

  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "0G AI API key not configured" }
    }

    try {
      const response = await fetch(`${this.AI_ENDPOINT}/health`, {
        headers: {
          Authorization: `Bearer ${this.AI_KEY}`,
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
      endpoint: this.AI_ENDPOINT,
      hasApiKey: this.isConfigured(),
    }
  }
}
