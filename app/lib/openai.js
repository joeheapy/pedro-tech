import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const withTimeout = async (promise, timeoutMs = 45000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
  )
  return Promise.race([promise, timeout])
}

export const handleOpenAIError = (error) => {
  console.error('API Error:', error)

  if (error instanceof OpenAI.APIError) {
    return { error: 'OpenAI API error', details: error.message, status: 502 }
  }

  if (error.name === 'AbortError') {
    return { error: 'Request timed out', status: 504 }
  }

  return {
    error: error.message || 'Internal server error',
    status: 500,
  }
}
