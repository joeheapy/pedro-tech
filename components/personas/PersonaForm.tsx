import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { TARIFFS } from '@/app/lib/types'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'

interface PersonaFormProps {
  onGenerate: () => Promise<void>
  loading: boolean
  disabled: boolean
}

export function PersonaForm({
  onGenerate,
  loading,
  disabled,
}: PersonaFormProps) {
  return (
    <Card
      className={`w-full p-6 ${
        disabled ? 'bg-muted' : 'gradient-orange-yellow'
      } border-none`}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Personas</h2>
            <p className="text-base text-muted-foreground">
              {disabled
                ? 'Create a service story first to draft personas.'
                : 'Draft user personas to inform your research and trigger some early ideas.'}
            </p>
          </div>
          <div>
            {' '}
            <TariffRoundel cost={TARIFFS.personas} variant="small" />
          </div>
        </div>
        <Button
          type="submit"
          onClick={onGenerate}
          disabled={loading || disabled}
          className={`hover:opacity-70 transition-opacity ${
            disabled ? 'opacity-60' : ''
          }`}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Saving you time...' : 'Draft Personas'}
        </Button>
      </div>
    </Card>
  )
}
