import { Card, CardContent } from '@/components/ui/card'
import { EnablerData } from '@/app/lib/types'
import { CsvDownloadButton } from '@/components/enablers/CsvDownloadButton'

interface enablerCardProps {
  enablers?: EnablerData[]
  error?: string | null
  isLoading?: boolean
}

export function EnablerDisplay({
  enablers = [],
  error = null,
  isLoading = false,
}: enablerCardProps) {
  if (error) {
    return (
      <Card className="bg-red-50 p-4">
        <p className="text-red-600">{error}</p>
      </Card>
    )
  }

  if (isLoading) {
    return <div>Loading enablers...</div>
  }

  // Early return if no enablers data. Component isn't rendered until data is available.
  if (!enablers || enablers.length === 0) {
    return null
  }
  console.log(enablers)

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="flex flex-wrap justify-center md:justify-start gap-3">
        {enablers.map((enabler, index) => (
          <Card
            key={index}
            className="w-[340px] flex-none gradient-pink-dark-reverse border-none"
          >
            <CardContent className="p-4">
              <div className="space-y-1">
                <div>
                  <h2 className="text-xl">{enabler.enablerName}</h2>
                </div>
                <p className="text-sm text-foreground">
                  {enabler.enablerDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {enablers.length > 0 && (
        <div className="mt-4">
          <CsvDownloadButton enablers={enablers} />
        </div>
      )}
    </div>
  )
}
