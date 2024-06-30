import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { editPost } from '@/actions/post'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

export default async function PostEditPage({
  params,
}: {
  params: { id: string }
}) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      user: true,
    },
  })

  const users = await prisma.user.findMany()

  if (!post) {
    return (
      <>
        <header>
          <Heading>Post not found</Heading>
        </header>
        <footer>
          <Link href="/posts">Return to Posts list</Link>
        </footer>
      </>
    )
  }

  return (
    <>
      <header className="mb-4">
        <Heading>Edit Post</Heading>
      </header>
      <form action={editPost} className="px-2 max-w-xl">
        <div>
          <Input
            type="text"
            label="Content"
            name="content"
            className="mb-2"
            defaultValue={post.content}
            required
          />
        </div>
        <div>
          <Select
            name="user"
            className="mt-1 mb-2"
            label="User"
            placeholder="Select User"
            defaultValue={{ label: post.user?.id, value: post.user?.id }}
            required
            options={users.map((user) => ({
              label: user.id,
              value: user.id,
            }))}
          />
        </div>

        <input type="hidden" name="id" value={post.id} />

        <footer className="flex items-center justify-between mt-2">
          <Link href="/posts" className="underline text-gray-500">
            Return to Posts list
          </Link>

          <Button type="submit">Update</Button>
        </footer>
      </form>
    </>
  )
}
