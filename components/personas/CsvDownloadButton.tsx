import { Download } from 'react-feather'
import { Button } from '@/components/ui/button'
import { PersonaData } from '@/app/lib/types'

interface CsvDownloadButtonProps {
  personas: PersonaData[]
}

export function CsvDownloadButton({ personas }: CsvDownloadButtonProps) {
  const handleDownload = () => {
    const formatCsvField = (field: string | number) => {
      const stringField = String(field)
      const escaped = stringField.replace(/"/g, '""')
      return `"${escaped}"`
    }

    // Create headers (persona names)
    const headers = personas.map((persona) =>
      formatCsvField(persona.personaName)
    )

    // Create rows for each property
    const ageRow = personas.map((persona) => formatCsvField(persona.personaAge))
    const genderRow = personas.map((persona) =>
      formatCsvField(persona.personaGender)
    )
    const groupNameRow = personas.map((persona) =>
      formatCsvField(persona.personaGroupName)
    )
    const groupDescriptionRow = personas.map((persona) =>
      formatCsvField(persona.personaGroupDescription)
    )
    const scenarioRow = personas.map((persona) =>
      formatCsvField(persona.personaScenario)
    )
    const quoteRow = personas.map((persona) =>
      formatCsvField(persona.personaQuote)
    )

    // Combine all rows with row headers
    const csvContent = [
      ['Name', ...headers],
      ['Age', ...ageRow],
      ['Gender', ...genderRow],
      ['Group', ...groupNameRow],
      ['Description', ...groupDescriptionRow],
      ['Scenario', ...scenarioRow],
      ['Quote', ...quoteRow],
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'Personas.csv')
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
      Download Personas to CSV
    </Button>
  )
}
