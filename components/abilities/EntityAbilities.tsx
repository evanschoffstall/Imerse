'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AbilityWithRelations, EntityAbilityWithRelations } from '@/types/ability';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EntityAbilitiesProps {
  entityId: string;
  entityType: string;
  campaignId: string;
  canEdit?: boolean;
}

export default function EntityAbilities({
  entityId,
  entityType,
  campaignId,
  canEdit = false,
}: EntityAbilitiesProps) {
  const [entityAbilities, setEntityAbilities] = useState<EntityAbilityWithRelations[]>([]);
  const [allAbilities, setAllAbilities] = useState<AbilityWithRelations[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    abilityId: '',
    charges: null as number | null,
    position: 0,
    note: '',
    isPrivate: false,
  });

  useEffect(() => {
    fetchEntityAbilities();
    fetchAllAbilities();
  }, [entityId, entityType]);

  const fetchEntityAbilities = async () => {
    try {
      const res = await fetch(`/api/entity-abilities?entityId=${entityId}&entityType=${entityType}`);
      if (res.ok) {
        const data = await res.json();
        setEntityAbilities(data);
      }
    } catch (error) {
      console.error('Error fetching entity abilities:', error);
      toast.error('Failed to load abilities');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAbilities = async () => {
    try {
      const res = await fetch(`/api/abilities?campaignId=${campaignId}`);
      if (res.ok) {
        const data = await res.json();
        setAllAbilities(data);
      }
    } catch (error) {
      console.error('Error fetching abilities:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.abilityId) {
      toast.error('Please select an ability');
      return;
    }

    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/entity-abilities/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            charges: formData.charges,
            position: formData.position,
            note: formData.note,
            isPrivate: formData.isPrivate,
          }),
        });

        if (res.ok) {
          toast.success('Ability updated');
          fetchEntityAbilities();
          resetForm();
        } else {
          toast.error('Failed to update ability');
        }
      } else {
        // Create
        const res = await fetch('/api/entity-abilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            entityId,
            entityType,
          }),
        });

        if (res.ok) {
          toast.success('Ability added');
          fetchEntityAbilities();
          resetForm();
        } else {
          toast.error('Failed to add ability');
        }
      }
    } catch (error) {
      console.error('Error saving ability:', error);
      toast.error('An error occurred');
    }
  };

  const handleEdit = (entityAbility: EntityAbilityWithRelations) => {
    setEditingId(entityAbility.id);
    setIsAdding(true);
    setFormData({
      abilityId: entityAbility.abilityId,
      charges: entityAbility.charges,
      position: entityAbility.position,
      note: entityAbility.note || '',
      isPrivate: entityAbility.isPrivate,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this ability?')) return;

    try {
      const res = await fetch(`/api/entity-abilities/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Ability removed');
        fetchEntityAbilities();
      } else {
        toast.error('Failed to remove ability');
      }
    } catch (error) {
      console.error('Error deleting ability:', error);
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      abilityId: '',
      charges: null,
      position: 0,
      note: '',
      isPrivate: false,
    });
  };

  if (loading) {
    return <Card className="text-center py-4 text-muted-foreground">Loading abilities...</Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Abilities ({entityAbilities.length})
        </h3>
        {canEdit && !isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
          >
            + Add Ability
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && canEdit && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label>Ability *</Label>
              <Select
                value={formData.abilityId}
                onValueChange={(value) => setFormData({ ...formData, abilityId: value })}
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Select Ability --" />
                </SelectTrigger>
                <SelectContent>
                  {allAbilities.map((ability) => (
                    <SelectItem key={ability.id} value={ability.id}>
                      {ability.name} {ability.type ? `(${ability.type})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Charges (Override)</Label>
                <Input
                  type="number"
                  value={formData.charges || ''}
                  onChange={(e) => setFormData({ ...formData, charges: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label>Position</Label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label>Note</Label>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={2}
                placeholder="Optional notes"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              <Label className="ml-2">
                Private
              </Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Update' : 'Add'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Abilities List */}
      {entityAbilities.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No abilities added yet.
        </p>
      ) : (
        <div className="space-y-2">
          {entityAbilities.map((ea) => (
            <Card
              key={ea.id}
              className="p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">
                    {ea.ability.name}
                    {ea.ability.type && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({ea.ability.type})
                      </span>
                    )}
                  </h4>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {ea.charges !== null ? (
                      <span>⚡ {ea.charges} charges</span>
                    ) : ea.ability.charges !== null ? (
                      <span>⚡ {ea.ability.charges} charges</span>
                    ) : null}
                  </div>

                  {ea.note && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {ea.note}
                    </p>
                  )}

                  {ea.isPrivate && (
                    <Badge variant="outline" className="mt-2">
                      🔒 Private
                    </Badge>
                  )}
                </div>

                {canEdit && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(ea)}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(ea.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
