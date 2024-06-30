'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createProfile(formData: FormData) {
  const data = {
    user:
      formData.get('user') != ''
        ? { connect: { id: formData.get('user') as string } }
        : {},
  }

  const profile = await prisma.profile.create({ data })

  if (profile) {
    redirect(`/profiles/${profile.id}`)
  }
}

export async function editProfile(formData: FormData) {
  const id = formData.get('id') as string
  try {
    const data = {
      user:
        formData.get('user') != ''
          ? { connect: { id: formData.get('user') as string } }
          : { disconnect: true },
    }

    await prisma.profile.update({
      where: { id: Number(id) },
      data,
    })
  } catch (error) {
    console.error('[EDIT ACTION ERROR:', error)
    return { message: error }
  }

  redirect(`/profiles/${id}`)
}

export async function deleteProfile(formData: FormData) {
  const id = formData.get('id') as string
  try {
    await prisma.profile.delete({
      where: { id: Number(id) },
    })
  } catch (error) {
    console.error('DELETE ACTION ERROR:', error)
    return { message: 'Unable to delete profile' }
  }

  revalidatePath(`/profiles`)
}
