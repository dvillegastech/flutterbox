'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  widget_id: string
  profiles: {
    username: string
    avatar_url?: string
  }
}

interface CommentsSectionProps {
  widgetId: string
  currentUserId?: string
}

export function CommentsSection({ widgetId, currentUserId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    fetchComments()
    
    // Subscribe to new comments
    const channel = supabase
      .channel(`comments:${widgetId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `widget_id=eq.${widgetId}`
        }, 
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [widgetId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('widget_id', widgetId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    if (!currentUserId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to comment',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          widget_id: widgetId,
          user_id: currentUserId,
        })

      if (error) throw error

      setNewComment('')
      await fetchComments()
      
      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      })
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments(prev => prev.filter(c => c.id !== commentId))
      
      toast({
        title: 'Success',
        description: 'Comment deleted',
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex space-x-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-zinc-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-zinc-200 rounded" />
              <div className="h-20 bg-zinc-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      {currentUserId && (
        <div className="space-y-3">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              className="bg-black text-white hover:bg-zinc-800"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      )}

      {!currentUserId && (
        <div className="text-center py-6 bg-zinc-50 rounded-lg">
          <p className="text-zinc-600">Please sign in to leave a comment</p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p>No comments yet</p>
          <p className="text-sm mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback className="bg-zinc-200 text-sm">
                  {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.profiles?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {currentUserId === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-zinc-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}