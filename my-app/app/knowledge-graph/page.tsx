import { RealTime0GKnowledgeGraph } from "@/components/real-time-0g-knowledge-graph"

export default function KnowledgeGraphPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">0G Knowledge Graph</h1>
          <p className="text-lg text-gray-300">
            Real-time decentralized storage and analytics for contract obituary data
          </p>
        </div>
        <RealTime0GKnowledgeGraph />
      </div>
    </div>
  )
}
