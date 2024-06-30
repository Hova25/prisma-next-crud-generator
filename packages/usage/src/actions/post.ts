'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function createPost(formData: FormData) {
  const data = {
    content: formData.get('content') as string,
    user:
      formData.get('user') != ''
        ? { connect: { id: formData.get('user') as string } }
        : {},
  }

  const post = await prisma.post.create({ data })

  if (post) {
    redirect(`/posts/${post.id}`)
  }
}

export async function editPost(formData: FormData) {
  const id = formData.get('id') as string
  try {
    const data = {
      content: formData.get('content') as string,
      user:
        formData.get('user') != ''
          ? { connect: { id: formData.get('user') as string } }
          : { disconnect: true },
    }

    await prisma.post.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error('[EDIT ACTION ERROR:', error)
    return { message: error }
  }

  redirect(`/posts/${id}`)
}

export async function deletePost(formData: FormData) {
  const id = formData.get('id') as string
  try {
    await prisma.post.delete({
      where: { id },
    })
  } catch (error) {
    console.error('DELETE ACTION ERROR:', error)
    return { message: 'Unable to delete post' }
  }

  revalidatePath(`/posts`)
}
