'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createProject(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    users:
      formData.get('users') != ''
        ? {
            connect: formData
              .getAll('users')
              .map((userId) => ({ id: userId as string })),
          }
        : {},
  }

  const project = await prisma.project.create({ data })

  if (project) {
    redirect(`/projects/${project.id}`)
  }
}

export async function editProject(formData: FormData) {
  const id = formData.get('id') as string
  try {
    const data = {
      name: formData.get('name') as string,
      users:
        formData.get('users') != ''
          ? {
              connect: formData
                .getAll('users')
                .map((userId) => ({ id: userId as string })),
            }
          : { set: [] },
    }

    await prisma.project.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error('[EDIT ACTION ERROR:', error)
    return { message: error }
  }

  redirect(`/projects/${id}`)
}

export async function deleteProject(formData: FormData) {
  const id = formData.get('id') as string
  try {
    await prisma.project.delete({
      where: { id },
    })
  } catch (error) {
    console.error('DELETE ACTION ERROR:', error)
    return { message: 'Unable to delete project' }
  }

  revalidatePath(`/projects`)
}
