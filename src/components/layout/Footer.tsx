import { Swords } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        {/* Centered partial divider */}
        <div className="mx-auto mb-8 h-px w-5/6 bg-border md:mb-12" />

        <div className="flex flex-col items-center justify-center gap-4 text-center md:grid md:grid-cols-3 md:items-center md:text-left">
          <div className="flex items-center gap-2 md:justify-self-start">
            <Swords className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Imerse</span>
          </div>
          <div className="text-sm text-muted-foreground md:justify-self-center">
            <p>© 2026 Imerse. Built for storytellers, by storytellers.</p>
          </div>
          <nav className="flex gap-4 text-sm md:justify-self-end">
            <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
