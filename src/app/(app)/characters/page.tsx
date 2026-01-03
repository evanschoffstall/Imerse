'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Character } from '@/types/character'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CharactersPage() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaignId')

  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campaignId) {
      fetchCharacters()
    } else {
      setLoading(false)
    }
  }, [campaignId])

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/characters?campaignId=${campaignId}`)
      if (!response.ok) throw new Error('Failed to fetch characters')
      const data = await response.json()
      setCharacters(data.characters)
    } catch (error) {
      console.error('Error fetching characters:', error)
      toast.error('Failed to load characters')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(date).toLocaleDateString()
  }

  if (!campaignId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please select a campaign to view characters.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Characters</h1>
        <Link href={`/characters/new?campaignId=${campaignId}`}>
          <Button>Create New Character</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : characters.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No characters yet. Create your first character to get started!
              </p>
              <Link href={`/characters/new?campaignId=${campaignId}`}>
                <Button>Create Character</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {characters.map((character) => (
                  <TableRow key={character.id}>
                    <TableCell>
                      <Link
                        href={`/characters/${character.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {character.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {character.title || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {character.type || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {character.location || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(character.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link
                        href={`/characters/${character.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/characters/${character.id}`}
                        className="text-muted-foreground hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
