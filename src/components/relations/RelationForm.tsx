'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ATTITUDE_LABELS, RELATION_COLOURS, type CreateRelationInput } from '@/types/relation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface RelationFormProps {
  campaignId: string
  ownerId: string
  ownerType: string
  ownerName?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function RelationForm({
  campaignId,
  ownerId,
  ownerType,
  ownerName,
  onSuccess,
  onCancel,
}: RelationFormProps) {
  const [loading, setLoading] = useState(false)
  const [createMirror, setCreateMirror] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateRelationInput>({
    defaultValues: {
      ownerId,
      ownerType,
      attitude: 0,
      visibility: 'all',
      isPinned: false,
      createMirror: false,
    },
  })

  const selectedColour = watch('colour')

  const onSubmit = async (data: CreateRelationInput) => {
    setLoading(true)
    try {
      const response = await fetch('/api/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          campaignId,
          createMirror,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create relation')
      }

      toast.success('Relation created successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating relation:', error)
      toast.error('Failed to create relation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {ownerName && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            Creating relation from: <span className="font-semibold">{ownerName}</span>
          </p>
        </Card>
      )}

      <div>
        <Label htmlFor="targetId">Target Entity ID</Label>
        <Input
          id="targetId"
          {...register('targetId', { required: 'Target entity ID is required' })}
          placeholder="Enter target entity ID"
        />
        {errors.targetId && (
          <p className="text-sm text-red-600 mt-1">{errors.targetId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="targetType">Target Entity Type</Label>
        <select
          id="targetType"
          {...register('targetType', { required: 'Target type is required' })}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select type...</option>
          <option value="character">Character</option>
          <option value="location">Location</option>
          <option value="item">Item</option>
          <option value="quest">Quest</option>
          <option value="event">Event</option>
          <option value="journal">Journal</option>
          <option value="note">Note</option>
          <option value="family">Family</option>
          <option value="race">Race</option>
          <option value="organisation">Organisation</option>
          <option value="timeline">Timeline</option>
          <option value="map">Map</option>
        </select>
        {errors.targetType && (
          <p className="text-sm text-red-600 mt-1">{errors.targetType.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="relation">Relation Type</Label>
        <select
          id="relation"
          {...register('relation', { required: 'Relation type is required' })}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select relation type...</option>
          <optgroup label="Family">
            <option value="parent">Parent</option>
            <option value="child">Child</option>
            <option value="sibling">Sibling</option>
            <option value="spouse">Spouse</option>
            <option value="ancestor">Ancestor</option>
            <option value="descendant">Descendant</option>
          </optgroup>
          <optgroup label="Social">
            <option value="friend">Friend</option>
            <option value="ally">Ally</option>
            <option value="rival">Rival</option>
            <option value="enemy">Enemy</option>
            <option value="acquaintance">Acquaintance</option>
          </optgroup>
          <optgroup label="Professional">
            <option value="employer">Employer</option>
            <option value="employee">Employee</option>
            <option value="colleague">Colleague</option>
            <option value="mentor">Mentor</option>
            <option value="student">Student</option>
          </optgroup>
          <optgroup label="Organizational">
            <option value="member">Member</option>
            <option value="leader">Leader</option>
            <option value="founder">Founder</option>
          </optgroup>
          <optgroup label="Location">
            <option value="birthplace">Birthplace</option>
            <option value="home">Home</option>
            <option value="workplace">Workplace</option>
            <option value="visited">Visited</option>
          </optgroup>
          <optgroup label="Other">
            <option value="owner">Owner</option>
            <option value="creator">Creator</option>
            <option value="protector">Protector</option>
            <option value="guardian">Guardian</option>
            <option value="related">Related</option>
            <option value="associated">Associated</option>
          </optgroup>
        </select>
        {errors.relation && (
          <p className="text-sm text-red-600 mt-1">{errors.relation.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="attitude">Attitude</Label>
        <select
          id="attitude"
          {...register('attitude', { valueAsNumber: true })}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Object.entries(ATTITUDE_LABELS).map(([value, label]) => (
            <option key={value} value={parseInt(value)}>
              {label} ({value})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          -3 (Hostile) to +3 (Devoted)
        </p>
      </div>

      <div>
        <Label>Colour</Label>
        <div className="flex gap-2 flex-wrap mt-2">
          {RELATION_COLOURS.map((colour) => (
            <button
              key={colour}
              type="button"
              onClick={() => {
                const input = document.getElementById('colour') as HTMLInputElement
                if (input) input.value = colour
              }}
              className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColour === colour
                ? 'border-gray-900 scale-110'
                : 'border-gray-300 hover:border-gray-500'
                }`}
              style={{ backgroundColor: colour }}
              title={colour}
            />
          ))}
        </div>
        <input
          type="hidden"
          id="colour"
          {...register('colour')}
        />
      </div>

      <div>
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          {...register('visibility')}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">All Members</option>
          <option value="admin">Campaign Admins Only</option>
          <option value="self">Only Me</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPinned"
          {...register('isPinned')}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <Label htmlFor="isPinned" className="mb-0">
          Pin this relation
        </Label>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="createMirror"
            checked={createMirror}
            onChange={(e) => setCreateMirror(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="createMirror" className="mb-0">
              Create reciprocal relation
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Automatically create the reverse relationship (e.g., if A is parent of B, then B is child of A)
            </p>
          </div>
        </div>

        {createMirror && (
          <div className="mt-4">
            <Label htmlFor="mirrorRelation">Reciprocal Relation Type</Label>
            <Input
              id="mirrorRelation"
              {...register('mirrorRelation')}
              placeholder="e.g., 'child' for 'parent'"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use the same relation type
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Relation'}
        </Button>
      </div>
    </form>
  )
}
