"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Users,
  Database,
  Zap,
  Globe,
  AlertTriangle,
  CheckCircle,
  Search,
  TrendingUp,
  Lock,
  Cpu,
  Network,
} from "lucide-react"

const features = [
  {
    name: "Decentralized Storage",
    description:
      "All contract obituaries are stored on the 0G decentralized storage network, ensuring data permanence and censorship resistance.",
    icon: Database,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    category: "Infrastructure",
    status: "Active",
  },
  {
    name: "AI-Powered Analysis",
    description:
      "Advanced AI models analyze smart contracts to detect vulnerabilities, exploits, and suspicious patterns automatically.",
    icon: Zap,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    category: "AI/ML",
    status: "Beta",
  },
  {
    name: "Community Verification",
    description:
      "Crowdsourced verification system where community members can validate and dispute contract obituary reports.",
    icon: Users,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    category: "Community",
    status: "Active",
  },
  {
    name: "Multi-Chain Support",
    description: "Monitor contracts across multiple blockchain networks including Ethereum, Polygon, BSC, and more.",
    icon: Globe,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    category: "Blockchain",
    status: "Active",
  },
  {
    name: "Risk Assessment",
    description:
      "Automated risk scoring system that evaluates contract safety based on code analysis and community reports.",
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    category: "Security",
    status: "Active",
  },
  {
    name: "Real-time Monitoring",
    description:
      "Live monitoring of contract activity with instant notifications when suspicious behavior is detected.",
    icon: TrendingUp,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    category: "Monitoring",
    status: "Active",
  },
  {
    name: "Advanced Search",
    description:
      "Powerful search capabilities to find contracts by address, name, risk level, or exploit type across all chains.",
    icon: Search,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    category: "Discovery",
    status: "Active",
  },
  {
    name: "Reputation System",
    description: "Track reporter credibility and build trust through a transparent reputation scoring mechanism.",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    category: "Trust",
    status: "Coming Soon",
  },
  {
    name: "Cryptographic Proofs",
    description: "All reports include cryptographic evidence and can be independently verified on-chain.",
    icon: Lock,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    category: "Security",
    status: "Active",
  },
  {
    name: "API & Integrations",
    description: "RESTful API and webhook integrations for developers to build on top of the obituary database.",
    icon: Cpu,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    category: "Developer",
    status: "Beta",
  },
  {
    name: "Network Analytics",
    description: "Comprehensive analytics dashboard showing trends, patterns, and insights across the entire network.",
    icon: Network,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    category: "Analytics",
    status: "Active",
  },
  {
    name: "Governance & DAO",
    description: "Decentralized governance system where token holders can vote on platform decisions and upgrades.",
    icon: Shield,
    color: "text-teal-400",
    bgColor: "bg-teal-400/10",
    category: "Governance",
    status: "Planned",
  },
]

const categories = ["All", "Infrastructure", "AI/ML", "Community", "Security", "Developer"]

export function Features() {
  return (
    <div className="py-24 sm:py-32 bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">Platform Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to track contract safety
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our comprehensive platform combines decentralized storage, AI analysis, and community verification to create
            the most reliable contract obituary system.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="mt-16 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.name}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                        {feature.category}
                      </Badge>
                      <Badge
                        variant={
                          feature.status === "Active" ? "default" : feature.status === "Beta" ? "secondary" : "outline"
                        }
                        className={
                          feature.status === "Active"
                            ? "bg-green-600 text-white"
                            : feature.status === "Beta"
                              ? "bg-yellow-600 text-white"
                              : "border-slate-600 text-slate-400"
                        }
                      >
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-white">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </dl>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center">
          <div className="rounded-2xl bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-8 ring-1 ring-slate-700">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join our community of security researchers, developers, and blockchain enthusiasts working together to
              make DeFi safer for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Free to use
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10 px-4 py-2">
                <Database className="h-4 w-4 mr-2" />
                Decentralized
              </Badge>
              <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-500/10 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Community driven
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
