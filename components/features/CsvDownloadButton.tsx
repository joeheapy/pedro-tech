import { Download } from 'react-feather'
import { Button } from '@/components/ui/button'
import { FeatureData } from '@/app/lib/types'

interface CsvDownloadButtonProps {
  features: FeatureData[]
}

export function CsvDownloadButton({ features }: CsvDownloadButtonProps) {
  const handleDownload = () => {
    const formatCsvField = (field: string | number) => {
      const stringField = String(field)
      const escaped = stringField.replace(/"/g, '""')
      return `"${escaped}"`
    }

    // Create CSV content with headers and rows
    const csvContent = [
      ['Name', 'Description'],
      ...features.map((feature) => [
        formatCsvField(feature.featureName),
        formatCsvField(feature.featureDescription),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'Service Features.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      onClick={handleDownload}
      variant="default"
      size="lg"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export Concept Features to CSV
    </Button>
  )
}
