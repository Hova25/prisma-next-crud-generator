import { prisma } from '@/lib/prisma'
import { deletePost } from '@/actions/post'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'

export default async function PostsListPage() {
  const posts = await prisma.post.findMany()

  const breadcrumbs = [
    { name: 'Dashboard', href: '/' },
    { name: 'Posts', href: '#' },
  ]

  return (
    <>
      <Breadcrumbs elements={breadcrumbs} className="my-2" />

      <header className="flex justify-between mb-4">
        <Heading>All Posts</Heading>
        <Button as="a" href="/posts/create" className="font-medium">
          New Post
        </Button>
      </header>

      <section className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="text-left">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Content
              </th>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                User Id
              </th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-4">
                  No posts found
                </td>
              </tr>
            )}

            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-2 text-gray-700">{post.content}</td>
                <td className="px-4 py-2 text-gray-700">{post.userId}</td>

                <td className="px-4 py-2">
                  <div className="flex gap-x-1 h-full justify-center">
                    <Button
                      as="a"
                      href={`/posts/${post.id}`}
                      variant="ghost"
                      size="sm"
                      className="font-medium"
                    >
                      Show
                    </Button>
                    <Button
                      as="a"
                      href={`/posts/${post.id}/edit`}
                      variant="ghost"
                      size="sm"
                      className="font-medium"
                    >
                      Edit
                    </Button>
                    <form action={deletePost} className="inline-block">
                      <input type="hidden" name="id" value={post.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="font-medium text-red-600 hover:bg-red-100 disabled:bg-red-100"
                      >
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
