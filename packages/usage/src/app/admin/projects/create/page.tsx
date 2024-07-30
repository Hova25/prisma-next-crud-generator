import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createProject } from '@/actions/project'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

export default async function ProjectCreatePage() {
  const users = await prisma.user.findMany()

  return (
    <>
      <header className="mb-4">
        <Heading>Create Project</Heading>
      </header>
      <form action={createProject} className="px-2 max-w-xl">
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
            name="users"
            className="mt-1 mb-2"
            label="Users"
            placeholder="Select Users"
            isMulti
            options={users.map((user) => ({
              label: user.id,
              value: user.id,
            }))}
          />
        </div>

        <footer className="flex items-center justify-between mt-2">
          <Link href="/projects" className="underline text-gray-500">
            Return to Projects list
          </Link>

          <Button type="submit">Create</Button>
        </footer>
      </form>
    </>
  )
}
