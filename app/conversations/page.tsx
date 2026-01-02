import { auth } from '@/auth';
import { ConversationList } from '@/components/conversations/ConversationList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: { campaignId: string };
}) {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const { campaignId } = searchParams;
  if (!campaignId) {
    return <div>Campaign ID is required</div>;
  }

  // Fetch campaign
  const campaignRes = await fetch(
    `${process.env.NEXTAUTH_URL}/api/campaigns/${campaignId}`,
    {
      headers: {
        cookie: `next-auth.session-token=${session}`,
      },
    }
  );
  const campaign = await campaignRes.json();

  // Fetch conversations
  const conversationsRes = await fetch(
    `${process.env.NEXTAUTH_URL}/api/conversations?campaignId=${campaignId}`,
    {
      headers: {
        cookie: `next-auth.session-token=${session}`,
      },
    }
  );
  const conversations = await conversationsRes.json();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Conversations</h1>
          {campaign && (
            <p className="text-gray-600 mt-1">Campaign: {campaign.name}</p>
          )}
        </div>
        <Link href={`/conversations/create?campaignId=${campaignId}`}>
          <Button>Create Conversation</Button>
        </Link>
      </div>

      <ConversationList
        conversations={conversations}
        campaignId={campaignId}
      />
    </div>
  );
}
