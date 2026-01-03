import { Scroll } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh)] items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <Scroll className="h-24 w-24" />
        </div>
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl">This page could not be found.</p>
      </div>
    </div>
  )
}
