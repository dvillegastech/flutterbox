import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Code2, Users, Heart, Sparkles, Github, Twitter, Globe, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-2xl mb-6">
              <Code2 className="h-10 w-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
              About FlutterForge
            </h1>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Building the future of Flutter development through open collaboration and shared knowledge
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                FlutterForge was born from a simple idea: Flutter developers should have a centralized, 
                minimalist platform to share and discover high-quality widgets. We believe in the power 
                of open-source collaboration and the importance of making code accessible to everyone.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Our platform removes the barriers between developers and great code. No colorful distractions, 
                no complex interfaces—just clean, monochrome design that puts the focus where it belongs: 
                on the code itself.
              </p>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Simplicity First</h3>
                    <p className="text-sm text-zinc-600">
                      We believe great tools are simple tools. Our monochrome design philosophy ensures 
                      nothing gets between you and the code.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Community Driven</h3>
                    <p className="text-sm text-zinc-600">
                      Built by developers, for developers. Every feature is designed with the Flutter 
                      community&apos;s needs in mind.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Open Source</h3>
                    <p className="text-sm text-zinc-600">
                      Every widget is open-source. Share freely, learn from others, and contribute 
                      to the collective knowledge of Flutter development.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Code Quality</h3>
                    <p className="text-sm text-zinc-600">
                      We promote best practices and high-quality code. Every widget can be tested 
                      live with DartPad integration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-zinc-50 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Platform Impact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-black">2,847+</div>
                <div className="text-zinc-600 mt-1">Widgets Shared</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">1,234+</div>
                <div className="text-zinc-600 mt-1">Active Developers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black">10K+</div>
                <div className="text-zinc-600 mt-1">Code Snippets Used</div>
              </div>
            </div>
          </div>

          {/* Philosophy Section */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Philosophy</h2>
              <blockquote className="text-xl italic text-zinc-700 border-l-4 border-black pl-6 my-6">
                &quot;Show code, not colors&quot;
              </blockquote>
              <p className="text-zinc-600 leading-relaxed mb-4">
                In a world of overwhelming visual complexity, we chose restraint. FlutterForge&apos;s 
                monochrome aesthetic isn&apos;t just a design choice—it&apos;s a statement about what matters 
                in development: clarity, functionality, and the beauty of well-written code.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                We believe that when you remove distractions, you create space for innovation. That&apos;s 
                why every pixel, every shade of gray, serves a purpose: to help you focus on what you 
                do best—creating amazing Flutter applications.
              </p>
            </CardContent>
          </Card>

          {/* Team Section */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Built with Love</h2>
            <p className="text-zinc-600 mb-8">
              FlutterForge is maintained by a passionate team of Flutter enthusiasts dedicated to 
              improving the developer experience for everyone.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="https://github.com" className="p-3 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="p-3 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-black text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Join the FlutterForge Community</h2>
            <p className="text-zinc-300 mb-6">
              Start sharing your Flutter widgets and discover amazing components from developers worldwide
            </p>
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-zinc-100">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}