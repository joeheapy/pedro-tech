import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { BusinessPainPointData } from '@/app/lib/types'

interface BusinessPainSubmission {
  painPoints: BusinessPainPointData[]
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
    const { painPoints } = (await request.json()) as BusinessPainSubmission

    // Enhanced validation to ensure data matches expected format
    if (!painPoints || !Array.isArray(painPoints)) {
      return NextResponse.json(
        { error: 'Invalid pain points data format - array expected' },
        { status: 400 }
      )
    }

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

    // Check if business pains already exist for this project
    const existingPains = await prisma.businesspains.findFirst({
      where: {
        projectId,
      },
    })

    let painRecord

    if (existingPains) {
      // Update existing business pains
      painRecord = await prisma.businesspains.update({
        where: {
          id: existingPains.id,
        },
        data: {
          painPoints: painPoints as unknown as Prisma.InputJsonValue,
        },
      })
    } else {
      // Create new business pains
      painRecord = await prisma.businesspains.create({
        data: {
          painPoints: painPoints as unknown as Prisma.InputJsonValue,
          projectId,
        },
      })
    }

    return NextResponse.json(painRecord)
  } catch (error: unknown) {
    console.error('Error saving business pain points:', error)
    return NextResponse.json(
      { error: 'Failed to save business pain points' },
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

    // Find business pains for this project
    const businessPains = await prisma.businesspains.findFirst({
      where: {
        projectId,
      },
    })

    if (!businessPains) {
      // Return empty object if no pain points exist yet
      return NextResponse.json({})
    }

    return NextResponse.json(businessPains)
  } catch (error: unknown) {
    console.error('Error retrieving business pain points:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve business pain points' },
      { status: 500 }
    )
  }
}
