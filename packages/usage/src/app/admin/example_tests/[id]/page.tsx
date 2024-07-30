import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Heading } from '@/components/ui/Heading'

export default async function ExampleTestPage({
  params,
}: {
  params: { id: string }
}) {
  const exampleTest = await prisma.exampleTest.findUnique({
    where: { id: params.id },
  })

  if (!exampleTest) {
    return (
      <>
        <header>
          <Heading>Example Test not found</Heading>
        </header>
        <footer>
          <Link href="/example_tests">Return to Example Tests list</Link>
        </footer>
      </>
    )
  }

  return (
    <>
      <header className="mt-2 mb-4">
        <Heading>Example Test #{exampleTest.id.substring(0, 6)}...</Heading>
      </header>

      <section className="relative overflow-hidden rounded-lg border border-gray-200 p-4 sm:p-6 lg:p-8 max-w-xl mb-4">
        <span className="absolute inset-x-0 bottom-0 h-21 bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-600"></span>
        <p className="text-gray-700 mb-4 last:mb-0">
          <strong className="text-gray-900">Name:</strong> {exampleTest.name}
        </p>
      </section>

      <footer>
        <Link href="/example_tests" className="underline text-gray-500">
          Return to Example Tests list
        </Link>
      </footer>
    </>
  )
}
