import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'

interface JourneyFormSubmission {
  formData: {
    businessProposition: string
    customerScenario: string
    targetCustomers: string
    personaName: string
  }
  journeySteps: Array<{
    step: number
    title: string
    description: string
  }>
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

    // Fix: Await the params object itself and then destructure
    const { id: projectId } = await params

    const { formData, journeySteps } =
      (await request.json()) as JourneyFormSubmission

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

    // Check if journey steps already exist for this project
    const existingJourneySteps = await prisma.journeySteps.findFirst({
      where: {
        projectId: projectId,
      },
    })

    let journeyStepsRecord

    if (existingJourneySteps) {
      // Update existing journey steps
      journeyStepsRecord = await prisma.journeySteps.update({
        where: {
          id: existingJourneySteps.id,
        },
        data: {
          businessProposition: formData.businessProposition,
          customerScenario: formData.customerScenario,
          targetCustomers: formData.targetCustomers,
          personaName: formData.personaName,
          journeyData: journeySteps,
        },
      })
    } else {
      // Create new journey steps
      journeyStepsRecord = await prisma.journeySteps.create({
        data: {
          businessProposition: formData.businessProposition,
          customerScenario: formData.customerScenario,
          targetCustomers: formData.targetCustomers,
          personaName: formData.personaName,
          journeyData: journeySteps,
          projectId: projectId,
        },
      })
    }

    return NextResponse.json(journeyStepsRecord)
  } catch (error: unknown) {
    console.error('Error saving journey steps:', error)
    return NextResponse.json(
      { error: 'Failed to save journey steps' },
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

    const { id: projectId } = await params // Also fix this line in the GET handler

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

    // Find journey steps for this project
    const journeySteps = await prisma.journeySteps.findFirst({
      where: {
        projectId: projectId,
      },
    })

    if (!journeySteps) {
      return NextResponse.json({})
    }

    return NextResponse.json(journeySteps)
  } catch (error: unknown) {
    console.error('Error retrieving journey steps:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve journey steps' },
      { status: 500 }
    )
  }
}
