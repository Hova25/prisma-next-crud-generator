import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { editExampleTest } from '@/actions/example_test'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'

export default async function ExampleTestEditPage({
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
      <header className="mb-4">
        <Heading>Edit ExampleTest</Heading>
      </header>
      <form action={editExampleTest} className="px-2 max-w-xl">
        <div>
          <Input
            type="text"
            label="Name"
            name="name"
            className="mb-2"
            defaultValue={exampleTest.name}
            required
          />
        </div>

        <input type="hidden" name="id" value={exampleTest.id} />

        <footer className="flex items-center justify-between mt-2">
          <Link href="/example_tests" className="underline text-gray-500">
            Return to Example Tests list
          </Link>

          <Button type="submit">Update</Button>
        </footer>
      </form>
    </>
  )
}
