'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Code2, LayoutDashboard } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Code2 className="h-6 w-6" />
            <span className="text-xl font-bold">FlutterForge</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="text-sm font-medium hover:text-zinc-600 transition-colors">
              Browse
            </Link>
            <Link href="/docs" className="text-sm font-medium hover:text-zinc-600 transition-colors">
              Documentation
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-zinc-600 transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-10 w-32 bg-zinc-100 rounded animate-pulse" />
            ) : user ? (
              <Link href="/dashboard">
                <Button className="bg-black text-white hover:bg-zinc-900">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-black hover:bg-zinc-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-black text-white hover:bg-zinc-900">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}