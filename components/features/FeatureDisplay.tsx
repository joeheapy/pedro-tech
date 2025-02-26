import { Card, CardContent } from '@/components/ui/card'
import { FeatureData } from '@/app/lib/types'
import { CsvDownloadButton } from '@/components/features/CsvDownloadButton'

interface featureCardProps {
  features?: FeatureData[]
  error?: string | null
  isLoading?: boolean
}

export function FeatureDisplay({
  features = [],
  error = null,
  isLoading = false,
}: featureCardProps) {
  if (error) {
    return (
      <Card className="bg-red-50 p-4">
        <p className="text-red-600">{error}</p>
      </Card>
    )
  }

  if (isLoading) {
    return <div>Loading features...</div>
  }

  // Early return if no features data. Component isn't rendered until data is available.
  if (!features || features.length === 0) {
    return null
  }
  console.log(features)

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div className="flex flex-wrap justify-center md:justify-start gap-3">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="w-[320px] flex-none gradient-pink-dark-reverse border-none"
          >
            <CardContent className="p-4">
              <div className="space-y-1">
                <div>
                  <h2 className="text-xl">{feature.featureName}</h2>
                </div>
                <p className="text-sm text-foreground">
                  {feature.featureDescription}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {features.length > 0 && (
        <div className="mt-4">
          <CsvDownloadButton features={features} />
        </div>
      )}
    </div>
  )
}
