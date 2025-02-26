import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { JourneyStep } from '../lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToCSV(journeySteps: JourneyStep[]): string {
  const headers = ['Step', 'Title', 'Description']

  const rows = journeySteps.map((step) => [
    step.step.toString(),
    step.title,
    step.description,
  ])

  // Escape cells and wrap in quotes
  const escapeCells = (row: string[]) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`)

  return [
    escapeCells(headers).join(','),
    ...rows.map((row) => escapeCells(row).join(',')),
  ].join('\n')
}
