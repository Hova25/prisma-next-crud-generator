'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createExampleTest(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
  }

  const exampleTest = await prisma.exampleTest.create({ data })

  if (exampleTest) {
    redirect(`/example_tests/${exampleTest.id}`)
  }
}

export async function editExampleTest(formData: FormData) {
  const id = formData.get('id') as string
  try {
    const data = {
      name: formData.get('name') as string,
    }

    await prisma.exampleTest.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error('[EDIT ACTION ERROR:', error)
    return { message: error }
  }

  redirect(`/example_tests/${id}`)
}

export async function deleteExampleTest(formData: FormData) {
  const id = formData.get('id') as string
  try {
    await prisma.exampleTest.delete({
      where: { id },
    })
  } catch (error) {
    console.error('DELETE ACTION ERROR:', error)
    return { message: 'Unable to delete exampleTest' }
  }

  revalidatePath(`/example_tests`)
}
