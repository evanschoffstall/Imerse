'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Character } from '@/types/character';
import { CONVERSATION_TARGETS, ConversationFormData } from '@/types/conversation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ConversationFormProps {
  initialData?: ConversationFormData;
  campaignId: string;
  onSubmit: (data: ConversationFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ConversationForm({
  initialData,
  campaignId,
  onSubmit,
  onCancel,
}: ConversationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ConversationFormData>({
    name: initialData?.name || '',
    target: initialData?.target || 'characters',
    isPrivate: initialData?.isPrivate || false,
    participantIds: initialData?.participantIds || [],
  });
  const [characters, setCharacters] = useState<Character[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch characters for campaign
    fetch(`/api/characters?campaignId=${campaignId}`)
      .then((res) => res.json())
      .then((data) => setCharacters(data))
      .catch((err) => console.error('Error fetching characters:', err));

    // Fetch users (campaign members)
    fetch(`/api/campaigns/${campaignId}/members`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error('Error fetching users:', err));
  }, [campaignId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      participantIds: (prev.participantIds || []).includes(id)
        ? (prev.participantIds || []).filter((pid) => pid !== id)
        : [...(prev.participantIds || []), id],
    }));
  };

  const availableParticipants =
    formData.target === 'users' ? users : characters;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
      )}

      <div>
        <Label htmlFor="name">Conversation Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter conversation name"
          required
        />
      </div>

      <div>
        <Label>Target Type</Label>
        <RadioGroup
          value={formData.target}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, target: value as 'users' | 'characters', participantIds: [] }))
          }
        >
          {CONVERSATION_TARGETS.map((target) => (
            <div key={target} className="flex items-center space-x-2">
              <RadioGroupItem value={target} id={target} />
              <Label htmlFor={target} className="font-normal capitalize">
                {target}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-sm text-muted-foreground mt-1">
          {formData.target === 'users'
            ? 'Participants will be users (players/GMs)'
            : 'Participants will be characters'}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPrivate"
          checked={formData.isPrivate}
          onCheckedChange={(checked: boolean) =>
            setFormData((prev) => ({ ...prev, isPrivate: checked }))
          }
        />
        <Label htmlFor="isPrivate" className="font-normal">
          Private (GM only)
        </Label>
      </div>

      <div>
        <Label>Participants (Optional)</Label>
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded p-3">
          {availableParticipants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No {formData.target} available
            </p>
          ) : (
            availableParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`participant-${participant.id}`}
                  checked={(formData.participantIds || []).includes(participant.id)}
                  onCheckedChange={() => handleParticipantToggle(participant.id)}
                />
                <Label
                  htmlFor={`participant-${participant.id}`}
                  className="font-normal"
                >
                  {participant.name}
                  {'email' in participant && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({participant.email})
                    </span>
                  )}
                </Label>
              </div>
            ))
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Select initial participants for this conversation
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
