import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  FileText,
  Users,
  Sparkles,
  Check,
  Star,
  Zap,
  Shield,
  MessageSquare,
  Mail,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DocuMentor</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
              Testimonials
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:underline underline-offset-4">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="w-fit" variant="outline">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered Document Editor
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Transform Your <span className="text-primary">Writing</span> with AI
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    DocuMentor combines collaborative editing with AI assistance to help you create better documents
                    faster.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/editor/new">
                    <Button size="lg" className="gap-1.5">
                      Try for Free <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" />
                    <span>14-day free trial</span>
                  </div>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 relative">
                <div className="relative rounded-lg border bg-background p-2 shadow-lg">
                  <div className="rounded-md border shadow-sm">
                    <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      </div>
                      <div className="text-xs font-medium">DocuMentor Editor</div>
                      <div className="w-16" />
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                      <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                      <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute -right-6 -top-6 rounded-lg border bg-background p-3 shadow-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="absolute -bottom-6 -left-6 rounded-lg border bg-background p-3 shadow-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -right-12 top-1/4 rounded-lg border bg-background p-3 shadow-lg animate-bounce-slow hidden md:block">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-medium">AI Suggestions</span>
                  </div>
                </div>
                <div className="absolute -left-12 bottom-1/4 rounded-lg border bg-background p-3 shadow-lg animate-pulse hidden md:block">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Real-time Chat</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trusted by section */}
            <div className="mt-16 border-t pt-8">
              <p className="text-center text-sm text-muted-foreground mb-6">TRUSTED BY INNOVATIVE TEAMS</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16 opacity-70">
                <div className="flex items-center justify-center">
                  <svg className="h-6 w-auto" viewBox="0 0 124 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4a8 8 0 110 16 8 8 0 010-16z" />
                    <path d="M36 4h4v16h-4zM44 4h8a8 8 0 110 16h-8V4zm4 4v8h4a4 4 0 100-8h-4zM64 4h12v4h-8v2h8v4h-8v2h8v4H64zM84 4h4v8h8v-8h4v16h-4v-4h-8v4h-4z" />
                  </svg>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="h-5 w-auto" viewBox="0 0 124 24" fill="currentColor">
                    <path d="M0 4h4v16H0zM8 4h4v4h4v4h-4v8H8zM20 4h4v16h-4zM28 4h12v4h-8v2h8v4h-8v2h8v4H28zM44 4h4v16h-4zM52 4h12v4h-8v2h8v4h-8v2h8v4H52zM68 4h4v16h-4zM76 4h12v4h-8v2h8v4h-8v2h8v4H76z" />
                  </svg>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="h-6 w-auto" viewBox="0 0 124 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4a8 8 0 110 16 8 8 0 010-16zM32 4h12v4h-8v2h8v4h-8v2h8v4H32zM48 4h4v16h-4zM56 4h12v4h-8v2h8v4h-8v2h8v4H56zM72 4h12v4h-4v12h-4V8h-4zM88 4h12a4 4 0 014 4v8a4 4 0 01-4 4H88V4zm4 4v8h8V8h-8z" />
                  </svg>
                </div>
                <div className="flex items-center justify-center">
                  <svg className="h-5 w-auto" viewBox="0 0 124 24" fill="currentColor">
                    <path d="M0 4h12a4 4 0 014 4v8a4 4 0 01-4 4H0V4zm4 4v8h8V8H4zM20 4h4v16h-4zM28 4h12v4h-8v2h8v4h-8v2h8v4H28zM44 4h4v16h-4zM52 4h12v4h-8v2h8v4h-8v2h8v4H52zM68 4h4v16h-4zM76 4h12a4 4 0 014 4v8a4 4 0 01-4 4H76V4zm4 4v8h8V8h-8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="px-3 py-1">Features</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Powerful AI-Assisted Editing</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  DocuMentor combines the power of AI with collaborative editing to transform your writing process.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Assistance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate content, refactor text, and get context-aware suggestions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Real-Time Collaboration</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Work simultaneously with team members on the same document.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Smart Document Management</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track changes, manage versions, and export in multiple formats.
                </p>
              </div>
            </div>

            {/* Detailed Features */}
            <div className="mt-12">
              <Tabs defaultValue="writing" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="writing">AI Writing</TabsTrigger>
                  <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                  <TabsTrigger value="management">Management</TabsTrigger>
                </TabsList>
                <TabsContent value="writing" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">AI-Powered Writing Assistant</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Our advanced AI helps you write better content by providing suggestions, improving grammar, and
                        enhancing your writing style.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Smart content suggestions based on your document context</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Grammar and style improvements as you write</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Tone adjustment for different document types</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Automatic summarization and key point extraction</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border bg-background p-2 shadow-lg">
                      <div className="rounded-md overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 border-b">
                          <div className="text-xs font-medium">AI Writing Assistant</div>
                        </div>
                        <div className="p-4 space-y-4 bg-card">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                              AI
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-sm">
                                I've analyzed your document and have some suggestions to improve clarity:
                              </p>
                              <div className="bg-muted/30 p-3 rounded-md text-sm">
                                <p className="text-green-600 dark:text-green-400">
                                  + Consider restructuring the introduction to highlight key benefits
                                </p>
                                <p className="text-red-600 dark:text-red-400">
                                  - Remove redundant information in the third paragraph
                                </p>
                                <p className="text-blue-600 dark:text-blue-400">
                                  ~ Adjust tone to be more conversational throughout
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="collaboration" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Seamless Team Collaboration</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Work together with your team in real-time, with intuitive tools for commenting, suggesting, and
                        tracking changes.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Real-time collaborative editing with multiple users</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Inline comments and threaded discussions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Suggestion mode with accept/reject functionality</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>User presence indicators and activity tracking</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border bg-background p-2 shadow-lg">
                      <div className="rounded-md overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 border-b">
                          <div className="text-xs font-medium">Team Collaboration</div>
                        </div>
                        <div className="p-4 space-y-4 bg-card">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex -space-x-2">
                              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                S
                              </div>
                              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                J
                              </div>
                              <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
                                A
                              </div>
                            </div>
                            <span>3 people editing</span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 w-full rounded bg-muted" />
                            <div className="h-3 w-full rounded bg-muted" />
                            <div className="h-3 w-3/4 rounded bg-muted" />
                          </div>
                          <div className="border-l-2 border-blue-500 pl-3 py-1 text-sm">
                            <div className="font-medium text-blue-600 dark:text-blue-400">Sarah K.</div>
                            <p className="text-xs">I think we should expand on this section with more details.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="management" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Intelligent Document Management</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Organize, track, and manage all your documents with powerful tools designed for teams.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Version history with detailed change tracking</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Smart document organization with folders and tags</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Export to multiple formats (PDF, Word, Markdown)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Integrations with cloud storage providers</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border bg-background p-2 shadow-lg">
                      <div className="rounded-md overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 border-b">
                          <div className="text-xs font-medium">Document Management</div>
                        </div>
                        <div className="p-4 space-y-4 bg-card">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">Project Proposal.md</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              12 versions
                            </Badge>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1 border-b">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">
                                  S
                                </div>
                                <span>Updated introduction</span>
                              </div>
                              <span className="text-muted-foreground">2 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">
                                  J
                                </div>
                                <span>Added budget section</span>
                              </div>
                              <span className="text-muted-foreground">Yesterday</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="px-3 py-1">Pricing</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Choose Your Plan</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                  Simple, transparent pricing that scales with your needs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3 lg:gap-8">
              {/* Free Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>For individuals just getting started</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-4xl font-bold mb-2">$0</div>
                  <p className="text-sm text-muted-foreground mb-6">Forever free</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Up to 3 documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Basic AI assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>1 collaborator per document</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Export to PDF and Markdown</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="flex flex-col relative border-primary">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>For professionals and small teams</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-4xl font-bold mb-2">$12</div>
                  <p className="text-sm text-muted-foreground mb-6">Per user / month</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Unlimited documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Advanced AI writing assistance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Up to 10 collaborators per document</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Version history (30 days)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Export to all formats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button className="w-full">Start Free Trial</Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Enterprise Plan */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For organizations with advanced needs</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-4xl font-bold mb-2">$29</div>
                  <p className="text-sm text-muted-foreground mb-6">Per user / month</p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Unlimited collaborators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Advanced permissions & roles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>SAML SSO</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Custom integrations</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/contact" className="w-full">
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                All plans include a 14-day free trial. No credit card required.
              </p>
              <div className="inline-flex items-center rounded-full border px-4 py-1.5">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm">30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="px-3 py-1">Testimonials</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Users Say</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                  Don't just take our word for it. Here's what people are saying about DocuMentor.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-3">
              {/* Testimonial 1 */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-4 left-4">
                  <div className="flex text-amber-400">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <CardContent className="pt-12 pb-8">
                  <p className="mb-6 italic">
                    "DocuMentor has completely transformed how our team collaborates on documents. The AI suggestions
                    are incredibly helpful and have improved our writing quality significantly."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">JD</span>
                    </div>
                    <div>
                      <p className="font-medium">Jessica Davis</p>
                      <p className="text-sm text-muted-foreground">Marketing Director, TechCorp</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 2 */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-4 left-4">
                  <div className="flex text-amber-400">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <CardContent className="pt-12 pb-8">
                  <p className="mb-6 italic">
                    "As a content creator, I've tried many writing tools, but DocuMentor stands out. The real-time
                    collaboration features combined with AI assistance make it the perfect tool for my team."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">MR</span>
                    </div>
                    <div>
                      <p className="font-medium">Michael Rodriguez</p>
                      <p className="text-sm text-muted-foreground">Content Lead, CreativeStudio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 3 */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-4 left-4">
                  <div className="flex text-amber-400">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <CardContent className="pt-12 pb-8">
                  <p className="mb-6 italic">
                    "The document management features in DocuMentor have saved our team countless hours. Being able to
                    track versions and collaborate in real-time has streamlined our entire workflow."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">SL</span>
                    </div>
                    <div>
                      <p className="font-medium">Sarah Lee</p>
                      <p className="text-sm text-muted-foreground">Project Manager, InnovateCo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <Badge className="px-3 py-1">About Us</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Mission</h2>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  At DocuMentor, we're on a mission to transform how people create and collaborate on documents. We
                  believe that by combining the power of AI with intuitive collaboration tools, we can help teams
                  produce better content faster.
                </p>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  Founded in 2023 by a team of AI researchers and document collaboration experts, DocuMentor has quickly
                  grown to serve thousands of users worldwide, from individual writers to enterprise teams.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
                  <Link href="/about">
                    <Button variant="outline" className="gap-1">
                      Learn More About Us <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-4">
                  <div className="overflow-hidden rounded-lg">
                    <div className="h-40 bg-muted rounded-lg"></div>
                  </div>
                  <div className="overflow-hidden rounded-lg">
                    <div className="h-40 bg-muted rounded-lg"></div>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="overflow-hidden rounded-lg">
                    <div className="h-40 bg-muted rounded-lg"></div>
                  </div>
                  <div className="overflow-hidden rounded-lg">
                    <div className="h-40 bg-muted rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">10k+</div>
                <p className="text-sm text-muted-foreground mt-1">Active Users</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">500+</div>
                <p className="text-sm text-muted-foreground mt-1">Companies</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">1M+</div>
                <p className="text-sm text-muted-foreground mt-1">Documents Created</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">99%</div>
                <p className="text-sm text-muted-foreground mt-1">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="px-3 py-1">FAQ</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                  Find answers to common questions about DocuMentor.
                </p>
              </div>
            </div>

            <div className="mx-auto max-w-3xl mt-8">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How does the AI writing assistance work?</AccordionTrigger>
                  <AccordionContent>
                    Our AI writing assistant analyzes your document in real-time and provides context-aware suggestions
                    to improve clarity, grammar, and style. It can also help generate content based on your existing
                    text, summarize sections, and more. The AI learns from your writing style over time to provide more
                    personalized suggestions.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Can I collaborate with others in real-time?</AccordionTrigger>
                  <AccordionContent>
                    Yes! DocuMentor is built for real-time collaboration. Multiple users can edit the same document
                    simultaneously, with changes appearing instantly. You can see who's currently viewing the document,
                    track their cursor position, and communicate through inline comments and our built-in chat feature.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>What file formats can I import and export?</AccordionTrigger>
                  <AccordionContent>
                    DocuMentor supports importing documents from various formats including .docx, .txt, .md, and .pdf.
                    You can export your documents to PDF, Microsoft Word (.docx), Markdown (.md), HTML, and plain text
                    formats. Enterprise plans include additional import/export options.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    Absolutely. We take security seriously at DocuMentor. All your documents are encrypted both in
                    transit and at rest. We use industry-standard security practices and regular security audits to
                    ensure your data remains protected. Enterprise plans include additional security features like SAML
                    SSO and advanced permissions.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Can I use DocuMentor offline?</AccordionTrigger>
                  <AccordionContent>
                    While DocuMentor is primarily a cloud-based solution, we do offer limited offline functionality. You
                    can continue editing documents you've previously opened even without an internet connection, and
                    changes will sync once you're back online. Full offline support is on our roadmap for future
                    updates.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>Do you offer a free trial?</AccordionTrigger>
                  <AccordionContent>
                    Yes, all paid plans include a 14-day free trial with full access to all features. No credit card is
                    required to start your trial. Additionally, we offer a free plan with limited features that you can
                    use indefinitely.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Transform Your Writing?
                </h2>
                <p className="max-w-[600px] md:text-xl/relaxed">
                  Join thousands of users who are creating better documents with DocuMentor.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm">No credit card required. 14-day free trial.</p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Stay Updated</h2>
                <p className="text-gray-500 md:text-xl dark:text-gray-400">
                  Subscribe to our newsletter for the latest updates, tips, and special offers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input type="email" placeholder="Enter your email" className="sm:flex-1" />
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">DocuMentor</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered document editing and collaboration platform that helps teams create better content faster.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="text-muted-foreground hover:text-foreground">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-muted-foreground hover:text-foreground">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="text-muted-foreground hover:text-foreground">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-muted-foreground hover:text-foreground">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/documentation" className="text-muted-foreground hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-muted-foreground hover:text-foreground">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-muted-foreground hover:text-foreground">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-muted-foreground hover:text-foreground">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 DocuMentor. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
