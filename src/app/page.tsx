import { authConfig } from '@/auth/config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Castle, CheckCircle2, Code, Map, Scroll, Sparkles, Swords, Users, Zap } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authConfig)

  const features = [
    {
      icon: Swords,
      title: 'Campaign Management',
      description: 'Create and manage your RPG campaigns with powerful tools designed for game masters.',
    },
    {
      icon: Map,
      title: 'Interactive Worldbuilding',
      description: 'Build rich, interconnected worlds with locations, factions, and deep lore.',
    },
    {
      icon: Users,
      title: 'Character Tracking',
      description: 'Track characters, NPCs, relationships, and development arcs effortlessly.',
    },
    {
      icon: Castle,
      title: 'Location Management',
      description: 'Map out kingdoms, cities, dungeons, and every place your story unfolds.',
    },
    {
      icon: Scroll,
      title: 'Quest & Event Timeline',
      description: 'Manage quests, plot points, and create rich narrative timelines.',
    },
    {
      icon: BookOpen,
      title: 'Rich Note System',
      description: 'Document everything with powerful rich text notes and journals.',
    },
  ]

  const benefits = [
    {
      icon: Sparkles,
      title: 'Built for GMs',
      description: 'Every feature designed with game masters in mind',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Quick access to everything during gameplay',
    },
    {
      icon: Code,
      title: 'Modern Stack',
      description: 'Built with Next.js, TypeScript, and Prisma',
    },
  ]

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)]" />

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 text-center">
          <Badge variant="secondary" className="animate-in fade-in slide-in-from-bottom-4 px-4 py-1.5 text-sm duration-500">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Built for Game Masters & Storytellers
          </Badge>

          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="bg-linear-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-4xl font-bold leading-tight tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              Build Worlds.
              <br />
              Tell Stories.
              <br />
              <span className="text-primary">Create Legends.</span>
            </h1>
            <p className="mx-auto max-w-175 text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
              The ultimate RPG campaign management platform. Everything you need to bring your tabletop adventures to life.
            </p>
          </div>

          {session ? (
            <div className="flex flex-col gap-4 min-[400px]:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/campaigns">
                  <Swords className="mr-2 h-5 w-5" />
                  Go to Campaigns
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 min-[400px]:flex-row animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/register">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Open source project</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Self-hosted option</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Built for game masters</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats - Commented out until we have real data
      <section className="border-y bg-card px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            <div>
              <div className="mb-2 text-4xl font-bold">1000+</div>
              <div className="text-sm text-muted-foreground">Active Campaigns</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">10K+</div>
              <div className="text-sm text-muted-foreground">Characters Created</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Game Masters</div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Benefits Bar */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-4 ring-primary/5">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything You Need to Run Epic Campaigns
            </h2>
            <p className="mx-auto max-w-175 text-lg text-muted-foreground">
              Powerful features that adapt to your storytelling style
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardHeader className="relative flex flex-col items-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:scale-110 group-hover:bg-primary/20">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t bg-muted/30 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl">
              Simple to Start, Powerful When You Need It
            </h2>
            <p className="mx-auto max-w-150 text-muted-foreground">
              Get your first campaign running in minutes
            </p>
          </div>
          <div className="grid gap-12 md:gap-16">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-2xl font-bold">Create Your Campaign</h3>
                <p className="text-lg text-muted-foreground">
                  Start with a name and setting. Add as much or as little detail as you want.
                </p>
              </div>
            </div>
            <Separator className="md:hidden" />
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-2xl font-bold">Build Your World</h3>
                <p className="text-lg text-muted-foreground">
                  Add characters, locations, factions, and lore. Everything interconnects automatically.
                </p>
              </div>
            </div>
            <Separator className="md:hidden" />
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-2xl font-bold">Run Amazing Sessions</h3>
                <p className="text-lg text-muted-foreground">
                  Access all your notes, NPCs, and plot threads instantly during gameplay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Use Cases - Commented out until we have real testimonials
      <section className="border-t px-4 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl">
              Loved by Game Masters
            </h2>
            <p className="mx-auto max-w-150 text-muted-foreground">
              See what storytellers are saying about Imerse
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-primary/20">
              <CardHeader>
                <CardDescription className="text-base">
                  &quot;Imerse has completely transformed how I prep for sessions. Everything I need is right at my fingertips.&quot;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    DM
                  </div>
                  <div>
                    <div className="font-semibold">Sarah K.</div>
                    <div className="text-sm text-muted-foreground">D&D 5e GM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardHeader>
                <CardDescription className="text-base">
                  &quot;The worldbuilding tools are incredible. I&apos;ve created three full campaign worlds and it just keeps getting better.&quot;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    GM
                  </div>
                  <div>
                    <div className="font-semibold">Marcus T.</div>
                    <div className="text-sm text-muted-foreground">Pathfinder GM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardHeader>
                <CardDescription className="text-base">
                  &quot;Finally, a campaign manager that doesn&apos;t get in the way. Simple when I need it, powerful when I want it.&quot;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    ST
                  </div>
                  <div>
                    <div className="font-semibold">Alex R.</div>
                    <div className="text-sm text-muted-foreground">Storyteller</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      */}

      {/* CTA Section */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-2 border-primary/20">
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-background" />
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_80%_50%,rgba(120,119,198,0.15),transparent_70%)]" />
            <CardContent className="relative flex flex-col items-center gap-8 p-12 text-center">
              <div className="space-y-4">
                <Badge variant="secondary" className="mb-2">
                  Start Your Journey
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Begin Your Adventure?
                </h2>
                <p className="mx-auto max-w-150 text-lg text-muted-foreground">
                  Start managing your RPG campaigns with a modern, powerful platform.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Active development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Community-driven</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Modern technology</span>
                  </div>
                </div>
              </div>
              {session ? (
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link href="/campaigns">Go to Your Campaigns</Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button asChild size="lg" className="h-12 px-8 text-base">
                    <Link href="/register">Start Free Today</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

    </main>
  )
}
