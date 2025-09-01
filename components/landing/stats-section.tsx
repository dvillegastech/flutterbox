'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export function StatsSection() {
  const [stats, setStats] = useState([
    { label: 'Total Widgets', value: '0' },
    { label: 'Active Developers', value: '0' },
    { label: 'Code Snippets Shared', value: '0' },
  ])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const supabase = createSupabaseBrowser()
    
    try {
      // Fetch real statistics
      const [widgetsCount, profilesCount] = await Promise.all([
        supabase
          .from('widgets')
          .select('id', { count: 'exact', head: true })
          .eq('is_public', true),
        
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
      ])

      const totalWidgets = widgetsCount.count || 0
      const totalDevelopers = profilesCount.count || 0
      const snippetsShared = totalWidgets * 3 // Estimate based on widgets

      setStats([
        { label: 'Total Widgets', value: totalWidgets.toLocaleString() },
        { label: 'Active Developers', value: totalDevelopers.toLocaleString() },
        { label: 'Code Snippets Shared', value: snippetsShared > 1000 ? `${Math.floor(snippetsShared / 1000)}K+` : snippetsShared.toString() },
      ])
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep default values if there's an error
    }
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-5xl sm:text-6xl font-bold text-black">
                {stat.value}
              </div>
              <div className="text-lg text-zinc-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}