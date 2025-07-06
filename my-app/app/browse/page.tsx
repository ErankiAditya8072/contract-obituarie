import { EnhancedBrowseObituaries } from "@/components/enhanced-browse-obituaries"

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contract Obituaries</h1>
          <p className="text-lg text-gray-300">Browse the public graveyard of dead and exploited smart contracts</p>
        </div>
        <EnhancedBrowseObituaries />
      </div>
    </div>
  )
}
