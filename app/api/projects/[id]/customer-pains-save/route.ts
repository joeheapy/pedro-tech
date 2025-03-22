import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { CustomerPainPointData } from '@/app/lib/types'

interface CustomerPainSubmission {
  painPoints: CustomerPainPointData[]
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

    // CHANGE THIS LINE - Must await params in Next.js App Router
    const { id: projectId } = await params

    // Get request body
    const { painPoints } = (await request.json()) as CustomerPainSubmission

    // Validate pain points structure
    if (!painPoints || !Array.isArray(painPoints)) {
      return NextResponse.json(
        { error: 'Invalid pain points data format - array expected' },
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

    // Check if customer pains already exist for this project
    const existingPains = await prisma.customerpains.findFirst({
      where: {
        projectId,
      },
    })

    let painRecord

    if (existingPains) {
      // Update existing customer pains
      painRecord = await prisma.customerpains.update({
        where: {
          id: existingPains.id,
        },
        data: {
          painPoints: painPoints as unknown as Prisma.InputJsonValue,
        },
      })
    } else {
      // Create new customer pains
      painRecord = await prisma.customerpains.create({
        data: {
          painPoints: painPoints as unknown as Prisma.InputJsonValue,
          projectId,
        },
      })
    }

    return NextResponse.json(painRecord)
  } catch (error: unknown) {
    console.error('Error saving customer pain points:', error)
    return NextResponse.json(
      { error: 'Failed to save customer pain points' },
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

    // CHANGE THIS LINE - Must await params in Next.js App Router
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

    // Find customer pains for this project
    const customerPains = await prisma.customerpains.findFirst({
      where: {
        projectId,
      },
    })

    if (!customerPains) {
      // Return empty object if no pain points exist yet
      return NextResponse.json({})
    }

    return NextResponse.json(customerPains)
  } catch (error: unknown) {
    console.error('Error retrieving customer pain points:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve customer pain points' },
      { status: 500 }
    )
  }
}
