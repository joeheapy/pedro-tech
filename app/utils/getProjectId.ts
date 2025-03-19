'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

/**
 * Custom hook to extract and validate project ID from URL
 * @param validateId Optional function to validate the project ID
 * @returns Object containing projectId and validation state
 */
export function useProjectId(validateId?: (id: string) => Promise<boolean>) {
  const searchParams = useSearchParams()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const urlProjectId = searchParams.get('projectId')
    console.log('URL Project ID:', urlProjectId)
    setProjectId(urlProjectId)

    // Reset validation state when projectId changes
    setIsValid(false)
    setError(null)

    // Validate the ID if a validation function is provided
    if (urlProjectId && validateId) {
      setIsValidating(true)
      validateId(urlProjectId)
        .then((valid) => {
          setIsValid(valid)
          if (!valid) {
            setError('Invalid project ID')
          }
        })
        .catch((err) => {
          console.error('Error validating project ID:', err)
          setError('Failed to validate project ID')
        })
        .finally(() => {
          setIsValidating(false)
        })
    }
  }, [searchParams, validateId])

  return { projectId, isValidating, isValid, error }
}

/**
 * Utility function to validate a project ID by checking if it exists
 * @param projectId The project ID to validate
 * @returns Promise that resolves to true if project exists and is accessible
 */
export async function validateProjectExists(
  projectId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/projects/${projectId}`)
    return response.ok
  } catch (error) {
    console.error('Error validating project ID:', error)
    return false
  }
}

/**
 * Simple function to get project ID from URL (for non-React contexts)
 * @returns The project ID from the URL or null if not found
 */
export function getProjectIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  const url = new URL(window.location.href)
  return url.searchParams.get('projectId')
}
