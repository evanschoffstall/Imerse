'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

/**
 * Theme Provider Component
 * Wraps the application with theme context for light/dark mode switching
 * 
 * Features:
 * - Light/Dark mode switching
 * - System preference detection
 * - Persistent theme selection
 * - Campaign-specific theme support (future)
 * 
 * @see https://ui.shadcn.com/docs/dark-mode/next
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
