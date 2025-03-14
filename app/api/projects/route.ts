import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'

interface CreateProjectRequest {
  title: string
  description?: string
}

export async function POST(request: Request) {
  try {
    const userAuth = await auth()
    const { userId } = userAuth

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description } =
      (await request.json()) as CreateProjectRequest

    // Find profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description: description || '', // Ensure this has a value
        profileId: profile.id,
      },
    })

    return NextResponse.json(newProject)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating project:', error.message)
    } else {
      console.error('Unknown error creating project:', String(error))
    }
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const userAuth = await auth()
    const { userId } = userAuth

    const url = new URL(request.url)
    console.log('Request URL:', url.toString())

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { projects: true },
    })

    if (!profile) {
      return NextResponse.json({ projects: [] })
    }

    return NextResponse.json({
      projects: profile.projects,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching projects:', error.message)
    } else {
      console.error('Unknown error fetching projects:', String(error))
    }
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
