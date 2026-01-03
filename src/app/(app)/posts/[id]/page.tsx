import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

async function getPost(id: string) {
  // Placeholder - in real app would fetch from API
  return null
}

export default async function PostDetailPage({ params }: PageProps) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href={`/posts?campaignId=${(post as any).campaignId}`}
          className="text-blue-600 hover:underline"
        >
          ← Back to Posts
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{(post as any).name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>by {(post as any).createdBy.name}</span>
              <span>•</span>
              <span>{new Date((post as any).createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/posts/${params.id}/edit`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Edit
            </Link>
          </div>
        </div>

        {(post as any).entry && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: (post as any).entry }}
          />
        )}
      </div>
    </div>
  )
}
