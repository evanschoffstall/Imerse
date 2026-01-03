'use client'

import { CharacterForm } from '@/components/forms/CharacterForm'
import type { Character, CharacterFormData } from '@/types/character'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function EditCharacterPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCharacter()
  }, [params.id])

  const fetchCharacter = async () => {
    try {
      const response = await fetch(`/api/characters/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch character')
      const data = await response.json()
      setCharacter(data.character)
    } catch (error) {
      console.error('Error fetching character:', error)
      toast.error('Failed to load character')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: CharacterFormData) => {
    try {
      const response = await fetch(`/api/characters/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update character')

      toast.success('Character updated successfully')
      router.push(`/characters/${params.id}`)
    } catch (error) {
      console.error('Error updating character:', error)
      toast.error('Failed to update character')
      throw error
    }
  }

  const handleCancel = () => {
    router.push(`/characters/${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Character not found</p>
          <Link href="/characters" className="text-blue-600 hover:text-blue-700">
            Back to Characters
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/characters/${character.id}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Character
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Character</h1>
        <CharacterForm
          character={character}
          campaignId={character.campaignId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
