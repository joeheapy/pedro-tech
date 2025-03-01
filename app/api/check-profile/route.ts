import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
    }

    // Check if the profile exists
    const profile = await prisma.profile.findUnique({
      where: { userId },
    })

    console.log(`Profile check for user ${userId}:`, !!profile)
    return NextResponse.json({ exists: !!profile })
  } catch (error) {
    console.error('Error checking profile:', error)
    return NextResponse.json(
      { error: 'Failed to check profile' },
      { status: 500 }
    )
  }
}
