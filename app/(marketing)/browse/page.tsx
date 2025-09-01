'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Search, Filter, Heart, Eye, Code2, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    fetchWidgets()
  }, [selectedCategory, sortBy])

  const fetchWidgets = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('widgets')
        .select(`
          *,
          profiles (username)
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

      query = query.limit(12)

      const { data, error } = await query

      if (error) throw error
      setWidgets(data || [])
    } catch (error) {
      console.error('Error fetching widgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWidgets = widgets.filter(widget =>
    widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    widget.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Browse Flutter Widgets
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Discover open-source Flutter widgets created by developers worldwide
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-48 bg-zinc-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredWidgets.length === 0 ? (
          <div className="text-center py-16">
            <Code2 className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg">No widgets found</p>
            <p className="text-zinc-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWidgets.map((widget) => (
                <Card key={widget.id} className="group hover:border-zinc-400 transition-all hover:scale-[1.02] cursor-pointer">
                  <Link href={`/widget/${widget.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg line-clamp-1">{widget.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-zinc-500">
                            <User className="h-3 w-3" />
                            <span>{widget.profiles?.username || 'Anonymous'}</span>
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-zinc-100 rounded text-xs font-medium">
                          {widget.category}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      {widget.description && (
                        <p className="text-sm text-zinc-600 line-clamp-2">
                          {widget.description}
                        </p>
                      )}
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-zinc-500">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{widget.likes_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{widget.views_count}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-zinc-600 mb-4">Want to see more widgets and contribute?</p>
              <Link href="/signup">
                <Button className="bg-black text-white hover:bg-zinc-900">
                  Sign Up to Access All Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}