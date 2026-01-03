import { Swords } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-8">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Imerse</span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 Imerse. Built for storytellers, by storytellers.</p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
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
