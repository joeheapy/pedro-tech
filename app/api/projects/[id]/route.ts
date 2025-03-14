// app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'

// GET a single project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userAuth = await auth()
    const { userId } = userAuth

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = (await params).id

    // Find profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find the project and verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        profileId: profile.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or not owned by user' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching project:', error.message)
    } else {
      console.error('Unknown error fetching project:', String(error))
    }
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// DELETE a project
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userAuth = await auth()
    const { userId } = userAuth

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = (await params).id

    // Find profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if project belongs to this user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        profileId: profile.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or not owned by user' },
        { status: 404 }
      )
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: projectId },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting project:', error.message)
    } else {
      console.error('Unknown error deleting project:', String(error))
    }
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

// PATCH a project
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userAuth = await auth()
    const { userId } = userAuth

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = (await params).id

    // Parse the request body
    const updates = await request.json()

    // Define type-safe update object
    interface ProjectUpdates {
      title?: string
      description?: string
      updatedAt: Date
    }

    // Validate updates with proper typing
    const validUpdates: ProjectUpdates = {
      updatedAt: new Date(), // Always update this timestamp
    }

    if ('title' in updates && typeof updates.title === 'string') {
      validUpdates.title = updates.title
    }

    if (
      'description' in updates &&
      (typeof updates.description === 'string' || updates.description === null)
    ) {
      validUpdates.description = updates.description || '' // Convert null to empty string
    }

    // Add updatedAt timestamp
    validUpdates.updatedAt = new Date()

    // Find profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if project belongs to this user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        profileId: profile.id,
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found or not owned by user' },
        { status: 404 }
      )
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: validUpdates,
    })

    return NextResponse.json(updatedProject)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating project:', error.message)
    } else {
      console.error('Unknown error updating project:', String(error))
    }
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}
