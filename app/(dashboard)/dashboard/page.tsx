import { createSupabaseServer } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code2, Heart, Eye, TrendingUp, Plus, ArrowRight, Sparkles, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real user statistics
  const [userWidgets, totalLikes, todayViews, recentActivity, trendingWidgets] = await Promise.all([
    // User's widgets count
    supabase
      .from('widgets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user?.id || ''),
    
    // Total likes on user's widgets
    supabase
      .from('widgets')
      .select('likes_count')
      .eq('user_id', user?.id || ''),
    
    // Today's views (simplified - showing total views for now)
    supabase
      .from('widgets')
      .select('views_count')
      .eq('user_id', user?.id || ''),
    
    // Recent activity (latest widgets)
    supabase
      .from('widgets')
      .select('id, title, created_at, likes_count, views_count')
      .eq('user_id', user?.id || '')
      .order('created_at', { ascending: false })
      .limit(5),
    
    // Trending widgets (most liked public widgets)
    supabase
      .from('widgets')
      .select(`
        id,
        title,
        likes_count,
        views_count,
        profiles (username)
      `)
      .eq('is_public', true)
      .order('likes_count', { ascending: false })
      .limit(5)
  ])

  const widgetCount = userWidgets.count || 0
  const likesCount = totalLikes.data?.reduce((sum, w) => sum + (w.likes_count || 0), 0) || 0
  const viewsCount = todayViews.data?.reduce((sum, w) => sum + (w.views_count || 0), 0) || 0

  // Calculate growth percentages (mock data for now)
  const likesGrowth = likesCount > 0 ? '+12%' : '—'
  const viewsGrowth = viewsCount > 0 ? '+8%' : '—'
  const widgetsGrowth = widgetCount > 0 ? '+2' : '—'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section with Gradient */}
      <div className="mb-8 bg-gradient-to-r from-zinc-50 to-zinc-100 rounded-2xl p-8 border border-zinc-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              Welcome back{user?.user_metadata?.username ? `, ${user.user_metadata.username}` : ''}! 👋
            </h1>
            <p className="text-zinc-600 text-lg">
              Your FlutterBox dashboard is looking great today
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button className="bg-black hover:bg-zinc-800 text-white gap-2">
              <Plus className="h-4 w-4" />
              Create Widget
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards with improved design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-zinc-200 hover:shadow-lg transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-600">
                Your Widgets
              </CardTitle>
              <div className="p-2 bg-black/5 rounded-lg">
                <Code2 className="h-4 w-4 text-black" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-black">{widgetCount}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  {widgetCount === 0 ? 'Create your first' : 'Total published'}
                </p>
              </div>
              <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {widgetsGrowth}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 hover:shadow-lg transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-600">
                Total Likes
              </CardTitle>
              <div className="p-2 bg-red-50 rounded-lg">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-black">{likesCount}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  From the community
                </p>
              </div>
              <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {likesGrowth}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 hover:shadow-lg transition-all duration-200 hover:border-zinc-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-600">
                Total Views
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Eye className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-black">{viewsCount}</div>
                <p className="text-xs text-zinc-500 mt-1">
                  Widget impressions
                </p>
              </div>
              <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {viewsGrowth}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/create" className="group">
          <div className="p-4 border border-zinc-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-200 flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">New Widget</span>
          </div>
        </Link>
        <Link href="/dashboard/browse" className="group">
          <div className="p-4 border border-zinc-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-200 flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Discover</span>
          </div>
        </Link>
        <Link href="/dashboard/widgets" className="group">
          <div className="p-4 border border-zinc-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-200 flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
              <Code2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">My Widgets</span>
          </div>
        </Link>
        <Link href="/dashboard/liked" className="group">
          <div className="p-4 border border-zinc-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-200 flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
              <Heart className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Favorites</span>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity with improved design */}
        <Card className="border-zinc-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-zinc-600" />
              <CardTitle>Your Recent Activity</CardTitle>
            </div>
            {recentActivity.data && recentActivity.data.length > 0 && (
              <Link href="/dashboard/widgets">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recentActivity.data && recentActivity.data.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.data.map((widget: any) => (
                  <Link 
                    key={widget.id} 
                    href={`/dashboard/widget/${widget.id}`}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg flex items-center justify-center group-hover:from-black group-hover:to-zinc-800 transition-all">
                        <Code2 className="h-5 w-5 text-zinc-600 group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{widget.title}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(widget.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{widget.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{widget.views_count || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code2 className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-zinc-500 mb-3">No widgets yet</p>
                <Link href="/dashboard/create">
                  <Button size="sm" className="bg-black hover:bg-zinc-800 text-white gap-1">
                    Create your first widget
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Widgets with improved design */}
        <Card className="border-zinc-200 hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-zinc-600" />
              <CardTitle>Trending in Community</CardTitle>
            </div>
            {trendingWidgets.data && trendingWidgets.data.length > 0 && (
              <Link href="/dashboard/browse">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Browse all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {trendingWidgets.data && trendingWidgets.data.length > 0 ? (
              <div className="space-y-3">
                {trendingWidgets.data.map((widget: any, index: number) => (
                  <Link
                    key={widget.id}
                    href={`/dashboard/widget/${widget.id}`}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center font-bold text-orange-600">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{widget.title}</p>
                        <p className="text-xs text-zinc-500">
                          by @{widget.profiles?.username || 'anonymous'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-red-500">
                        <Heart className="h-3 w-3 fill-current" />
                        <span className="font-medium">{widget.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-500">
                        <Eye className="h-3 w-3" />
                        <span>{widget.views_count || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-zinc-500 mb-3">No trending widgets yet</p>
                <Link href="/dashboard/browse">
                  <Button size="sm" variant="outline" className="gap-1">
                    Explore widgets
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pro tip section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-zinc-900 to-black text-white rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white/10 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Pro Tip</h3>
            <p className="text-sm text-zinc-300">
              Share your widgets on social media to get more visibility and likes from the Flutter community.
              Use #FlutterBox to be featured!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}