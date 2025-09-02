import { createSupabaseServer } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code2, Heart, Eye } from 'lucide-react'
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
      .select('id, title, created_at')
      .eq('user_id', user?.id || '')
      .order('created_at', { ascending: false })
      .limit(3),
    
    // Trending widgets (most liked public widgets)
    supabase
      .from('widgets')
      .select(`
        id,
        title,
        likes_count,
        profiles (username)
      `)
      .eq('is_public', true)
      .order('likes_count', { ascending: false })
      .limit(3)
  ])

  const widgetCount = userWidgets.count || 0
  const likesCount = totalLikes.data?.reduce((sum, w) => sum + (w.likes_count || 0), 0) || 0
  const viewsCount = todayViews.data?.reduce((sum, w) => sum + (w.views_count || 0), 0) || 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          Welcome back{user?.user_metadata?.username ? `, ${user.user_metadata.username}` : ''}!
        </h1>
        <p className="text-zinc-600 mt-2">
          Here&apos;s an overview of your FlutterBox activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Your Widgets
            </CardTitle>
            <Code2 className="h-4 w-4 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{widgetCount}</div>
            <p className="text-xs text-zinc-500 mt-1">
              {widgetCount === 0 ? 'Create your first widget' : 'Total published'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Total Likes
            </CardTitle>
            <Heart className="h-4 w-4 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{likesCount}</div>
            <p className="text-xs text-zinc-500 mt-1">
              Across all your widgets
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-zinc-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viewsCount}</div>
            <p className="text-xs text-zinc-500 mt-1">
              People viewed your widgets
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle>Your Recent Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.data && recentActivity.data.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.data.map((widget: any) => (
                  <Link 
                    key={widget.id} 
                    href={`/dashboard/widget/${widget.id}`}
                    className="flex items-center space-x-4 hover:bg-zinc-50 p-2 rounded transition-colors"
                  >
                    <div className="w-2 h-2 bg-black rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{widget.title}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(widget.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <p>No widgets yet</p>
                <Link 
                  href="/dashboard/create" 
                  className="text-black hover:underline text-sm mt-2 inline-block"
                >
                  Create your first widget →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle>Trending Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            {trendingWidgets.data && trendingWidgets.data.length > 0 ? (
              <div className="space-y-4">
                {trendingWidgets.data.map((widget: any) => (
                  <Link
                    key={widget.id}
                    href={`/dashboard/widget/${widget.id}`}
                    className="flex items-center justify-between hover:bg-zinc-50 p-2 rounded transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{widget.title}</p>
                      <p className="text-xs text-zinc-500">
                        by @{widget.profiles?.username || 'anonymous'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-zinc-500">
                      <Heart className="h-3 w-3" />
                      <span>{widget.likes_count || 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <p>No trending widgets yet</p>
                <Link 
                  href="/dashboard/browse" 
                  className="text-black hover:underline text-sm mt-2 inline-block"
                >
                  Browse widgets →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}