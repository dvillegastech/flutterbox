import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code2, Rocket, Package, GitBranch, Shield, Zap } from 'lucide-react'

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
              Documentation
            </h1>
            <p className="text-xl text-zinc-600">
              Everything you need to know about using FlutterBox
            </p>
          </div>

          <Tabs defaultValue="getting-started" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="publishing">Publishing</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="getting-started" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="h-5 w-5" />
                    <span>Quick Start</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-zinc max-w-none">
                  <h3 className="text-lg font-semibold mb-3">1. Create an Account</h3>
                  <p className="text-zinc-600 mb-4">
                    Sign up for a free FlutterBox account to start sharing and discovering Flutter widgets.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">2. Browse Widgets</h3>
                  <p className="text-zinc-600 mb-4">
                    Explore our collection of open-source Flutter widgets. Filter by category, search by name, or sort by popularity.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">3. Test with DartPad</h3>
                  <p className="text-zinc-600 mb-4">
                    Every widget includes a live preview powered by DartPad. Test and modify code in real-time before using it in your project.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3">4. Share Your Widgets</h3>
                  <p className="text-zinc-600">
                    Contribute to the community by sharing your own Flutter widgets. Use our Monaco Editor with Dart syntax highlighting.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Using Widgets in Your Project</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-zinc-900 text-white p-4 rounded-lg font-mono text-sm">
                    <div className="mb-2">
                      <span className="text-zinc-400">// 1. Copy the widget code</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-zinc-400">// 2. Create a new file in your lib/widgets folder</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-zinc-400">// 3. Paste and import required packages</span>
                    </div>
                    <div className="text-green-400">
                      import &apos;package:flutter/material.dart&apos;;
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publishing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="h-5 w-5" />
                    <span>Publishing Guidelines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Code Quality</h3>
                    <ul className="list-disc list-inside text-zinc-600 space-y-1">
                      <li>Write clean, readable code with proper formatting</li>
                      <li>Include meaningful variable and function names</li>
                      <li>Add comments for complex logic</li>
                      <li>Ensure your widget is reusable and customizable</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Widget Information</h3>
                    <ul className="list-disc list-inside text-zinc-600 space-y-1">
                      <li>Provide a clear, descriptive title</li>
                      <li>Write a brief description of what your widget does</li>
                      <li>Select the appropriate category</li>
                      <li>Add relevant tags for better discoverability</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Testing</h3>
                    <ul className="list-disc list-inside text-zinc-600 space-y-1">
                      <li>Test your widget in DartPad before publishing</li>
                      <li>Ensure it works without external dependencies</li>
                      <li>Verify it renders correctly on different screen sizes</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Community Standards</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-600 mb-4">
                    FlutterBox is built on principles of open collaboration and respect. When publishing widgets:
                  </p>
                  <ul className="list-disc list-inside text-zinc-600 space-y-2">
                    <li>Respect intellectual property rights</li>
                    <li>Don&apos;t publish malicious or harmful code</li>
                    <li>Give credit when building upon others&apos; work</li>
                    <li>Be constructive and helpful in comments</li>
                    <li>Report inappropriate content to moderators</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>API Access</span>
                  </CardTitle>
                  <CardDescription>
                    Programmatic access to FlutterBox (Coming Soon)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-zinc-100 border border-zinc-200 rounded-lg p-6 text-center">
                    <Code2 className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-600 mb-2">
                      REST API access is currently in development
                    </p>
                    <p className="text-sm text-zinc-500">
                      Soon you&apos;ll be able to integrate FlutterBox widgets directly into your development workflow
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Is FlutterBox free to use?</h3>
                    <p className="text-zinc-600">
                      Yes! FlutterBox is completely free for browsing, downloading, and publishing widgets. We believe in open-source collaboration.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Can I use widgets in commercial projects?</h3>
                    <p className="text-zinc-600">
                      All widgets on FlutterBox are open-source. Check individual widget licenses, but most allow commercial use with attribution.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">How do I report a bug or issue with a widget?</h3>
                    <p className="text-zinc-600">
                      Use the comment section on the widget&apos;s detail page to report issues or suggest improvements directly to the author.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Can I edit someone else&apos;s widget?</h3>
                    <p className="text-zinc-600">
                      You can fork and modify any public widget. The original author will be credited, and you can publish your improved version.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">How does the trending algorithm work?</h3>
                    <p className="text-zinc-600">
                      Trending widgets are calculated based on recent likes, views, and engagement. The algorithm updates daily to showcase fresh content.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Is there a limit to how many widgets I can publish?</h3>
                    <p className="text-zinc-600">
                      No limits! Share as many quality widgets as you&apos;d like. We encourage active contribution to the Flutter community.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}