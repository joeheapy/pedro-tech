'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { Edit2, Save } from 'react-feather'
import { JourneyStep, JourneyFormData } from '@/app/lib/types'
// import { TariffRoundel } from '@/components/ui/tarrifRoundal'
import CsvDownloadButton from './CsvDownloadButton'
import { getProjectIdFromUrl } from '@/app/utils/getProjectId'
import { toast } from 'react-hot-toast' // or your preferred toast library

interface JourneyContainerProps {
  onJourneyGenerated: (steps: JourneyStep[]) => void
  journeySteps: JourneyStep[]
  projectId?: string // Make this optional to handle undefined cases
}

interface EditableStep extends JourneyStep {
  isEditing: boolean
}

interface EditingValues {
  title: string
  description: string
}

export function JourneyContainer({
  onJourneyGenerated,
  journeySteps,
  projectId,
}: JourneyContainerProps) {
  // Form state
  const [formData, setFormData] = useState<JourneyFormData>({
    business_proposition: '',
    customer_scenario: '',
    target_customers: '',
    persona_name: '',
  })

  // Container state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Display state
  const [editableSteps, setEditableSteps] = useState<EditableStep[]>([])
  const [editingValues, setEditingValues] = useState<{
    [key: number]: EditingValues
  }>({})
  const [savingStepIndex, setSavingStepIndex] = useState<number | null>(null)

  // Initialize editable steps when journey steps change
  useEffect(() => {
    if (journeySteps?.length) {
      setEditableSteps(
        journeySteps.map((step) => ({ ...step, isEditing: false }))
      )
    }
  }, [journeySteps])

  // Form validation
  const validateForm = (data: JourneyFormData): boolean => {
    return Boolean(
      data.business_proposition &&
        data.customer_scenario &&
        data.target_customers &&
        data.persona_name
    )
  }

  // Form input change handler
  const handleInputChange =
    (field: keyof JourneyFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
      setError('')
    }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(formData)) {
      setError('All fields are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Call OpenAI for journey steps
      const response = await fetch('/api/openai/customer-journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formattedPrompt: createPrompt(formData),
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { data } = await response.json()

      // 2. Update local state first (this already happens)
      onJourneyGenerated(data)

      // 3. Get the project ID from URL
      const projectId = getProjectIdFromUrl()
      if (!projectId) {
        console.warn(
          'No project ID found in URL, unable to save journey steps to database'
        )
        return
      }

      // 4. Save to database
      const saveResponse = await fetch(
        `/api/projects/${projectId}/journey-steps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData: {
              businessProposition: formData.business_proposition,
              customerScenario: formData.customer_scenario,
              targetCustomers: formData.target_customers,
              personaName: formData.persona_name,
            },
            journeySteps: data,
          }),
        }
      )

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        console.error('Error saving journey steps:', errorText)
        toast.error('Failed to save journey steps')
        // Don't throw here - we already have the data in the UI
        // Just log the error but don't disrupt the user experience
      } else {
        console.log('Journey steps saved successfully to database')
        toast.success('Journey steps saved successfully')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  // Prompt creation
  const createPrompt = (inputs: JourneyFormData) => {
    return `You are a world-class customer experience designer with expertise in journey mapping and service design. Create a comprehensive customer journey for a ${inputs.target_customers} named ${inputs.persona_name} who is exploring ${inputs.business_proposition} products and services. Context: ${inputs.persona_name} has ${inputs.customer_scenario}. Map out a detailed end-to-end journey in 10 key stages, from initial awareness through service usage to post-service relationship management. Define a clear title that captures the key interaction or emotional state. Describe the customer's actions, thoughts, and feelings. Identify key touchpoints and channels. Focus on creating memorable moments that build long-term loyalty while addressing friction points in the customer experience. Consider both digital and physical touchpoints where relevant.`
  }

  // Step editing handlers
  const handleEdit = (stepNumber: number) => {
    const step = editableSteps.find((s) => s.step === stepNumber)
    if (!step) return

    setEditingValues((prev) => ({
      ...prev,
      [stepNumber]: {
        title: step.title,
        description: step.description,
      },
    }))

    setEditableSteps((steps) =>
      steps.map((s) => ({
        ...s,
        isEditing: s.step === stepNumber,
      }))
    )
  }

  const handleEditingInputChange = (
    stepNumber: number,
    field: keyof EditingValues,
    value: string
  ) => {
    setEditingValues((prev) => ({
      ...prev,
      [stepNumber]: {
        ...prev[stepNumber],
        [field]: value,
      },
    }))
  }

  const handleSave = async (stepNumber: number) => {
    const values = editingValues[stepNumber]
    if (!values) return

    // Get project ID from props or URL
    const currentProjectId = projectId || getProjectIdFromUrl()
    if (!currentProjectId) {
      toast.error('Cannot save: Missing project ID')
      return
    }

    // Create updatedJourneySteps BEFORE updating local state
    // This ensures we have the correct edited values
    const updatedJourneySteps = editableSteps.map((step) => {
      if (step.step === stepNumber) {
        return {
          step: stepNumber,
          title: values.title,
          description: values.description,
        }
      }
      return {
        step: step.step,
        title: step.title,
        description: step.description,
      }
    })

    // Update local state
    setEditableSteps((steps) =>
      steps.map((s) =>
        s.step === stepNumber
          ? {
              ...s,
              title: values.title,
              description: values.description,
              isEditing: false,
            }
          : s
      )
    )

    // Update parent component state right away
    // This ensures UI consistency
    onJourneyGenerated(updatedJourneySteps)

    // Then save to database
    try {
      setSavingStepIndex(stepNumber)

      // Get the form data
      const formDataToSave = {
        businessProposition: formData.business_proposition,
        customerScenario: formData.customer_scenario,
        targetCustomers: formData.target_customers,
        personaName: formData.persona_name,
      }

      // Save to database
      const saveResponse = await fetch(
        `/api/projects/${currentProjectId}/journey-steps`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData: formDataToSave,
            journeySteps: updatedJourneySteps, // Already created above
          }),
        }
      )

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        console.error('Error saving edited step:', errorText)
        toast.error('Failed to save changes')
      } else {
        toast.success('Changes saved successfully')
      }
    } catch (error) {
      console.error('Error saving step:', error)
      toast.error('Failed to save changes')
    } finally {
      setSavingStepIndex(null)
    }
  }

  return (
    <div className="w-full space-y-8">
      <form onSubmit={handleSubmit}>
        <Card className="w-full p-6 gradient-teal-lime border-none">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                {journeySteps.length === 0 && (
                  <>
                    <h2 className="text-2xl font-semibold">
                      Make a Service Story
                    </h2>
                    <p className="text-base text-foreground">
                      Create a service story to get started.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_proposition">
                  Business Proposition
                </Label>
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
              disabled={loading}
              className="bg-foreground dark:text-background hover:opacity-70 transition-opacity"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Saving you time...' : 'Create Service Story'}
            </Button>
          </div>
        </Card>
      </form>

      {/* Display Section (Previously JourneyDisplay) */}
      {journeySteps?.length > 0 && (
        <div className="mt-8">
          <div className="flex overflow-x-auto gap-4 pb-4">
            {editableSteps.map((step) => (
              <Card
                key={`journey-step-${step.step}`}
                className="p-4 flex-none w-[250px] gradient-teal-lime-reverse border-none"
              >
                <div className="space-y-4">
                  {step.isEditing ? (
                    <>
                      <Textarea
                        key={`edit-title-${step.step}`}
                        value={editingValues[step.step]?.title || ''}
                        onChange={(e) =>
                          handleEditingInputChange(
                            step.step,
                            'title',
                            e.target.value
                          )
                        }
                        className="w-full text-foreground"
                        placeholder="Step title"
                      />
                      <Textarea
                        key={`edit-desc-${step.step}`}
                        value={editingValues[step.step]?.description || ''}
                        onChange={(e) =>
                          handleEditingInputChange(
                            step.step,
                            'description',
                            e.target.value
                          )
                        }
                        className="w-full min-h-[160px] text-foreground"
                        placeholder="Step description"
                      />
                      <Button
                        onClick={() => handleSave(step.step)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={savingStepIndex === step.step}
                      >
                        {savingStepIndex === step.step ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold">
                        Step {step.step}: {step.title}
                      </h3>
                      <p className="text-sm text-foreground">
                        {step.description}
                      </p>
                      <Button
                        onClick={() => handleEdit(step.step)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <div>
              <CsvDownloadButton journeySteps={journeySteps} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
