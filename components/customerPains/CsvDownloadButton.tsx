import { Download } from 'react-feather'
import { Button } from '@/components/ui/button'
import {
  JourneyStep,
  CustomerPainPointData,
  ITEMS_PER_ROW,
} from '@/app/lib/types'

interface CsvDownloadButtonProps {
  painPoints: CustomerPainPointData[]
  journeySteps: JourneyStep[]
}

const validatePainPoint = (point: CustomerPainPointData): boolean => {
  for (let i = 1; i <= ITEMS_PER_ROW; i++) {
    if (typeof point[`customer-pain-${i}`] !== 'string') {
      return false
    }
  }
  return true
}

export function CsvDownloadButton({
  painPoints,
  journeySteps,
}: CsvDownloadButtonProps) {
  const handleDownload = () => {
    if (!painPoints.every(validatePainPoint)) {
      console.error('Invalid pain point data')
      return
    }

    const formatCsvField = (field: string) => {
      const escaped = field.replace(/"/g, '""')
      return `"${escaped}"`
    }

    // Create headers for each step
    const headers = painPoints.map((_, index) =>
      formatCsvField(`Step ${index + 1}`)
    )

    // Create title row from journey steps
    const titleRow = journeySteps.map((step) => formatCsvField(step.title))

    // Create dynamic pain point rows
    const painPointRows = Array.from({ length: ITEMS_PER_ROW }, (_, i) => {
      return painPoints.map((point) =>
        formatCsvField(point[`customer-pain-${i + 1}`])
      )
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      titleRow.join(','),
      ...painPointRows.map((row) => row.join(',')),
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'Customer Pain Points.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button onClick={handleDownload} variant="default" size="lg">
      <Download className="mr-2 h-4 w-4" />
      Download Pain Points CSV
    </Button>
  )
}
