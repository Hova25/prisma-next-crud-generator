import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { editProfile } from '@/actions/profile'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

export default async function ProfileEditPage({
  params,
}: {
  params: { id: string }
}) {
  const profile = await prisma.profile.findUnique({
    where: { id: Number(params.id) },
    include: {
      user: true,
    },
  })

  const users = await prisma.user.findMany()

  if (!profile) {
    return (
      <>
        <header>
          <Heading>Profile not found</Heading>
        </header>
        <footer>
          <Link href="/profiles">Return to Profiles list</Link>
        </footer>
      </>
    )
  }

  return (
    <>
      <header className="mb-4">
        <Heading>Edit Profile</Heading>
      </header>
      <form action={editProfile} className="px-2 max-w-xl">
        <div>
          <Select
            name="user"
            className="mt-1 mb-2"
            label="User"
            placeholder="Select User"
            defaultValue={{ label: profile.user?.id, value: profile.user?.id }}
            required
            options={users.map((user) => ({
              label: user.id,
              value: user.id,
            }))}
          />
        </div>

        <input type="hidden" name="id" value={profile.id} />

        <footer className="flex items-center justify-between mt-2">
          <Link href="/profiles" className="underline text-gray-500">
            Return to Profiles list
          </Link>

          <Button type="submit">Update</Button>
        </footer>
      </form>
    </>
  )
}
