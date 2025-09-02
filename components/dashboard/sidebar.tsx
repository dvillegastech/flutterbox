'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Code2, 
  LayoutGrid, 
  PlusCircle, 
  Heart, 
  User, 
  LogOut,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  {
    title: 'Browse Widgets',
    href: '/dashboard/browse',
    icon: Search,
  },
  {
    title: 'My Widgets',
    href: '/dashboard/widgets',
    icon: LayoutGrid,
  },
  {
    title: 'Create New',
    href: '/dashboard/create',
    icon: PlusCircle,
  },
  {
    title: 'Liked Widgets',
    href: '/dashboard/liked',
    icon: Heart,
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative w-64 h-screen bg-black text-white border-r border-zinc-800 flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="flex flex-col items-start space-y-2">
          <div className="flex items-center space-x-2">
            <Code2 className="h-6 w-6" />
            <span className="text-xl font-bold">FlutterBox</span>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 bg-white/10 text-white/80 rounded-full border border-white/20">
            BETA VERSION
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 px-3 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors',
                isActive 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}