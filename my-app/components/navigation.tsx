"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import Link from "next/link"
import { Skull, Menu, X } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Skull className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">Contract Obituaries</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/browse" className="text-gray-300 hover:text-white transition-colors">
              Browse
            </Link>
            <Link href="/submit" className="text-gray-300 hover:text-white transition-colors">
              Submit
            </Link>
            <Link href="/analyze" className="text-gray-300 hover:text-white transition-colors">
              AI Analyze
            </Link>
            <Link href="/verify" className="text-gray-300 hover:text-white transition-colors">
              Verify
            </Link>
            <Link href="/api" className="text-gray-300 hover:text-white transition-colors">
              API
            </Link>
            <WalletConnect />
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col gap-4">
              <Link href="/browse" className="text-gray-300 hover:text-white transition-colors">
                Browse
              </Link>
              <Link href="/submit" className="text-gray-300 hover:text-white transition-colors">
                Submit
              </Link>
              <Link href="/analyze" className="text-gray-300 hover:text-white transition-colors">
                AI Analyze
              </Link>
              <Link href="/verify" className="text-gray-300 hover:text-white transition-colors">
                Verify
              </Link>
              <Link href="/api" className="text-gray-300 hover:text-white transition-colors">
                API
              </Link>
              <WalletConnect />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
