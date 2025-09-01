'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestQueryPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseBrowser()

  const runTests = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // Test 1: Get current user
      const { data: { user } } = await supabase.auth.getUser()
      testResults.currentUser = user?.id || 'No user'

      // Test 2: Query ALL widgets (no filter)
      const { data: allWidgets, error: allError } = await supabase
        .from('widgets')
        .select('*')
      
      testResults.allWidgets = {
        count: allWidgets?.length || 0,
        error: allError?.message,
        data: allWidgets
      }

      // Test 3: Query widgets for current user
      if (user) {
        const { data: userWidgets, error: userError } = await supabase
          .from('widgets')
          .select('*')
          .eq('user_id', user.id)
        
        testResults.userWidgets = {
          count: userWidgets?.length || 0,
          error: userError?.message,
          data: userWidgets,
          query: `user_id = ${user.id}`
        }
      }

      // Test 4: Query with the specific ID from the widget
      const { data: specificWidget, error: specificError } = await supabase
        .from('widgets')
        .select('*')
        .eq('user_id', '510b83bb-4aa1-482f-9bb8-d1c624f3919b')
      
      testResults.specificIdQuery = {
        count: specificWidget?.length || 0,
        error: specificError?.message,
        data: specificWidget,
        query: "user_id = '510b83bb-4aa1-482f-9bb8-d1c624f3919b'"
      }

      // Test 5: Query widget by ID directly
      const { data: widgetById, error: widgetByIdError } = await supabase
        .from('widgets')
        .select('*')
        .eq('id', 'ebdbeffc-8f37-40e3-b00a-abd7365f1233')
        .single()
      
      testResults.widgetById = {
        found: !!widgetById,
        error: widgetByIdError?.message,
        data: widgetById
      }

      // Test 6: Get all profiles to verify relationship
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
      
      testResults.profiles = {
        count: profiles?.length || 0,
        error: profilesError?.message,
        data: profiles
      }

    } catch (error: any) {
      testResults.generalError = error.message
    }

    setResults(testResults)
    setLoading(false)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Query Test Page</h1>
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {Object.keys(results).length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-zinc-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card className="border-orange-600">
            <CardHeader>
              <CardTitle className="text-orange-600">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>Current User ID: <code>{results.currentUser}</code></li>
                <li>All Widgets Count: <code>{results.allWidgets?.count || 0}</code></li>
                <li>User Widgets Count: <code>{results.userWidgets?.count || 0}</code></li>
                <li>Specific ID Query Count: <code>{results.specificIdQuery?.count || 0}</code></li>
                <li>Widget ebdbeffc-8f37-40e3-b00a-abd7365f1233 Found: <code>{results.widgetById?.found ? 'YES' : 'NO'}</code></li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}