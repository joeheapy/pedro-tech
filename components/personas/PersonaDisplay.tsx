import { Card, CardContent } from '@/components/ui/card'
import { PersonaData } from '@/app/lib/types'
import { CsvDownloadButton } from './CsvDownloadButton'

interface PersonaCardProps {
  personas?: PersonaData[]
  error?: string | null
  isLoading?: boolean
}

export function PersonaDisplay({
  personas = [],
  error = null,
  isLoading = false,
}: PersonaCardProps) {
  if (error) {
    return (
      <Card className="bg-red-50 p-4">
        <p className="text-red-600">{error}</p>
      </Card>
    )
  }

  if (isLoading) {
    return <div>Loading personas...</div>
  }

  // Early return if no personas data. Component isn't rendered until data is available.
  if (!personas || personas.length === 0) {
    return null
  }

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        {personas.map((persona, index) => (
          <Card
            key={index}
            className="w-[340px] flex-none gradient-orange-yellow-reverse border-none"
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="border-2 border-foreground p-3 rounded-lg">
                  <h2 className="text-2xl ">{persona.personaName}</h2>
                  <p className="text-sm">Aged {persona.personaAge}</p>
                </div>
                <h3 className="text-xl font-bold">
                  {persona.personaGroupName}
                </h3>
                <p className="text-lg">{persona.personaGroupDescription}</p>
                <p className="text-base">{persona.personaScenario}</p>
                <blockquote className="text-base italic border-l-2 border-foreground pl-2">
                  {`"${persona.personaQuote}"`}
                </blockquote>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {personas.length > 0 && (
        <div className="mt-4">
          <CsvDownloadButton personas={personas} />
        </div>
      )}
    </div>
  )
}
