'use client'

import { useEffect, useState } from 'react'
import { WidgetCard } from '@/components/widgets/widget-card'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Heart, RefreshCw, Grid3x3, List, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function LikedWidgetsPage() {
  const [widgets, setWidgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { toast } = useToast()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    fetchLikedWidgets()
  }, [])

  const fetchLikedWidgets = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to view liked widgets',
          variant: 'destructive',
        })
        return
      }

      // First get liked widget IDs
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('widget_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (likesError) {
        console.error('Error fetching likes:', likesError.message)
        return
      }

      if (!likes || likes.length === 0) {
        setWidgets([])
        return
      }

      // Then get the actual widgets
      const widgetIds = likes.map(l => l.widget_id)
      const { data: widgetsData, error: widgetsError } = await supabase
        .from('widgets')
        .select('*')
        .in('id', widgetIds)

      if (widgetsError) {
        console.error('Error fetching widgets:', widgetsError.message)
      } else {
        // Add is_liked flag and default username
        const likedWidgets = (widgetsData || []).map(widget => ({
          ...widget,
          is_liked: true,
          profiles: { username: 'Developer' }
        }))
        setWidgets(likedWidgets)
      }
    } catch (error: any) {
      console.error('Error fetching liked widgets:', error?.message || 'Unknown error')
      toast({
        title: 'Error',
        description: 'Failed to fetch liked widgets',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-black flex items-center gap-3">
                <div className="relative">
                  <Heart className="h-8 w-8 fill-red-500 text-red-500" />
                  <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-500" />
                </div>
                Liked Widgets
              </h1>
              <p className="text-zinc-600 mt-2 text-lg">
                Your collection of favorite Flutter widgets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchLikedWidgets}
                variant="outline"
                disabled={loading}
                className="border-2"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center bg-zinc-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  className={viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-zinc-600'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  className={viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-zinc-600'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          {!loading && widgets.length > 0 && (
            <Card className="border-2 border-zinc-100 bg-gradient-to-r from-red-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 mb-1">Total Liked Widgets</p>
                    <p className="text-3xl font-bold text-black">{widgets.length}</p>
                    <p className="text-sm text-zinc-500 mt-2">
                      From {new Set(widgets.map(w => w.user_id)).size} different creators
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-zinc-700">
                        {widgets.filter(w => w.category === 'buttons').length}
                      </p>
                      <p className="text-xs text-zinc-500">Buttons</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-700">
                        {widgets.filter(w => w.category === 'cards').length}
                      </p>
                      <p className="text-xs text-zinc-500">Cards</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-zinc-700">
                        {widgets.filter(w => w.category === 'animations').length}
                      </p>
                      <p className="text-xs text-zinc-500">Animations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
        ) : widgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-pink-50 mb-6">
              <Heart className="h-12 w-12 text-red-300" />
            </div>
            <h3 className="text-2xl font-semibold text-zinc-900 mb-3">No liked widgets yet</h3>
            <p className="text-zinc-600 max-w-md mx-auto mb-6">
              Start exploring and like widgets to build your personal collection of favorite Flutter components
            </p>
            <Link href="/dashboard/browse">
              <Button className="bg-black text-white hover:bg-zinc-900">
                <Sparkles className="h-4 w-4 mr-2" />
                Explore Widgets
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {widgets.map((widget) => (
                  <WidgetCard key={widget.id} widget={widget} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {widgets.map((widget) => (
                  <div key={widget.id} className="bg-white rounded-xl border-2 border-zinc-100 p-6 hover:border-red-200 transition-all hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black mb-2">{widget.title}</h3>
                        <p className="text-zinc-600 mb-4">{widget.description}</p>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                          <span className="px-3 py-1 bg-zinc-100 rounded-full">{widget.category}</span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            Liked
                          </span>
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