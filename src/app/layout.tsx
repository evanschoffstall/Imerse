import { ConditionalFooter } from '@/components/layout/ConditionalFooter'
import Header from '@/components/layout/Header'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { ExposeToast } from '@/components/ui/toast-expose'
import '@/styles/globals.scss'
import '@fontsource-variable/roboto'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Imerse - RPG Campaign Management & Worldbuilding',
  description: 'Tool for managing your RPG campaigns and worldbuilding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-1 pt-14">{children}</main>
            <ConditionalFooter />
            <Toaster />
            <ExposeToast />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
