import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { ServiceFeature } from '@/app/lib/types'

interface ServiceFeaturesSubmission {
  features: ServiceFeature[]
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
    const { features } = (await request.json()) as ServiceFeaturesSubmission

    // Validate features structure
    if (!features || !Array.isArray(features)) {
      return NextResponse.json(
        { error: 'Invalid features data format - array expected' },
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

    // Check if service features already exist for this project
    const existingFeatures = await prisma.servicefeatures.findFirst({
      where: {
        projectId,
      },
    })

    let featuresRecord

    if (existingFeatures) {
      // Update existing service features
      featuresRecord = await prisma.servicefeatures.update({
        where: {
          id: existingFeatures.id,
        },
        data: {
          features: features as unknown as Prisma.InputJsonValue,
        },
      })
    } else {
      // Create new service features
      featuresRecord = await prisma.servicefeatures.create({
        data: {
          features: features as unknown as Prisma.InputJsonValue,
          projectId,
        },
      })
    }

    return NextResponse.json(featuresRecord)
  } catch (error: unknown) {
    console.error('Error saving service features:', error)
    return NextResponse.json(
      { error: 'Failed to save service features' },
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

    // Find service features for this project
    const serviceFeatures = await prisma.servicefeatures.findFirst({
      where: {
        projectId,
      },
    })

    if (!serviceFeatures) {
      // Return empty object if no features exist yet
      return NextResponse.json({})
    }

    return NextResponse.json(serviceFeatures)
  } catch (error: unknown) {
    console.error('Error retrieving service features:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve service features' },
      { status: 500 }
    )
  }
}
