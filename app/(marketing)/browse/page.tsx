'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Search, Filter, Heart, Eye, Code2, User, ArrowRight, Sparkles, TrendingUp, Clock, Layers } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const categories = [
  'all',
  'buttons',
  'cards',
  'forms',
  'navigation',
  'lists',
  'animations',
  'layouts',
  'other',
]

export default function PublicBrowsePage() {
  const [widgets, setWidgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [stats, setStats] = useState({ total: 0, categories: 0, developers: 0 })
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    fetchWidgets()
    fetchStats()
  }, [selectedCategory, sortBy])

  const fetchStats = async () => {
    try {
      const [totalResult, developersResult] = await Promise.all([
        supabase.from('widgets').select('id', { count: 'exact', head: true }).eq('is_public', true),
        supabase.from('widgets').select('user_id').eq('is_public', true)
      ])

      const uniqueDevelopers = new Set(developersResult.data?.map(w => w.user_id) || []).size
      
      setStats({
        total: totalResult.count || 0,
        categories: categories.length - 1, // excluding 'all'
        developers: uniqueDevelopers
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchWidgets = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('widgets')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('is_public', true)

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'popular') {
        query = query.order('likes_count', { ascending: false })
      } else if (sortBy === 'views') {
        query = query.order('views_count', { ascending: false })
      }

      query = query.limit(20)

      const { data, error } = await query

      if (error) throw error
      setWidgets(data || [])
    } catch (error) {
      console.error('Error fetching widgets:', error)
      setWidgets([])
    } finally {
      setLoading(false)
    }
  }

  const filteredWidgets = widgets.filter(widget =>
    widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    widget.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleWidgetClick = (widgetId: string) => {
    // For non-authenticated users, show a preview or redirect to signup
    router.push(`/signup?redirect=/dashboard/widget/${widgetId}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Community-Powered Widget Library
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4">
            Browse Flutter Widgets
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Discover open-source Flutter widgets created by developers worldwide. 
            Copy, customize, and integrate into your projects instantly.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
          <div className="text-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl border border-zinc-200">
            <div className="text-3xl font-bold text-black">{stats.total}</div>
            <div className="text-sm text-zinc-600 mt-1">Total Widgets</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl border border-zinc-200">
            <div className="text-3xl font-bold text-black">{stats.categories}</div>
            <div className="text-sm text-zinc-600 mt-1">Categories</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl border border-zinc-200">
            <div className="text-3xl font-bold text-black">{stats.developers}+</div>
            <div className="text-sm text-zinc-600 mt-1">Contributors</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 max-w-5xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              placeholder="Search widgets by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-zinc-200 focus:border-black transition-colors"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-[180px] h-12 border-zinc-200">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  <div className="flex items-center gap-2">
                    {cat === 'all' && <span className="text-zinc-500">All Categories</span>}
                    {cat !== 'all' && cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-[180px] h-12 border-zinc-200">
              <div className="flex items-center gap-2">
                {sortBy === 'recent' && <Clock className="h-4 w-4" />}
                {sortBy === 'popular' && <TrendingUp className="h-4 w-4" />}
                {sortBy === 'views' && <Eye className="h-4 w-4" />}
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Most Recent
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Most Popular
                </div>
              </SelectItem>
              <SelectItem value="views">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Most Viewed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Widgets Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-xl animate-pulse" />
                <div className="h-4 bg-zinc-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-zinc-100 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredWidgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Code2 className="h-12 w-12 text-zinc-400" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">No widgets found</h3>
            <p className="text-zinc-500 text-lg mb-8">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a widget in this category!'}
            </p>
            <Link href="/signup">
              <Button className="bg-black text-white hover:bg-zinc-900">
                Create Your First Widget
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWidgets.map((widget) => (
                <Card 
                  key={widget.id} 
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-zinc-200 overflow-hidden"
                  onClick={() => handleWidgetClick(widget.id)}
                >
                  {/* Widget Preview Area */}
                  <div className="h-32 bg-gradient-to-br from-zinc-900 to-zinc-700 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Code2 className="h-16 w-16 text-white/10" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        {widget.category}
                      </span>
                    </div>
                    {/* Decorative code snippet overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                      <div className="font-mono text-xs text-white/60">
                        Widget.build()
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg line-clamp-1 group-hover:text-black transition-colors">
                        {widget.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-gradient-to-br from-zinc-200 to-zinc-300 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-zinc-600" />
                        </div>
                        <span className="text-sm text-zinc-600">
                          @{widget.profiles?.username || 'anonymous'}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    {widget.description && (
                      <p className="text-sm text-zinc-600 line-clamp-2 mb-4">
                        {widget.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 text-zinc-500 hover:text-red-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span className="font-medium">{widget.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium">{widget.views_count || 0}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-black transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More / CTA */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col items-center p-8 bg-gradient-to-br from-zinc-50 to-white rounded-2xl border border-zinc-200">
                <Sparkles className="h-8 w-8 text-zinc-400 mb-4" />
                <h3 className="text-xl font-bold text-black mb-2">Want to see more?</h3>
                <p className="text-zinc-600 mb-6 max-w-md">
                  Sign up to access all widgets, create your own, and join our growing community of Flutter developers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/signup">
                    <Button className="bg-black text-white hover:bg-zinc-900 gap-2">
                      <User className="h-4 w-4" />
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button variant="outline" className="gap-2">
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}