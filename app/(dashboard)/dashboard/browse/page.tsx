'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WidgetCard } from '@/components/widgets/widget-card'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Search, Filter, TrendingUp, Clock, Eye, Sparkles, Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const categories = [
  { value: 'all', label: 'All Categories', icon: '🎯' },
  { value: 'buttons', label: 'Buttons', icon: '🔘' },
  { value: 'cards', label: 'Cards', icon: '🃏' },
  { value: 'forms', label: 'Forms', icon: '📝' },
  { value: 'navigation', label: 'Navigation', icon: '🧭' },
  { value: 'lists', label: 'Lists', icon: '📋' },
  { value: 'animations', label: 'Animations', icon: '✨' },
  { value: 'layouts', label: 'Layouts', icon: '📐' },
  { value: 'other', label: 'Other', icon: '📦' },
]

const sortOptions = [
  { value: 'recent', label: 'Most Recent', icon: Clock },
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  { value: 'views', label: 'Most Viewed', icon: Eye },
]

export default function BrowseWidgetsPage() {
  const [widgets, setWidgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    fetchWidgets()
  }, [selectedCategory, sortBy])

  const fetchWidgets = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('widgets')
        .select('*')
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

      const { data, error } = await query

      if (error) {
        console.error('Error fetching widgets:', error.message)
      } else {
        // For now, add a default username since the join is causing issues
        const widgetsWithProfile = (data || []).map(widget => ({
          ...widget,
          profiles: { username: 'Developer' }
        }))
        setWidgets(widgetsWithProfile)
      }
    } catch (error: any) {
      console.error('Error fetching widgets:', error?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const filteredWidgets = widgets.filter(widget =>
    widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    widget.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCategoryData = categories.find(cat => cat.value === selectedCategory)
  const totalResults = filteredWidgets.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-black flex items-center gap-3">
                <Sparkles className="h-8 w-8" />
                Discover Widgets
              </h1>
              <p className="text-zinc-600 mt-2 text-lg">
                Explore {totalResults} amazing Flutter widgets from the community
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-black text-white' : ''}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-black text-white' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                placeholder="Search widgets by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:border-black transition-colors"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-[200px] h-12 border-2">
                <div className="flex items-center gap-2">
                  <span>{selectedCategoryData?.icon}</span>
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px] h-12 border-2">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-zinc-600">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                  onClick={() => setSelectedCategory('all')}
                >
                  {selectedCategoryData?.icon} {selectedCategoryData?.label}
                  <span className="ml-1">×</span>
                </Badge>
              )}
              {searchQuery && (
                <Badge 
                  variant="secondary"
                  className="bg-zinc-100 hover:bg-zinc-200 cursor-pointer"
                  onClick={() => setSearchQuery('')}
                >
                  Search: "{searchQuery}"
                  <span className="ml-1">×</span>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {loading ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={viewMode === 'grid' 
                ? "h-64 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-xl animate-pulse"
                : "h-24 bg-gradient-to-r from-zinc-100 to-zinc-50 rounded-xl animate-pulse"
              } />
            ))}
          </div>
        ) : filteredWidgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 mb-4">
              <Search className="h-10 w-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">No widgets found</h3>
            <p className="text-zinc-600 max-w-md mx-auto">
              {searchQuery 
                ? `No widgets match "${searchQuery}". Try adjusting your search.`
                : 'No widgets available in this category yet.'}
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWidgets.map((widget) => (
                  <WidgetCard key={widget.id} widget={widget} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWidgets.map((widget) => (
                  <div key={widget.id} className="bg-white rounded-xl border-2 border-zinc-100 p-6 hover:border-zinc-300 transition-all hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black mb-2">{widget.title}</h3>
                        <p className="text-zinc-600 mb-4">{widget.description}</p>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {widget.views_count} views
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {widget.likes_count} likes
                          </span>
                          <Badge variant="secondary">{widget.category}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/dashboard/widget/${widget.id}`}>View</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}