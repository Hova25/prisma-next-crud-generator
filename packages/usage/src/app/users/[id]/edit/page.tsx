import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { editUser } from '@/actions/user'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

export default async function UserEditPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      profile: true,
      posts: true,
      projects: true,
    },
  })

  const profiles = await prisma.profile.findMany()

  const posts = await prisma.post.findMany()

  const projects = await prisma.project.findMany()

  if (!user) {
    return (
      <>
        <header>
          <Heading>User not found</Heading>
        </header>
        <footer>
          <Link href="/users">Return to Users list</Link>
        </footer>
      </>
    )
  }

  return (
    <>
      <header className="mb-4">
        <Heading>Edit User</Heading>
      </header>
      <form action={editUser} className="px-2 max-w-xl">
        <div>
          <Input
            type="text"
            label="Name"
            name="name"
            className="mb-2"
            defaultValue={user.name}
            required
          />
        </div>
        <div>
          <Select
            name="profile"
            className="mt-1 mb-2"
            label="Profile"
            placeholder="Select Profile"
            defaultValue={{ label: user.profile?.id, value: user.profile?.id }}
            options={profiles.map((profile) => ({
              label: profile.id,
              value: profile.id,
            }))}
          />
        </div>
        <div>
          <Select
            name="posts"
            className="mt-1 mb-2"
            label="Posts"
            placeholder="Select Posts"
            defaultValue={user.posts.map((post) => ({
              label: post.id,
              value: post.id,
            }))}
            isMulti
            options={posts.map((post) => ({
              label: post.id,
              value: post.id,
            }))}
          />
        </div>
        <div>
          <Select
            name="projects"
            className="mt-1 mb-2"
            label="Projects"
            placeholder="Select Projects"
            defaultValue={user.projects.map((project) => ({
              label: project.id,
              value: project.id,
            }))}
            isMulti
            options={projects.map((project) => ({
              label: project.id,
              value: project.id,
            }))}
          />
        </div>

        <input type="hidden" name="id" value={user.id} />

        <footer className="flex items-center justify-between mt-2">
          <Link href="/users" className="underline text-gray-500">
            Return to Users list
          </Link>

          <Button type="submit">Update</Button>
        </footer>
      </form>
    </>
  )
}
