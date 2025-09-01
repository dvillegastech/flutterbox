'use client'

import { Code2, Play, Users } from 'lucide-react'

const features = [
  {
    icon: Code2,
    title: 'Share Code',
    description: 'Upload and share Flutter widgets with the community. Syntax highlighting and version control included.',
  },
  {
    icon: Play,
    title: 'Live Preview',
    description: 'Test widgets instantly with DartPad integration. See your code come to life in real-time.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Collaborate with developers worldwide. Fork, improve, and contribute to open source widgets.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-zinc-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            Everything you need to share Flutter code
          </h2>
          <p className="mt-4 text-lg text-zinc-600 max-w-2xl mx-auto">
            A simple, powerful platform designed for Flutter developers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all hover:scale-[1.02]"
              >
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}