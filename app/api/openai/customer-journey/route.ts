import { NextRequest, NextResponse } from 'next/server'
import { openai, withTimeout, handleOpenAIError } from '@/app/lib/openai'
import { JourneyStep } from '@/app/lib/types'
import { OPENAI_MODEL, OPENAI_TEMP, OPENAI_MAX_TOKENS } from '@/app/lib/types'

interface RequestBody {
  formattedPrompt: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }

    const body: RequestBody = await req.json()
    if (!body.formattedPrompt) {
      return NextResponse.json(
        { error: 'Missing formattedPrompt in request body' },
        { status: 400 }
      )
    }

    const { formattedPrompt } = body
    console.log('Formatted prompt:', formattedPrompt)

    const completion = await withTimeout(
      openai.chat.completions.create({
        messages: [{ role: 'user', content: formattedPrompt }],
        model: OPENAI_MODEL,
        temperature: OPENAI_TEMP,
        max_tokens: OPENAI_MAX_TOKENS,
        functions: [
          {
            name: 'createJourneySteps',
            description: 'Create customer journey steps',
            parameters: {
              type: 'object',
              properties: {
                journeySteps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      step: { type: 'number' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                    },
                    required: ['step', 'title', 'description'],
                  },
                },
                responseTitle: { type: 'string' },
              },
              required: ['journeySteps', 'responseTitle'],
            },
          },
        ],
        function_call: { name: 'createJourneySteps' },
      })
    )

    const functionCall = completion.choices[0]?.message?.function_call
    if (!functionCall?.arguments) {
      throw new Error('Invalid response format from OpenAI')
    }

    const { journeySteps, responseTitle } = JSON.parse(functionCall.arguments)
    console.log('Parsed Journey Steps:', journeySteps)
    if (!journeySteps?.length) {
      throw new Error(
        'Sorry. No journey steps were generated. Please click the button to try again.'
      )
    }

    return NextResponse.json({
      data: journeySteps.map((step: Omit<JourneyStep, 'responseTitle'>) => ({
        ...step,
        responseTitle,
      })),
    })
  } catch (error) {
    const errorResponse = handleOpenAIError(error)
    return NextResponse.json(
      { error: errorResponse.error, details: errorResponse.details },
      { status: errorResponse.status }
    )
  }
}
