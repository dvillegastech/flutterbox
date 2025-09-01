'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { Save, Play, Eye } from 'lucide-react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>
})

const defaultCode = `import 'package:flutter/material.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.flutter_dash, size: 48),
          SizedBox(height: 8),
          Text(
            'Hello FlutterForge!',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}`

const categories = [
  'Buttons',
  'Cards',
  'Forms',
  'Navigation',
  'Lists',
  'Animations',
  'Layouts',
  'Other',
]

export default function CreateWidgetPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [code, setCode] = useState(defaultCode)
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dartpadUrl, setDartpadUrl] = useState('')
  const { toast } = useToast()
  const supabase = createSupabaseBrowser()

  const handleSave = async (isDraft = false) => {
    if (!title || !code || !category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create widgets',
          variant: 'destructive',
        })
        return
      }

      const { data, error } = await supabase.from('widgets').insert({
        user_id: user.id,
        title,
        description,
        code,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        is_public: isDraft ? false : isPublic,
      }).select().single()

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description: isDraft ? 'Draft saved successfully' : 'Widget published successfully',
      })

      // Navigate to the widgets page after successful creation
      if (data) {
        setTimeout(() => {
          window.location.href = '/dashboard/widgets'
        }, 1000)
      }
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Error',
        description: 'Failed to save widget',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    // Create a complete Flutter app with the widget code
    const fullCode = `import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FlutterForge Preview',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: Scaffold(
        appBar: AppBar(
          title: Text('${title || 'Widget Preview'}'),
        ),
        body: Center(
          child: MyWidget(),
        ),
      ),
    );
  }
}

${code}`;

    // Encode the code for DartPad URL using base64
    const encodedCode = btoa(fullCode)
    const dartpadUrl = `https://dartpad.dev/embed-flutter.html?theme=dark&run=true&split=50&ga_id=preview#${encodedCode}`
    setDartpadUrl(dartpadUrl)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-zinc-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Widget</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handlePreview}
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              className="bg-black text-white hover:bg-zinc-900"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <Play className="h-4 w-4 mr-2" />
              {saving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Widget name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="flutter, widget, ui"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <Tabs defaultValue="code" className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b">
            <TabsTrigger value="code">Code Editor</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="flex-1 mt-0">
            <MonacoEditor
              height="100%"
              language="dart"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 mt-0">
            {dartpadUrl ? (
              <iframe
                src={dartpadUrl}
                className="w-full h-full border-0"
                title="DartPad Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                  <p>Click &quot;Preview&quot; to see your widget in action</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}