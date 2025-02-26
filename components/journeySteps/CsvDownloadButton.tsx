import { Download } from 'react-feather'
import { Button } from '@/components/ui/button'
import { JourneyStep } from '@/app/lib/types'

interface CsvDownloadButtonProps {
  journeySteps: JourneyStep[]
}

export default function CsvDownloadButton({
  journeySteps,
}: CsvDownloadButtonProps) {
  const handleDownload = () => {
    const formatCsvField = (field: string) => {
      const escaped = field.replace(/"/g, '""')
      return `"${escaped}"`
    }

    // Create headers for each step
    const headers = journeySteps.map((_, index) =>
      formatCsvField(`Step ${index + 1}`)
    )

    // Create rows for each property type
    const titleRow = journeySteps.map((step) => formatCsvField(step.title))
    const descriptionRow = journeySteps.map((step) =>
      formatCsvField(step.description)
    )

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      titleRow.join(','),
      descriptionRow.join(','),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'Customer Journey Steps.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      onClick={handleDownload}
      variant="default"
      size="lg"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Download Journey Steps CSV
    </Button>
  )
}
