import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import ToastProvider from '@/components/ui/ToastProvider'
import '@fontsource-variable/roboto'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Imerse - RPG Campaign Management & Worldbuilding',
  description: 'The ultimate tool for managing your RPG campaigns and worldbuilding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
