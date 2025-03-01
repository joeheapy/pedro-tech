import { Download } from 'react-feather'
import { Button } from '@/components/ui/button'
import { EnablerData } from '@/app/lib/types'

interface CsvDownloadButtonProps {
  enablers: EnablerData[]
}

export function CsvDownloadButton({ enablers }: CsvDownloadButtonProps) {
  const handleDownload = () => {
    const formatCsvField = (field: string | number) => {
      const stringField = String(field)
      const escaped = stringField.replace(/"/g, '""')
      return `"${escaped}"`
    }

    // Create CSV content with headers and rows
    const csvContent = [
      ['Name', 'Description'],
      ...enablers.map((enabler) => [
        formatCsvField(enabler.enablerName),
        formatCsvField(enabler.enablerDescription),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'Service Enablers.csv')
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
      className="bg-foreground text-background gap-2"
    >
      <Download className="text-background h-4 w-4" />
      Export Enablers to CSV
    </Button>
  )
}
