'use client';

import { ConversationForm } from '@/components/forms/ConversationForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ConversationFormData, ConversationWithRelations } from '@/types/conversation';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<ConversationWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleSubmit = async (data: ConversationFormData) => {
    const res = await fetch(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update conversation');
    }

    router.push(`/conversations/${conversationId}`);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete conversation');

      router.push(`/conversations?campaignId=${conversation?.campaignId}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-8" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return <div className="container mx-auto py-8 text-center">Conversation not found</div>;
  }

  const initialData: ConversationFormData = {
    name: conversation.name,
    target: conversation.target,
    isPrivate: conversation.isPrivate,
    participantIds: conversation.participants?.map((p) =>
      p.userId || p.characterId || ''
    ).filter(Boolean) || [],
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Conversation</h1>

      <ConversationForm
        initialData={initialData}
        campaignId={conversation.campaignId}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/conversations/${conversationId}`)}
      />

      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete Conversation
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This will also
              delete all messages and participants. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
