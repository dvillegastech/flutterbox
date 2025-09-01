'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUserInfo(user)

      // Get profile if user exists
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug Information</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>
        <CardContent>
          {userInfo ? (
            <pre className="bg-zinc-100 p-4 rounded overflow-auto text-xs">
              User ID: {userInfo.id}
              Email: {userInfo.email}
              Created: {userInfo.created_at}
              Last Sign In: {userInfo.last_sign_in_at}
              Metadata: {JSON.stringify(userInfo.user_metadata, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">No user authenticated</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Data</CardTitle>
        </CardHeader>
        <CardContent>
          {profile ? (
            <pre className="bg-zinc-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(profile, null, 2)}
            </pre>
          ) : (
            <p className="text-zinc-600">No profile found</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Info</CardTitle>
        </CardHeader>
        <CardContent>
          {session ? (
            <pre className="bg-zinc-100 p-4 rounded overflow-auto text-xs">
              Access Token: {session.access_token?.substring(0, 20)}...
              Expires At: {session.expires_at}
              User ID from Session: {session.user?.id}
            </pre>
          ) : (
            <p className="text-red-600">No active session</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-600">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ Security Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Your Current User ID:</strong>{' '}
              <code className="bg-zinc-200 px-2 py-1 rounded">
                {userInfo?.id || 'NOT AUTHENTICATED'}
              </code>
            </p>
            <p>
              <strong>Widget Owner ID (from your message):</strong>{' '}
              <code className="bg-zinc-200 px-2 py-1 rounded">
                510b83bb-4aa1-482f-9bb8-d1c624f3919b
              </code>
            </p>
            <p className="mt-4 font-semibold">
              {userInfo?.id === '510b83bb-4aa1-482f-9bb8-d1c624f3919b' 
                ? '✅ IDs match - This is your widget' 
                : '❌ IDs DO NOT match - This widget belongs to another user!'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}