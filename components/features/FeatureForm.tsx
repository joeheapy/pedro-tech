import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TARIFFS, NUMBER_OF_FEATURES } from '@/app/lib/types'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'

interface FeatureFormProps {
  onGenerate: () => void
  loading: boolean
  hasJourney: boolean
  hasCustomerPains: boolean
  hasBusinessPains: boolean
}

export function FeatureForm({
  onGenerate,
  loading,
  hasJourney,
  hasCustomerPains,
}: //hasBusinessPains,
FeatureFormProps) {
  const isDisabled = !hasJourney || !hasCustomerPains // || !hasBusinessPains;

  const getStatusMessage = () => {
    if (!hasJourney) return 'Create a service story first.'
    if (!hasCustomerPains) return 'Generate customer pain points first.'
    // if (!hasBusinessPains) return "Generate customer pain points first.";
    return `Brainstorm ${NUMBER_OF_FEATURES} service feature ideas to get you started.`
  }

  return (
    <Card
      className={`w-full p-6 ${
        isDisabled ? 'bg-muted' : 'gradient-pink-dark'
      } border-none`}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Service Features
            </h2>
            <p className="text-base text-muted-foreground">
              {getStatusMessage()}
            </p>
          </div>
          <div>
            {' '}
            <TariffRoundel cost={TARIFFS.features} variant="small" />
          </div>
        </div>
        <Button
          type="submit"
          onClick={onGenerate}
          disabled={loading || isDisabled}
          className={`hover:opacity-70 transition-opacity ${
            isDisabled ? 'opacity-60' : ''
          }`}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Saving you time...' : 'Brainstorm Features'}
        </Button>
      </div>
    </Card>
  )
}
