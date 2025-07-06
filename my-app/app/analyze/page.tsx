import { AIContractAnalyzer } from "@/components/ai-contract-analyzer"

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Smart Contract Analysis</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced AI-powered security analysis using 0G AI and real-time blockchain data. Identify vulnerabilities,
              assess risks, and get actionable recommendations.
            </p>
          </div>

          <AIContractAnalyzer />
        </div>
      </div>
    </div>
  )
}
