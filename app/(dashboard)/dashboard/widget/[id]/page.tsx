'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { 
  Heart, 
  Eye, 
  Copy, 
  Share2, 
  Code2, 
  User, 
  Calendar, 
  Tag, 
  ArrowLeft,
  Download,
  GitFork,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Flag
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { CommentsSection } from '@/components/widgets/comments-section'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-zinc-900 rounded-lg">
      <div className="text-white">Loading editor...</div>
    </div>
  )
})

export default function WidgetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [widget, setWidget] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createSupabaseBrowser()
  const widgetId = params.id as string

  useEffect(() => {
    if (widgetId) {
      fetchWidget()
      incrementViewCount()
    }
  }, [widgetId])

  const fetchWidget = async () => {
    try {
      const { data: widgetData, error: widgetError } = await supabase
        .from('widgets')
        .select('*')
        .eq('id', widgetId)
        .single()

      if (widgetError) throw widgetError

      // Get profile data separately
      let profileData = null
      if (widgetData.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, bio, avatar_url')
          .eq('id', widgetData.user_id)
          .single()
        profileData = profile
      }

      // Combine widget with profile data
      const widgetWithProfile = {
        ...widgetData,
        profiles: profileData || { username: 'Anonymous', bio: null }
      }

      setWidget(widgetWithProfile)
      setLikesCount(widgetData.likes_count)

      // Get comments count
      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('widget_id', widgetId)
      
      setCommentsCount(commentCount || 0)

      // Check if user has liked this widget
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('*')
          .match({ user_id: user.id, widget_id: widgetId })
          .single()
        
        setIsLiked(!!likeData)
      }
    } catch (error) {
      console.error('Error fetching widget:', error)
      toast({
        title: 'Error',
        description: 'Failed to load widget',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async () => {
    try {
      // First try RPC function
      const { error: rpcError } = await supabase.rpc('increment_view_count', { widget_id: widgetId })
      
      // If RPC fails, try direct update
      if (rpcError) {
        console.log('RPC failed, trying direct update')
        const { data: currentWidget } = await supabase
          .from('widgets')
          .select('views_count')
          .eq('id', widgetId)
          .single()
        
        if (currentWidget) {
          await supabase
            .from('widgets')
            .update({ views_count: (currentWidget.views_count || 0) + 1 })
            .eq('id', widgetId)
        }
      }
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to like widgets',
        variant: 'destructive',
      })
      return
    }

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, widget_id: widgetId })
        
        setIsLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, widget_id: widgetId })
        
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Like error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        variant: 'destructive',
      })
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(widget.code)
    toast({
      title: 'Success',
      description: 'Code copied to clipboard',
    })
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/widget/${widgetId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: widget.title,
          text: widget.description || `Check out this Flutter widget: ${widget.title}`,
          url: url,
        })
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          navigator.clipboard.writeText(url)
          toast({
            title: 'Success',
            description: 'Widget URL copied to clipboard',
          })
        }
      }
    } else {
      navigator.clipboard.writeText(url)
      toast({
        title: 'Success',
        description: 'Widget URL copied to clipboard',
      })
    }
  }

  const handleFork = async () => {
    if (!currentUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to fork widgets',
        variant: 'destructive',
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('widgets')
        .insert({
          title: `${widget.title} (Fork)`,
          description: widget.description,
          code: widget.code,
          category: widget.category,
          tags: widget.tags,
          is_public: false,
          user_id: currentUser.id,
          forked_from: widgetId,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Widget forked successfully',
      })
      
      router.push(`/dashboard/widget/${data.id}`)
    } catch (error) {
      console.error('Fork error:', error)
      toast({
        title: 'Error',
        description: 'Failed to fork widget',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([widget.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${widget.title.toLowerCase().replace(/\s+/g, '_')}.dart`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Widget code downloaded',
    })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this widget?')) return

    try {
      const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', widgetId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Widget deleted successfully',
      })
      
      router.push('/dashboard/widgets')
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete widget',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-32 bg-zinc-100 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-zinc-100 rounded-lg animate-pulse" />
            <div className="h-96 bg-zinc-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!widget) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500">Widget not found</p>
      </div>
    )
  }

  const isOwner = currentUser?.id === widget.user_id

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-zinc-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <div>
                <h1 className="text-2xl font-bold text-black">{widget.title}</h1>
                {widget.description && (
                  <p className="text-zinc-600 mt-1">{widget.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isLiked ? "default" : "outline"}
                onClick={handleLike}
                className={isLiked ? 'bg-black text-white hover:bg-zinc-800' : ''}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-white' : ''}`} />
                {likesCount}
              </Button>
              
              <Button variant="outline" onClick={handleCopyCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleFork}>
                    <GitFork className="h-4 w-4 mr-2" />
                    Fork Widget
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/widget/${widgetId}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Meta Information Bar */}
          <div className="flex items-center space-x-6 mt-6 text-sm text-zinc-600">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={widget.profiles?.avatar_url} />
                <AvatarFallback className="text-xs bg-zinc-200">
                  {widget.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-black">
                {widget.profiles?.username || 'Anonymous'}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(widget.created_at), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{widget.views_count} views</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{commentsCount} comments</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Tag className="h-4 w-4" />
              <span className="px-2 py-0.5 bg-zinc-100 rounded text-xs font-medium">
                {widget.category}
              </span>
            </div>
          </div>

          {/* Tags */}
          {widget.tags && widget.tags.length > 0 && (
            <div className="flex items-center space-x-2 mt-4">
              {widget.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-sm hover:bg-zinc-200 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Code and Preview */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="code" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code" className="flex items-center space-x-2">
                  <Code2 className="h-4 w-4" />
                  <span>Code</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Live Preview</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="mt-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <div className="bg-zinc-900 rounded-t-lg px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">main.dart</span>
                    </div>
                    <MonacoEditor
                      height="600px"
                      language="dart"
                      theme="vs-dark"
                      value={widget.code}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <div className="bg-zinc-900 rounded-t-lg px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-white font-medium">DartPad Preview</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-400 hover:text-white text-xs"
                          onClick={handleCopyCode}
                        >
                          Copy code to paste in DartPad
                        </Button>
                      </div>
                    </div>
                    <div className="bg-zinc-100 p-4 text-sm text-zinc-600">
                      <p className="font-medium mb-2">📝 To preview this widget:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Click "Copy code to paste in DartPad" above</li>
                        <li>Paste the code in the DartPad editor below</li>
                        <li>Click "Run" to see your widget in action</li>
                      </ol>
                    </div>
                    <iframe
                      src={`https://dartpad.dev/embed-flutter.html?theme=dark&split=50`}
                      className="w-full h-[600px] border-0 rounded-b-lg"
                      title="DartPad Preview"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            {widget.profiles && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={widget.profiles.avatar_url} />
                      <AvatarFallback className="bg-zinc-200">
                        {widget.profiles.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link 
                        href={`/profile/${widget.user_id}`}
                        className="font-semibold hover:underline"
                      >
                        {widget.profiles.username}
                      </Link>
                      {widget.profiles.bio && (
                        <p className="text-sm text-zinc-600 mt-1">{widget.profiles.bio}</p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full"
                        asChild
                      >
                        <Link href={`/profile/${widget.user_id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Widget Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-zinc-600">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">Views</span>
                    </div>
                    <span className="font-semibold">{widget.views_count}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-zinc-600">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">Likes</span>
                    </div>
                    <span className="font-semibold">{likesCount}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-zinc-600">
                      <GitFork className="h-4 w-4" />
                      <span className="text-sm">Forks</span>
                    </div>
                    <span className="font-semibold">0</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-zinc-600">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Comments</span>
                    </div>
                    <span className="font-semibold">{commentsCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleCopyCode}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Widget
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleFork}
                >
                  <GitFork className="h-4 w-4 mr-2" />
                  Fork Widget
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download as File
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Section */}
        <Card className="mt-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Comments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CommentsSection 
              widgetId={widgetId} 
              currentUserId={currentUser?.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}