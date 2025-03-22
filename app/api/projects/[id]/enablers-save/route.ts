import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { EnablerData } from '@/app/lib/types'

interface EnablersSubmission {
  enablers: EnablerData[]
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

    // Get project ID from URL params - must await in Next.js App Router
    const { id: projectId } = await params

    // Get request body
    const { enablers } = (await request.json()) as EnablersSubmission

    // Validate enablers structure
    if (!enablers || !Array.isArray(enablers)) {
      return NextResponse.json(
        { error: 'Invalid enablers data format - array expected' },
        { status: 400 }
      )
    }

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

    // Check if service enablers already exist for this project
    const existingEnablers = await prisma.serviceenablers.findFirst({
      where: {
        projectId,
      },
    })

    let enablersRecord

    if (existingEnablers) {
      // Update existing service enablers
      enablersRecord = await prisma.serviceenablers.update({
        where: {
          id: existingEnablers.id,
        },
        data: {
          enablers: enablers as unknown as Prisma.InputJsonValue,
        },
      })
    } else {
      // Create new service enablers
      enablersRecord = await prisma.serviceenablers.create({
        data: {
          enablers: enablers as unknown as Prisma.InputJsonValue,
          projectId,
        },
      })
    }

    return NextResponse.json(enablersRecord)
  } catch (error: unknown) {
    console.error('Error saving service enablers:', error)
    return NextResponse.json(
      { error: 'Failed to save service enablers' },
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

    // Get project ID from URL params - must await in Next.js App Router
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

    // Find service enablers for this project
    const serviceEnablers = await prisma.serviceenablers.findFirst({
      where: {
        projectId,
      },
    })

    if (!serviceEnablers) {
      // Return empty object if no enablers exist yet
      return NextResponse.json({})
    }

    return NextResponse.json(serviceEnablers)
  } catch (error: unknown) {
    console.error('Error retrieving service enablers:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve service enablers' },
      { status: 500 }
    )
  }
}
