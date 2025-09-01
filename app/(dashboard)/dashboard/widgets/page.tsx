'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/widgets/widget-card'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Plus, Grid3x3, List, Trash2, Edit, Eye, EyeOff, RefreshCw, Package, Lock, Globe, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function MyWidgetsPage() {
  const [widgets, setWidgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('published')
  const { toast } = useToast()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    fetchMyWidgets()
  }, [])

  const fetchMyWidgets = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('Fetching widgets for user:', user?.id)
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to view your widgets',
          variant: 'destructive',
        })
        return
      }

      const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('Query result:', { data, error, userId: user.id })

      if (error) {
        console.error('Error fetching widgets:', error.message)
        toast({
          title: 'Error',
          description: `Failed to fetch widgets: ${error.message}`,
          variant: 'destructive',
        })
      } else {
        // Add profile data manually
        const widgetsWithProfile = (data || []).map(widget => ({
          ...widget,
          profiles: { username: user.user_metadata?.username || 'You' }
        }))
        setWidgets(widgetsWithProfile)
        console.log('Widgets set:', widgetsWithProfile.length, 'widgets found')
      }
    } catch (error: any) {
      console.error('Error fetching widgets:', error?.message || 'Unknown error')
      toast({
        title: 'Error',
        description: 'Failed to fetch your widgets',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (widgetId: string) => {
    if (!confirm('Are you sure you want to delete this widget?')) return

    try {
      const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', widgetId)

      if (error) throw error

      setWidgets(prev => prev.filter(w => w.id !== widgetId))
      toast({
        title: 'Success',
        description: 'Widget deleted successfully',
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete widget',
        variant: 'destructive',
      })
    }
  }

  const toggleVisibility = async (widgetId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('widgets')
        .update({ is_public: !currentStatus })
        .eq('id', widgetId)

      if (error) throw error

      setWidgets(prev => prev.map(w => 
        w.id === widgetId ? { ...w, is_public: !currentStatus } : w
      ))
      
      toast({
        title: 'Success',
        description: `Widget is now ${!currentStatus ? 'public' : 'private'}`,
      })
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update widget visibility',
        variant: 'destructive',
      })
    }
  }

  const publishedWidgets = widgets.filter(w => w.is_public)
  const privateWidgets = widgets.filter(w => !w.is_public)

  const renderWidgetList = (widgetList: any[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-zinc-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )
    }

    if (widgetList.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-zinc-500 mb-4">No widgets found</p>
          <Link href="/dashboard/create">
            <Button className="bg-black text-white hover:bg-zinc-900">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Widget
            </Button>
          </Link>
        </div>
      )
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgetList.map((widget) => (
            <div key={widget.id} className="relative group">
              <WidgetCard widget={widget} showActions={false} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-1 bg-white rounded-lg shadow-lg p-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleVisibility(widget.id, widget.is_public)}
                  >
                    {widget.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Link href={`/dashboard/widget/${widget.id}/edit`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(widget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {widgetList.map((widget) => (
          <div key={widget.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-zinc-50">
            <div className="flex-1">
              <h3 className="font-semibold">{widget.title}</h3>
              <p className="text-sm text-zinc-600">{widget.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-zinc-500">
                <span>{widget.likes_count} likes</span>
                <span>{widget.views_count} views</span>
                <span className="px-2 py-1 bg-zinc-100 rounded text-xs">{widget.category}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleVisibility(widget.id, widget.is_public)}
              >
                {widget.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Link href={`/dashboard/widget/${widget.id}/edit`}>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(widget.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-black flex items-center gap-3">
                <Package className="h-8 w-8" />
                My Widget Collection
              </h1>
              <p className="text-zinc-600 mt-2 text-lg">
                Manage and organize your Flutter widgets
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchMyWidgets}
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
              <Link href="/dashboard/create">
                <Button className="bg-black text-white hover:bg-zinc-900 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Widget
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-2 border-zinc-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Total Widgets</p>
                    <p className="text-2xl font-bold text-black">{widgets.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-zinc-300" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-zinc-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Published</p>
                    <p className="text-2xl font-bold text-green-600">{publishedWidgets.length}</p>
                  </div>
                  <Globe className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-zinc-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Private</p>
                    <p className="text-2xl font-bold text-amber-600">{privateWidgets.length}</p>
                  </div>
                  <Lock className="h-8 w-8 text-amber-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-zinc-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600">Total Views</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {widgets.reduce((sum, w) => sum + (w.views_count || 0), 0)}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="published" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Published ({publishedWidgets.length})
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private ({privateWidgets.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              All ({widgets.length})
            </TabsTrigger>
          </TabsList>

        <TabsContent value="published">
          {renderWidgetList(publishedWidgets)}
        </TabsContent>

        <TabsContent value="private">
          {renderWidgetList(privateWidgets)}
        </TabsContent>

        <TabsContent value="all">
          {renderWidgetList(widgets)}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}