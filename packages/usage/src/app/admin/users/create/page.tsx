import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createUser } from '@/actions/user'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

export default async function UserCreatePage() {
  const profiles = await prisma.profile.findMany()

  const posts = await prisma.post.findMany()

  const projects = await prisma.project.findMany()

  return (
    <>
      <header className="mb-4">
        <Heading>Create User</Heading>
      </header>
      <form action={createUser} className="px-2 max-w-xl">
        <div>
          <Input
            type="text"
            label="Name"
            name="name"
            className="mb-2"
            required
          />
        </div>
        <div>
          <Select
            name="profile"
            className="mt-1 mb-2"
            label="Profile"
            placeholder="Select Profile"
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
            isMulti
            options={projects.map((project) => ({
              label: project.id,
              value: project.id,
            }))}
          />
        </div>

        <footer className="flex items-center justify-between mt-2">
          <Link href="/users" className="underline text-gray-500">
            Return to Users list
          </Link>

          <Button type="submit">Create</Button>
        </footer>
      </form>
    </>
  )
}
