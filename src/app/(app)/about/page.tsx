import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BookOpen, Code, Github, Heart, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About Imerse</h1>
          <p className="text-xl text-muted-foreground">
            Built for storytellers, by storytellers
          </p>
        </div>

        {/* Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Imerse is an open-source RPG campaign management and worldbuilding platform designed to help game masters and storytellers bring their adventures to life. We believe that great stories deserve great tools.
            </p>
            <p>
              Whether you're running a D&D campaign, a Pathfinder adventure, or your own custom RPG, Imerse provides the organizational tools you need to manage characters, locations, quests, and lore—all in one place.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">What We Offer</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Campaign Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Organize your campaigns with powerful tools for tracking characters, NPCs, locations, quests, and storylines.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Worldbuilding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create rich, interconnected worlds with deep lore, factions, and relationships between entities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  Modern Technology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built with Next.js, TypeScript, and Prisma for a fast, reliable, and scalable experience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Github className="h-4 w-4 text-primary" />
                  Open Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Imerse is open source and community-driven. Self-host it or contribute to make it better.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Team */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            The Team
          </h2>
          <p className="text-muted-foreground">
            Imerse is actively developed by a passionate team of developers and game masters who understand the challenges of running great campaigns. We're committed to building tools that make your storytelling easier and more engaging.
          </p>
        </div>

        <Separator />

        {/* Technology */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Technology Stack</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="font-semibold min-w-32">Frontend:</div>
              <div className="text-muted-foreground">Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="font-semibold min-w-32">Backend:</div>
              <div className="text-muted-foreground">Next.js API Routes, Prisma ORM, PostgreSQL</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="font-semibold min-w-32">Authentication:</div>
              <div className="text-muted-foreground">NextAuth.js</div>
            </div>
            <div className="flex items-start gap-3">
              <div className="font-semibold min-w-32">Deployment:</div>
              <div className="text-muted-foreground">Self-hostable, Vercel-ready</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* CTA */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">Join Us</h2>
          <p className="text-muted-foreground">
            Start managing your campaigns with Imerse today, or contribute to the project on GitHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="https://github.com/imerse" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
