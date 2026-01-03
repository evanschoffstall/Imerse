'use client'

import { AttributeManager } from '@/components/attributes/AttributeManager'
import RelationsList from '@/components/relations/RelationsList'
import { RelationshipManager } from '@/components/relationships/RelationshipManager'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { VersionHistory } from '@/components/versions/VersionHistory'
import type { Character } from '@/types/character'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CharacterDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/characters/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete character')

      toast.success('Character deleted successfully')
      router.push('/characters')
    } catch (error) {
      console.error('Error deleting character:', error)
      toast.error('Failed to delete character')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-64 w-full" />
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
            <Link href="/characters">
              <Button>Back to Characters</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link href="/characters" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Characters
        </Link>
      </div>

      <Card className="overflow-hidden">
        {character.image && (
          <div className="relative w-full h-64">
            <NextImage
              src={character.image}
              alt={character.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{character.name}</h1>
              {character.title && (
                <p className="text-xl text-muted-foreground mb-4">
                  {character.title}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {character.type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {character.type}
                  </span>
                )}
                {character.isPrivate && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Private
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Link href={`/characters/${character.id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {character.age && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Age
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{character.age}</p>
              </div>
            )}
            {character.sex && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Sex
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{character.sex}</p>
              </div>
            )}
            {character.pronouns && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Pronouns
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{character.pronouns}</p>
              </div>
            )}
            {character.location && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Location
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{character.location}</p>
              </div>
            )}
            {character.family && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Family
                </h3>
                <p className="text-gray-900 dark:text-gray-100">{character.family}</p>
              </div>
            )}
          </div>

          {character.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: character.description }}
              />
            </div>
          )}

          {/* Attributes Section */}
          <div className="mb-8">
            <AttributeManager
              entityType="character"
              entityId={character.id}
              campaignId={character.campaignId}
              createdById={character.createdById}
            />
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Campaign:</span>{' '}
                <Link
                  href={`/campaigns/${character.campaign?.id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {character.campaign?.name}
                </Link>
              </div>
              <div>
                <span className="font-medium">Created by:</span> {character.createdBy?.name}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(character.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last updated:</span>{' '}
                {new Date(character.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Relations Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <RelationsList
              entityId={character.id}
              entityType="character"
              entityName={character.name}
              campaignId={character.campaignId}
            />
          </div>

          {/* Relationships Section */}
          <div className="mt-6">
            <RelationshipManager
              entityType="character"
              entityId={character.id}
              campaignId={character.campaignId}
            />
          </div>

          {/* Version History Section */}
          <div className="mt-6">
            <VersionHistory
              entityType="character"
              entityId={character.id}
              campaignId={character.campaignId}
              entityName={character.name}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Character</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Are you sure you want to delete "{character.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
