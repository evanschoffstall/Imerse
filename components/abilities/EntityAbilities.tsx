'use client';

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
    return <div className="text-center py-4">Loading abilities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Abilities ({entityAbilities.length})
        </h3>
        {canEdit && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            + Add Ability
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && canEdit && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ability *
            </label>
            <select
              value={formData.abilityId}
              onChange={(e) => setFormData({ ...formData, abilityId: e.target.value })}
              disabled={!!editingId}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm disabled:opacity-50"
            >
              <option value="">-- Select Ability --</option>
              {allAbilities.map((ability) => (
                <option key={ability.id} value={ability.id}>
                  {ability.name} {ability.type ? `(${ability.type})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Charges (Override)
              </label>
              <input
                type="number"
                value={formData.charges || ''}
                onChange={(e) => setFormData({ ...formData, charges: e.target.value ? parseInt(e.target.value) : null })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Position
              </label>
              <input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder="Optional notes"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Private
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {editingId ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Abilities List */}
      {entityAbilities.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No abilities added yet.
        </p>
      ) : (
        <div className="space-y-2">
          {entityAbilities.map((ea) => (
            <div
              key={ea.id}
              className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {ea.ability.name}
                    {ea.ability.type && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({ea.ability.type})
                      </span>
                    )}
                  </h4>

                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {ea.charges !== null ? (
                      <span>⚡ {ea.charges} charges</span>
                    ) : ea.ability.charges !== null ? (
                      <span>⚡ {ea.ability.charges} charges</span>
                    ) : null}
                  </div>

                  {ea.note && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {ea.note}
                    </p>
                  )}

                  {ea.isPrivate && (
                    <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      🔒 Private
                    </span>
                  )}
                </div>

                {canEdit && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(ea)}
                      className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ea.id)}
                      className="text-xs text-red-600 hover:text-red-500 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
