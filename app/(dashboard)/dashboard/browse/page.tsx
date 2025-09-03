'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WidgetCard } from '@/components/widgets/widget-card'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Search, Filter, TrendingUp, Clock, Eye, Sparkles, Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'

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

// Cache configuration
const CACHE_TIME = 5 * 60 * 1000 // 5 minutes
const STALE_TIME = 2 * 60 * 1000 // 2 minutes

export default function BrowseWidgetsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const supabase = createSupabaseBrowser()

  // Fetch widgets with React Query for caching
  const { data: widgets = [], isLoading: loading } = useQuery({
    queryKey: ['dashboard-widgets', selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('widgets')
        .select(`
          *,
          profiles!widgets_user_id_fkey (
            username,
            avatar_url
          )
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

      const { data, error } = await query

      if (error) {
        console.error('Error fetching widgets:', error)
        throw error
      }

      return data || []
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Memoized filtered widgets for better performance
  const filteredWidgets = useMemo(() => {
    if (!searchQuery) {
      return widgets
    }

    const query = searchQuery.toLowerCase()
    return widgets.filter(widget => {
      const titleMatch = widget.title?.toLowerCase().includes(query)
      const descMatch = widget.description?.toLowerCase().includes(query)
      return titleMatch || descMatch
    })
  }, [widgets, searchQuery])

  const selectedCategoryData = categories.find(cat => cat.value === selectedCategory)
  const selectedSortData = sortOptions.find(opt => opt.value === sortBy)
  const SortIcon = selectedSortData?.icon || Clock

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-black" />
          <h1 className="text-3xl font-bold text-black">Discover Widgets</h1>
        </div>
        <p className="text-zinc-600">
          Explore amazing Flutter widgets created by the community
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-[200px] bg-zinc-50 border-zinc-200">
              <div className="flex items-center gap-2">
                <span>{selectedCategoryData?.icon}</span>
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <span>{cat.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-[180px] bg-zinc-50 border-zinc-200">
              <div className="flex items-center gap-2">
                <SortIcon className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span>{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-black text-white' : ''}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-black text-white' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-zinc-600">
            Found <span className="font-semibold text-black">{filteredWidgets.length}</span> widgets
            {selectedCategory !== 'all' && (
              <span> in <Badge variant="secondary" className="ml-2">{selectedCategoryData?.label}</Badge></span>
            )}
          </p>
        </div>
      )}

      {/* Widgets Grid/List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredWidgets.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50 rounded-xl">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No widgets found</h3>
            <p className="text-zinc-600">
              {searchQuery
                ? "Try adjusting your search terms"
                : selectedCategory !== 'all'
                  ? `No widgets in ${selectedCategoryData?.label} category yet`
                  : "No public widgets available"}
            </p>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredWidgets.map((widget) => (
            <WidgetCard 
              key={widget.id} 
              widget={widget} 
              viewMode={viewMode}
              showAuthor={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}