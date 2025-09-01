'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Eye, Code2, User } from 'lucide-react'
import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface WidgetCardProps {
  widget: {
    id: string
    title: string
    description?: string
    category: string
    likes_count: number
    views_count: number
    user_id: string
    profiles?: {
      username: string
    }
    is_liked?: boolean
  }
  showActions?: boolean
}

export function WidgetCard({ widget, showActions = true }: WidgetCardProps) {
  const [isLiked, setIsLiked] = useState(widget.is_liked || false)
  const [likesCount, setLikesCount] = useState(widget.likes_count)
  const { toast } = useToast()
  const supabase = createSupabaseBrowser()

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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
          .match({ user_id: user.id, widget_id: widget.id })
        
        setIsLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: user.id, widget_id: widget.id })
        
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

  return (
    <Card className="group hover:border-zinc-400 transition-all hover:scale-[1.02] cursor-pointer">
      <Link href={`/dashboard/widget/${widget.id}`}>
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
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-black text-black' : ''}`} />
                <span>{likesCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{widget.views_count}</span>
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLike}
                  className="h-8 px-2"
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-black' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                >
                  <Code2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}