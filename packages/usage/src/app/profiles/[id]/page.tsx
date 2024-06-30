import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Heading } from '@/components/ui/Heading'

export default async function ProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const profile = await prisma.profile.findUnique({
    where: { id: Number(params.id) },
  })

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
      <header className="mt-2 mb-4">
        <Heading>Profile #{profile.id}</Heading>
      </header>

      <section className="relative overflow-hidden rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8 max-w-xl mb-4">
        <span className="absolute inset-x-0 bottom-0 h-21 bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-600"></span>
        <p className="text-gray-700 mb-4 last:mb-0">
          <strong className="text-gray-900">User Id:</strong> {profile.userId}
        </p>
      </section>

      <footer>
        <Link href="/profiles" className="underline text-gray-500">
          Return to Profiles list
        </Link>
      </footer>
    </>
  )
}
