import { AIEnhancedSubmitForm } from "@/components/ai-enhanced-submit-form"

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Submit Contract Death Certificate</h1>
          <p className="text-lg text-gray-300">
            AI-powered submission with intelligent analysis and description generation
          </p>
        </div>
        <AIEnhancedSubmitForm />
      </div>
    </div>
  )
}
