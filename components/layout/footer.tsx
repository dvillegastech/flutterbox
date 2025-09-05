import Link from 'next/link'
import { Code2 } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6" />
              <span className="text-xl font-bold">FlutterBox</span>
            </div>
            <p className="text-zinc-400 text-sm">
              The open source Flutter widget library for developers who value simplicity.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/github" className="hover:text-white transition-colors">GitHub</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="https://twitter.com" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="https://discord.com" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="mailto:hello@flutterbox.dev" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-400">
          <p>&copy; 2025 FlutterBox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}