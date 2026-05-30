import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import { addXP } from '@/lib/gamification'
import { getSession } from '@/lib/simple-auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.id

    const formData = await request.formData()
    const file = formData.get('file') as File
    const photoType = formData.get('photoType') as string // front, side, back
    const progressLogId = formData.get('progressLogId') as string

    if (!file || !photoType || !progressLogId) {
      return NextResponse.json(
        { error: 'Arquivo, photoType e progressLogId são obrigatórios' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // Save photo record
    const photo = await prisma.progressPhoto.create({
      data: {
        userId,
        progressLogId,
        photoType,
        imageUrl: blob.url,
        storageKey: blob.url,
      },
    })

    // Add XP for uploading photo
    await addXP(userId, 40, 'photo', photo.id)

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error: any) {
    console.error('Upload photo error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload de foto' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('id')

    if (!photoId) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      )
    }

    await prisma.progressPhoto.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar foto' },
      { status: 500 }
    )
  }
}
