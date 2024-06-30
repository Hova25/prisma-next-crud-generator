import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { editProject } from '@/actions/project'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

export default async function ProjectEditPage({
  params,
}: {
  params: { id: string }
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      users: true,
    },
  })

  const users = await prisma.user.findMany()

  if (!project) {
    return (
      <>
        <header>
          <Heading>Project not found</Heading>
        </header>
        <footer>
          <Link href="/projects">Return to Projects list</Link>
        </footer>
      </>
    )
  }

  return (
    <>
      <header className="mb-4">
        <Heading>Edit Project</Heading>
      </header>
      <form action={editProject} className="px-2 max-w-xl">
        <div>
          <Input
            type="text"
            label="Name"
            name="name"
            className="mb-2"
            defaultValue={project.name}
            required
          />
        </div>
        <div>
          <Select
            name="users"
            className="mt-1 mb-2"
            label="Users"
            placeholder="Select Users"
            defaultValue={project.users.map((user) => ({
              label: user.id,
              value: user.id,
            }))}
            isMulti
            options={users.map((user) => ({
              label: user.id,
              value: user.id,
            }))}
          />
        </div>

        <input type="hidden" name="id" value={project.id} />

        <footer className="flex items-center justify-between mt-2">
          <Link href="/projects" className="underline text-gray-500">
            Return to Projects list
          </Link>

          <Button type="submit">Update</Button>
        </footer>
      </form>
    </>
  )
}
