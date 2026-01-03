'use client'

import { CharacterForm } from '@/components/forms/CharacterForm'
import type { Character, CharacterFormData } from '@/types/character'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Character not found</p>
            <Link href="/characters" className="text-primary hover:underline">
              Back to Characters
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/characters/${character.id}`}
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Character
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Character</h1>
          <CharacterForm
            character={character}
            campaignId={character.campaignId}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}
