import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TARIFFS } from '@/app/lib/types'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'

interface BusinessPainsFormProps {
  onGenerate: () => Promise<void>
  loading: boolean
  disabled: boolean
}

export function BusinessPainsForm({
  onGenerate,
  loading,
  disabled,
}: BusinessPainsFormProps) {
  return (
    <Card
      className={`w-full p-6 ${
        disabled ? 'bg-muted' : 'gradient-blue-dark'
      } border-none`}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Business Pain Points
            </h2>
            <p className="text-base text-muted-foreground">
              {disabled
                ? 'Create a service story first to identify pain points.'
                : 'Identify likely business pain points at each journey step.'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TariffRoundel cost={TARIFFS.businessPains} variant="small" />
          </div>
        </div>
        <Button
          type="submit"
          onClick={onGenerate}
          disabled={loading || disabled}
          className={`bg-foreground  dark:text-background hover:opacity-70 transition-opacity ${
            disabled ? 'opacity-60' : ''
          }`}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Saving you time...' : 'Identify Business Pain Points'}
        </Button>
      </div>
    </Card>
  )
}
