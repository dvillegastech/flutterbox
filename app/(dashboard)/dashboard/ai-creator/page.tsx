"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Loader2, Code2, Sparkles, Copy, Check, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  code?: string;
  timestamp: Date;
}

export default function AICreatorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
    if (iframeRef.current) {
      // Force reload by changing src to empty first, then back to DartPad
      iframeRef.current.src = "about:blank";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = "https://dartpad.dev/?theme=dark&run=true&split=50";
        }
      }, 100);
    }
    toast.success("Chat cleared!");
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateDartPad = (code: string) => {
    if (!iframeRef.current) return;
    
    // For small code, try to load it directly via URL
    if (code && code.length < 1500) {
      const encodedCode = encodeURIComponent(code);
      iframeRef.current.src = `https://dartpad.dev/?theme=dark&run=true&split=50&sample=${encodedCode}`;
    } else if (code) {
      // For large code, just show a message
      toast.info('Code generated! Copy and paste it into DartPad using the copy button.');
    }
  };

  const copyToClipboard = async (code: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedMessageId(messageId);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/generate-widget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate widget");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.description || "Here's your Flutter widget:",
        code: data.code,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (data.code) {
        updateDartPad(data.code);
      }
    } catch (error) {
      toast.error("Failed to generate widget. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Chat Section */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Widget Creator
                </CardTitle>
                <CardDescription>
                  Describe the Flutter widget you want to create, and I'll generate it for you
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetChat}
                title="Clear chat"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Start by describing what widget you want to create</p>
                    <p className="text-xs mt-2">For example: "Create a login form with email and password fields"</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg p-3 space-y-2",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.code && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-mono">Flutter Code:</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const dartPadUrl = `https://dartpad.dev/?theme=dark&run=true&split=50`;
                                    window.open(dartPadUrl, '_blank');
                                    copyToClipboard(message.code!, message.id);
                                    toast.success('Code copied! Paste it in the new DartPad window.');
                                  }}
                                  className="h-6 px-2"
                                  title="Open in DartPad"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(message.code!, message.id)}
                                  className="h-6 px-2"
                                  title="Copy code"
                                >
                                  {copiedMessageId === message.id ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <pre className="bg-background/50 p-2 rounded text-xs overflow-x-auto">
                              <code>{message.code.substring(0, 200)}...</code>
                            </pre>
                          </div>
                        )}
                        <p className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <Separator />
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                placeholder="Describe your Flutter widget..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* DartPad Preview Section */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              Your generated widget will appear here in DartPad
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-8rem)]">
            <iframe
              ref={iframeRef}
              src="https://dartpad.dev/?theme=dark&run=true&split=50"
              className="w-full h-full rounded-lg border"
              title="DartPad Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}