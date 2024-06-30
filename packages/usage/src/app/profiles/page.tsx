import { prisma } from '@/lib/prisma'
import { deleteProfile } from '@/actions/profile'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'

export default async function ProfilesListPage() {
  const profiles = await prisma.profile.findMany()

  const breadcrumbs = [
    { name: 'Dashboard', href: '/' },
    { name: 'Profiles', href: '#' },
  ]

  return (
    <>
      <Breadcrumbs elements={breadcrumbs} className="my-2" />

      <header className="flex justify-between mb-4">
        <Heading>All Profiles</Heading>
        <Button as="a" href="/profiles/create" className="font-medium">
          New Profile
        </Button>
      </header>

      <section className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="text-left">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                User Id
              </th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {profiles.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 py-4">
                  No profiles found
                </td>
              </tr>
            )}

            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td className="px-4 py-2 text-gray-700">{profile.userId}</td>

                <td className="px-4 py-2">
                  <div className="flex gap-x-1 h-full justify-center">
                    <Button
                      as="a"
                      href={`/profiles/${profile.id}`}
                      variant="ghost"
                      size="sm"
                      className="font-medium"
                    >
                      Show
                    </Button>
                    <Button
                      as="a"
                      href={`/profiles/${profile.id}/edit`}
                      variant="ghost"
                      size="sm"
                      className="font-medium"
                    >
                      Edit
                    </Button>
                    <form action={deleteProfile} className="inline-block">
                      <input type="hidden" name="id" value={profile.id} />
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
