import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { JourneyFormData, TARIFFS } from '@/app/lib/types'
import { TariffRoundel } from '@/components/ui/tarrifRoundal'

interface JourneyFormProps {
  onSubmit: (formData: JourneyFormData) => Promise<void>
  isLoading: boolean
}

export function JourneyForm({ onSubmit, isLoading }: JourneyFormProps) {
  const [formData, setFormData] = useState<JourneyFormData>({
    business_proposition: '',
    customer_scenario: '',
    target_customers: '',
    persona_name: '',
  })
  const [error, setError] = useState<string | null>(null)

  const validateForm = (data: JourneyFormData): boolean => {
    return Boolean(
      data.business_proposition &&
        data.customer_scenario &&
        data.target_customers &&
        data.persona_name
    )
  }

  const handleInputChange =
    (field: keyof JourneyFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
      setError(null)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(formData)) {
      setError('All fields are required')
      return
    }
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full p-6 gradient-teal-lime border-none">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Make a Service Story</h2>
              <p className="text-base text-foreground">
                Create a service story to get started.
              </p>
            </div>
            <div>
              <TariffRoundel cost={TARIFFS.journeySteps} variant="small" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_proposition">Business Proposition</Label>
              <Input
                id="business_proposition"
                placeholder="Roadside recovery for electric vehicles"
                value={formData.business_proposition}
                onChange={handleInputChange('business_proposition')}
                className="input-custom"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_scenario">Customer Scenario</Label>
              <Input
                id="customer_scenario"
                placeholder="Broken down on a motorway in an electric vehicle"
                value={formData.customer_scenario}
                onChange={handleInputChange('customer_scenario')}
                className="input-custom"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_customers">Target Customers</Label>
              <Input
                id="target_customers"
                placeholder="Motorists with electric vehicles"
                value={formData.target_customers}
                onChange={handleInputChange('target_customers')}
                className="input-custom"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="persona_name">
                Give the character in your service story a name
              </Label>
              <Input
                id="persona_name"
                placeholder="Larry"
                value={formData.persona_name}
                onChange={handleInputChange('persona_name')}
                className="input-custom"
                required
                aria-required="true"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="hover:opacity-70 transition-opacity"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Saving you time...' : 'Create Service Story'}
          </Button>
        </div>
      </Card>
    </form>
  )
}
