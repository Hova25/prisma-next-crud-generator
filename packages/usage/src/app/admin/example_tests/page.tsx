import { prisma } from '@/lib/prisma'
import { deleteExampleTest } from '@/actions/example_test'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'

export default async function ExampleTestsListPage() {
  const exampleTests = await prisma.exampleTest.findMany()

  const breadcrumbs = [
    { name: 'Dashboard', href: '/' },
    { name: 'Example Tests', href: '#' },
  ]

  return (
    <>
      <Breadcrumbs elements={breadcrumbs} className="my-2" />

      <header className="flex justify-between mb-4">
        <Heading>All Example Tests</Heading>
        <Button as="a" href="/example_tests/create" className="font-medium">
          New Example Test
        </Button>
      </header>

      <section className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="text-left">
            <tr>
              <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                Name
              </th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exampleTests.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-gray-500 py-4">
                  No exampleTests found
                </td>
              </tr>
            )}

            {exampleTests.map((exampleTest) => (
              <tr key={exampleTest.id}>
                <td className="px-4 py-2 text-gray-700">{exampleTest.name}</td>

                <td className="px-4 py-2">
                  <div className="flex gap-x-1 h-full justify-center">
                    <Button
                      as="a"
                      href={`/example_tests/${exampleTest.id}`}
                      variant="ghost"
                      size="sm"
                      className="font-medium"
                    >
                      Show
                    </Button>
                    <Button
                      as="a"
                      href={`/example_tests/${exampleTest.id}/edit`}
                      variant="ghost"
                      size="sm"
                      className="font-medium"
                    >
                      Edit
                    </Button>
                    <form action={deleteExampleTest} className="inline-block">
                      <input type="hidden" name="id" value={exampleTest.id} />
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
