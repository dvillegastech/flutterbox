'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Globe, Github, Twitter, Save, Upload } from 'lucide-react'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    email: '',
    website: '',
    github: '',
    twitter: '',
  })
  const { toast } = useToast()
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        })
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setProfile({
          ...profile,
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          email: user.email || '',
        })
      } else {
        setProfile({
          ...profile,
          email: user.email || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        })
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfile({ ...profile, avatar_url: publicUrl })
      
      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully',
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload avatar',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Password reset email sent. Check your inbox.',
      })
    } catch (error) {
      console.error('Password reset error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Profile Settings</h1>
        <p className="text-zinc-600 mt-2">Manage your account and public profile</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile.avatar_url} 
                    alt={profile.username}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" disabled={uploading} asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Avatar'}
                        </span>
                      </Button>
                    </div>
                  </Label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    JPG, PNG or GIF. Max 2MB. Will be converted to monochrome.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="johndoe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-zinc-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github">
                    <Github className="h-4 w-4 inline mr-1" />
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    value={profile.github}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    placeholder="username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">
                    <Twitter className="h-4 w-4 inline mr-1" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    value={profile.twitter}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                    placeholder="@username"
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="bg-black text-white hover:bg-zinc-900"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <p className="text-sm text-zinc-600">
                  We&apos;ll send you an email to reset your password
                </p>
                <Button 
                  variant="outline"
                  onClick={handlePasswordReset}
                >
                  Send Password Reset Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for programmatic access (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-zinc-500">
                <p>API access will be available in a future update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}