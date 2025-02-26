import { useState, useEffect } from 'react'
import { Tokenstate, OPEN_TOKEN_BALANCE } from '@/app/lib/types'

export const useTokens = () => {
  const [Tokens, setTokens] = useState<Tokenstate>({
    balance: OPEN_TOKEN_BALANCE,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const savedTokens = localStorage.getItem('userTokens')
    const initialBalance = savedTokens
      ? Number(savedTokens)
      : OPEN_TOKEN_BALANCE

    if (!savedTokens) {
      localStorage.setItem('userTokens', String(initialBalance))
    }

    setTokens({
      balance: initialBalance,
      isLoading: false,
      error: null,
    })
  }, [])

  const deductTokens = (amount: number): void => {
    try {
      const newBalance = Tokens.balance - amount
      if (newBalance < 0) {
        throw new Error('Insufficient Tokens')
      }
      localStorage.setItem('userTokens', String(newBalance))
      setTokens((prev) => ({
        ...prev,
        balance: newBalance,
        error: null,
      }))
    } catch (error) {
      setTokens((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to update Tokens',
      }))
      throw error
    }
  }

  const resetTokens = (): void => {
    try {
      localStorage.setItem('userTokens', String(OPEN_TOKEN_BALANCE))
      setTokens({
        balance: OPEN_TOKEN_BALANCE,
        isLoading: false,
        error: null,
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reset Tokens'
      setTokens((prev) => ({
        ...prev,
        error: errorMessage,
      }))
    }
  }

  return { Tokens, deductTokens, resetTokens }
}
