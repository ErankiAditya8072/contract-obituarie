import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Stats } from "@/components/stats"
import { RecentObituaries } from "@/components/recent-obituaries"
import { RealTimeContractChecker } from "@/components/real-time-contract-checker"
import { EnhancedRealTime0GKnowledgeGraph } from "@/components/enhanced-real-time-0g-knowledge-graph"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Hero />
      <Features />
      <Stats />
      <RecentObituaries />
      <RealTimeContractChecker />

      {/* Enhanced 0G Knowledge Graph Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">0G Knowledge Graph</h2>
            <p className="mt-4 text-lg text-gray-300">
              Real-time decentralized storage and querying of contract obituary data
            </p>
          </div>
          <EnhancedRealTime0GKnowledgeGraph />
        </div>
      </div>
    </div>
  )
}
