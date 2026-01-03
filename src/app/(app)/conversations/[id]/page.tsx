'use client';

import { ConversationMessages } from '@/components/conversations/ConversationMessages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConversationWithRelations, getParticipantName } from '@/types/conversation';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<ConversationWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (!res.ok) throw new Error('Failed to fetch conversation');
      const data = await res.json();
      setConversation(data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      alert('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClosed = async () => {
    if (!conversation) return;
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isClosed: !conversation.isClosed }),
      });

      if (!res.ok) throw new Error('Failed to update conversation');
      await fetchConversation();
    } catch (error) {
      console.error('Error updating conversation:', error);
      alert('Failed to update conversation');
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  if (!conversation) {
    return <div className="container mx-auto py-8 text-center">Conversation not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{conversation.name}</h1>
            {conversation.isPrivate && <Badge variant="secondary">Private</Badge>}
            {conversation.isClosed && <Badge variant="destructive">Closed</Badge>}
            <Badge variant="outline" className="capitalize">
              {conversation.target}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant={conversation.isClosed ? 'default' : 'outline'}
              onClick={handleToggleClosed}
            >
              {conversation.isClosed ? 'Reopen' : 'Close'}
            </Button>
            <Link href={`/conversations/${conversationId}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <Link href={`/conversations?campaignId=${conversation.campaignId}`}>
              <Button variant="ghost">Back</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div>Campaign: {conversation.campaign?.name}</div>
          <div>Created by: {conversation.createdBy.name}</div>
          <div>{conversation._count?.participants || 0} participants</div>
        </div>
      </div>

      {/* Participants */}
      {conversation.participants && conversation.participants.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm font-semibold mb-2">Participants:</div>
          <div className="flex flex-wrap gap-2">
            {conversation.participants.map((p) => (
              <Badge key={p.id} variant="outline">
                {getParticipantName(p as any)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-white">
        <ConversationMessages
          conversationId={conversationId}
          campaignId={conversation.campaignId}
          target={conversation.target}
          isClosed={conversation.isClosed}
          onRefresh={fetchConversation}
        />
      </div>
    </div>
  );
}
