import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createPost } from '@/actions/post'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

export default async function PostCreatePage() {
  const users = await prisma.user.findMany()

  return (
    <>
      <header className="mb-4">
        <Heading>Create Post</Heading>
      </header>
      <form action={createPost} className="px-2 max-w-xl">
        <div>
          <Input
            type="text"
            label="Content"
            name="content"
            className="mb-2"
            required
          />
        </div>
        <div>
          <Select
            name="user"
            className="mt-1 mb-2"
            label="User"
            placeholder="Select User"
            required
            options={users.map((user) => ({
              label: user.id,
              value: user.id,
            }))}
          />
        </div>

        <footer className="flex items-center justify-between mt-2">
          <Link href="/posts" className="underline text-gray-500">
            Return to Posts list
          </Link>

          <Button type="submit">Create</Button>
        </footer>
      </form>
    </>
  )
}
