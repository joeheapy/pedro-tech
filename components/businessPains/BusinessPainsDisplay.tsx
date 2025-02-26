import { Card } from '@/components/ui/card'
import { CsvDownloadButton } from './CsvDownloadButton'
import { JourneyStep, ITEMS_PER_ROW } from '@/app//lib/types'

interface PainPoint {
  [key: `business-pain-${number}`]: string
}

interface BusinessPainsDisplayProps {
  painPoints?: PainPoint[]
  error?: string
  loading?: boolean
  journeySteps: JourneyStep[]
}

export function BusinessPainsDisplay(props: BusinessPainsDisplayProps) {
  const { painPoints = [], error = '', journeySteps } = props
  const itemsPerRow = ITEMS_PER_ROW
  const painPointIndices = Array.from({ length: itemsPerRow }, (_, i) => i + 1)

  if (error) {
    return (
      <Card className="bg-red-50 p-4">
        <p className="text-red-600">{error}</p>
      </Card>
    )
  }

  if (!painPoints?.length) return null

  console.log(painPoints)

  return (
    <div className="mt-8">
      <div className="flex overflow-x-auto gap-4 pb-4">
        {painPoints.map((point, index) => (
          <Card
            key={index}
            className="p-4 flex-none w-[250px] gradient-blue-dark-reverse border-none"
          >
            <h3 className="font-semibold mb-4">
              Step {index + 1}: {journeySteps[index]?.title}
            </h3>
            <div className="space-y-2">
              {painPointIndices.map((i) => (
                <div key={`pain-${index}-${i}`}>
                  <p className="mt-1 text:sm">
                    {point[`business-pain-${i}` as keyof typeof point]}
                  </p>
                  {i < itemsPerRow && <hr className="border-gray-400 mt-2" />}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div className="flex justify-center mt-4">
        <CsvDownloadButton
          painPoints={painPoints}
          journeySteps={journeySteps}
        />
      </div>
    </div>
  )
}
