import { authConfig } from '@/auth'
import { getServerSession } from 'next-auth/next'
import RelationGraph from '@/components/relations/RelationGraph'
import { redirect } from 'next/navigation'

export default async function CampaignRelationsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authConfig)
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relationship Map</h1>
        <p className="mt-2 text-gray-600">
          Visualize connections between entities in your campaign
        </p>
      </div>

      <RelationGraph campaignId={params.id} height="700px" />
    </div>
  )
}
