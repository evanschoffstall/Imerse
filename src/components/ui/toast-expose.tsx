'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

/**
 * Exposes toast to window for testing purposes
 * This allows Playwright tests to trigger toasts directly
 */
export function ExposeToast() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-expect-error - Intentionally adding toast to window for testing
      window.toast = toast
    }
  }, [])

  return null
}
