'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { 
  Heart, 
  Eye, 
  Copy, 
  Share2, 
  Code2, 
  User, 
  Calendar,
  ArrowLeft,
  Lock,
  Sparkles
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-zinc-900 rounded-lg">
      <div className="text-white">Loading editor...</div>
    </div>
  )
})

export default function PublicWidgetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [widget, setWidget] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
        .select(`
          *,
          profiles!widgets_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('id', widgetId)
        .eq('is_public', true)
        .single()

      if (widgetError) throw widgetError

      setWidget(widgetData)
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
      await supabase.rpc('increment_widget_views', { widget_id: widgetId })
    } catch (error) {
      console.error('Error incrementing views:', error)
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
    const url = `${window.location.origin}/widget/${widgetId}`
    
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

  const handleSignupRedirect = (action: string) => {
    router.push(`/signup?redirect=/dashboard/widget/${widgetId}&action=${action}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="h-32 bg-zinc-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-zinc-100 rounded-xl animate-pulse" />
              <div className="h-96 bg-zinc-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!widget) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Code2 className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Widget not found</h2>
            <p className="text-zinc-600 mb-6">
              This widget might be private or doesn't exist.
            </p>
            <Link href="/browse">
              <Button className="bg-black text-white hover:bg-zinc-900">
                Browse Public Widgets
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="hover:bg-zinc-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCopyCode}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Widget Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{widget.title}</h1>
              {widget.description && (
                <p className="text-lg text-zinc-600">{widget.description}</p>
              )}
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={widget.profiles?.avatar_url} />
                  <AvatarFallback className="bg-zinc-200">
                    {widget.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {widget.profiles?.username || 'Anonymous'}
                </span>
              </div>
              
              <Badge variant="secondary">
                {widget.category}
              </Badge>
              
              <div className="flex items-center gap-1 text-zinc-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(widget.created_at), { addSuffix: true })}</span>
              </div>
              
              <div className="flex items-center gap-1 text-zinc-600">
                <Eye className="h-4 w-4" />
                <span>{widget.views_count} views</span>
              </div>
              
              <div className="flex items-center gap-1 text-zinc-600">
                <Heart className="h-4 w-4" />
                <span>{widget.likes_count} likes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Code Editor */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-zinc-200">
              <CardHeader className="bg-zinc-900 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    <span className="font-mono text-sm">widget.dart</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyCode}
                    className="text-white hover:bg-zinc-800"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <MonacoEditor
                  height="500px"
                  language="dart"
                  theme="vs-dark"
                  value={widget.code}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            {/* Sign Up CTA */}
            <Card className="border-2 border-black overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-700 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-bold">Want More Features?</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-zinc-600">
                  Sign up for free to unlock:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>Like and save widgets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Code2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Create your own widgets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <User className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Build your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span>Private widget collections</span>
                  </li>
                </ul>
                
                <div className="space-y-2 pt-2">
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-black text-white hover:bg-zinc-900">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons (Disabled for non-users) */}
            <Card className="border-zinc-200">
              <CardHeader>
                <h3 className="font-semibold text-sm">Widget Actions</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSignupRedirect('like')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Like Widget
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSignupRedirect('fork')}
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Fork & Edit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}