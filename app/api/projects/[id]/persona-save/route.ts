import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client' // Add this import
import { PersonaData } from '@/app/lib/types' // Import the PersonaData type

interface PersonaSubmission {
  personas: PersonaData[] // Change from personaData to personas
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userAuth = await auth()
    const { userId } = userAuth

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project ID from URL
    const { id: projectId } = await params

    // Get request body
    const { personas } = (await request.json()) as PersonaSubmission

    // Find profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify project belongs to user
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

    // Check if personas already exist for this project
    const existingPersona = await prisma.persona.findFirst({
      where: {
        projectId,
      },
    })

    let personaRecord

    if (existingPersona) {
      personaRecord = await prisma.persona.update({
        where: {
          id: existingPersona.id,
        },
        data: {
          personas: personas as unknown as Prisma.InputJsonValue, // Change field name
        },
      })
    } else {
      personaRecord = await prisma.persona.create({
        data: {
          personas: personas as unknown as Prisma.InputJsonValue, // Change field name
          projectId,
        },
      })
    }

    return NextResponse.json(personaRecord)
  } catch (error: unknown) {
    console.error('Error saving personas:', error)
    return NextResponse.json(
      { error: 'Failed to save personas' },
      { status: 500 }
    )
  }
}

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

    // Get project ID from URL
    const { id: projectId } = await params

    // Find profile for the user
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify project belongs to user
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

    // Find persona for this project
    const persona = await prisma.persona.findFirst({
      where: {
        projectId,
      },
    })

    if (!persona) {
      // Return empty object if no persona exists yet
      return NextResponse.json({})
    }

    return NextResponse.json(persona)
  } catch (error: unknown) {
    console.error('Error retrieving personas:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve personas' },
      { status: 500 }
    )
  }
}
