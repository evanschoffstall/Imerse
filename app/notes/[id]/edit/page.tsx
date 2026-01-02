'use client'

import NoteForm from '@/components/forms/NoteForm'
import type { Note, NoteFormData } from '@/types/note'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNote()
  }, [params.id])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch note')
      const data = await response.json()
      setNote(data.note)
    } catch (error) {
      console.error('Error fetching note:', error)
      toast.error('Failed to load note')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: NoteFormData) => {
    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update note')

      toast.success('Note updated successfully')
      router.push(`/notes/${params.id}`)
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Failed to update note')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/notes/${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Note not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/notes/${note.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Note
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Note</h1>
        <NoteForm
          note={note}
          campaignId={note.campaignId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
