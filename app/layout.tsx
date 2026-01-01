import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
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
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastProvider />
      </body>
    </html>
  )
}
