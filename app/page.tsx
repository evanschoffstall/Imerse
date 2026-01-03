import { authConfig } from '@/auth/config'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Castle, Map, Scroll, Swords, Users } from 'lucide-react'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authConfig)

  const features = [
    {
      icon: Swords,
      title: 'Campaign Management',
      description: 'Create and manage your RPG campaigns with ease',
    },
    {
      icon: Map,
      title: 'Worldbuilding',
      description: 'Build rich, detailed worlds for your stories',
    },
    {
      icon: Users,
      title: 'Character Tracking',
      description: 'Keep track of all your characters and NPCs',
    },
    {
      icon: Castle,
      title: 'Location Management',
      description: 'Map out and organize all your locations',
    },
    {
      icon: Scroll,
      title: 'Quest & Event Tracking',
      description: 'Manage quests, events, and storylines',
    },
    {
      icon: BookOpen,
      title: 'Notes & Journals',
      description: 'Document your campaign with rich text notes',
    },
  ]

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 md:py-32 lg:py-40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Welcome to Imerse
            </h1>
            <p className="mx-auto max-w-175 text-lg text-muted-foreground sm:text-xl">
              An RPG campaign management and worldbuilding tool designed for game masters and storytellers.
            </p>
          </div>
          {session ? (
            <Button asChild size="lg">
              <Link href="/campaigns">Jump In</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/campaigns">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/50 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-175 text-muted-foreground">
              Powerful tools to bring your campaigns to life
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t px-4 py-16 md:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Ready to Start Your Adventure?
            </h2>
            <p className="mx-auto max-w-150 text-muted-foreground">
              Join game masters around the world using Imerse to create unforgettable campaigns.
            </p>
          </div>
          {session ? (
            <Button asChild size="lg">
              <Link href="/campaigns">Jump In</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </section>
    </main>
  )
}
