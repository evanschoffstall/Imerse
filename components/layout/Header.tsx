'use client'

import { ThemeToggle } from '@/components/theme/ThemeToggle'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GlobalSearch from './GlobalSearch'

export default function Header() {
  const router = useRouter()

  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white shadow-lg">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="text-2xl font-bold flex-shrink-0">
            <Link href="/">Imerse</Link>
          </div>

          {/* Global Search */}
          <div className="flex-1 max-w-md hidden lg:block">
            <GlobalSearch />
          </div>

          <div className="hidden md:flex space-x-6">
            <Link href="/campaigns" className="hover:text-gray-300 transition">
              Campaigns
            </Link>
            <Link href="/characters" className="hover:text-gray-300 transition">
              Characters
            </Link>
            <Link href="/locations" className="hover:text-gray-300 transition">
              Locations
            </Link>
            <Link href="/dashboard" className="hover:text-gray-300 transition">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login" className="hover:text-gray-300 transition">
              Login
            </Link>
            <Link href="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
