import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { subscriptionActive: true },
    })

    if (!profile?.subscriptionActive) {
      return NextResponse.json({ subscriptionActive: false })
    }

    return NextResponse.json({ subscriptionActive: true })
  } catch (error: unknown) {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error:', {
        code: error.code,
        message: error.message,
        meta: error.meta,
      })
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 400 }
      )
    }

    // Handle validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error('Validation error:', error.message)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Handle generic errors
    if (error instanceof Error) {
      console.error('Generic error:', error.message)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // Handle unknown errors
    console.error('Unknown error:', String(error))
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
