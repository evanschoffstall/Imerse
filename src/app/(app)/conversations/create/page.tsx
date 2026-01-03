'use client';

import { ConversationForm } from '@/components/forms/ConversationForm';
import { ConversationFormData } from '@/types/conversation';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CreateConversationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');

  if (!campaignId) {
    return <div className="container mx-auto py-8">Campaign ID is required</div>;
  }

  const handleSubmit = async (data: ConversationFormData) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, campaignId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create conversation');
    }

    const conversation = await res.json();
    router.push(`/conversations/${conversation.id}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Conversation</h1>
      <ConversationForm
        campaignId={campaignId}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/conversations?campaignId=${campaignId}`)}
      />
    </div>
  );
}
