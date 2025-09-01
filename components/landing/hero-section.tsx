'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code2, LayoutDashboard } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export function HeroSection() {
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
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white" />
      
      {/* Mesh/Grid Pattern Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black">
            The Open Source
            <span className="block mt-2">Flutter Widget Library</span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto">
            Share, discover, and preview Flutter widgets in real-time. 
            A minimalist platform built for developers who value simplicity and speed.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {loading ? (
              <>
                <div className="h-14 w-48 bg-zinc-100 rounded-lg animate-pulse" />
                <div className="h-14 w-48 bg-zinc-50 rounded-lg animate-pulse" />
              </>
            ) : user ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-black text-white hover:bg-zinc-900 text-lg px-8 py-6"
                  >
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="text-black hover:bg-zinc-100 text-lg px-8 py-6"
                  >
                    Browse Widgets
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="bg-black text-white hover:bg-zinc-900 text-lg px-8 py-6"
                  >
                    Start Building
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="text-black hover:bg-zinc-100 text-lg px-8 py-6"
                  >
                    Browse Widgets
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-zinc-200 opacity-20">
              <pre className="text-xs sm:text-sm font-mono">
{`class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('Hello, Flutter!'),
    );
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}