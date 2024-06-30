import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createExampleTest } from '@/actions/example_test'
import { Input } from '@/components/ui/Input'
import { Heading } from '@/components/ui/Heading'
import { Button } from '@/components/ui/Button'

export default async function ExampleTestCreatePage() {
  return (
    <>
      <header className="mb-4">
        <Heading>Create ExampleTest</Heading>
      </header>
      <form action={createExampleTest} className="px-2 max-w-xl">
        <div>
          <Input
            type="text"
            label="Name"
            name="name"
            className="mb-2"
            required
          />
        </div>

        <footer className="flex items-center justify-between mt-2">
          <Link href="/example_tests" className="underline text-gray-500">
            Return to Example Tests list
          </Link>

          <Button type="submit">Create</Button>
        </footer>
      </form>
    </>
  )
}
