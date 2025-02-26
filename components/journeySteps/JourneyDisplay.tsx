import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit2, Save } from 'react-feather'
import { JourneyStep, JourneyFormData } from '@/app/lib/types'
import { JourneyForm } from '@/components/journeySteps/JourneyForm'
import CsvDownloadButton from './CsvDownloadButton'

interface JourneyDisplayProps {
  journeySteps: JourneyStep[]
  error?: string
  loading?: boolean
  onSubmit: (formData: JourneyFormData) => Promise<void>
}

interface EditableStep extends JourneyStep {
  isEditing: boolean
}

interface EditingValues {
  title: string
  description: string
}

export function JourneyDisplay({
  journeySteps = [],
  error,
  loading,
  onSubmit,
}: JourneyDisplayProps) {
  const [editableSteps, setEditableSteps] = useState<EditableStep[]>([])
  const [editingValues, setEditingValues] = useState<{
    [key: number]: EditingValues
  }>({})

  useEffect(() => {
    if (journeySteps?.length) {
      setEditableSteps(
        journeySteps.map((step) => ({ ...step, isEditing: false }))
      )
    }
  }, [journeySteps])

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

  const handleInputChange = (
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

  const handleSave = (stepNumber: number) => {
    const values = editingValues[stepNumber]
    if (!values) return

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
  }

  return (
    <div className="space-y-8">
      <JourneyForm onSubmit={onSubmit} isLoading={loading || false} />

      {error && (
        <Card className="bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

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
                          handleInputChange(step.step, 'title', e.target.value)
                        }
                        className="w-full text-foreground"
                        placeholder="Step title"
                      />
                      <Textarea
                        key={`edit-desc-${step.step}`}
                        value={editingValues[step.step]?.description || ''}
                        onChange={(e) =>
                          handleInputChange(
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
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
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
          <div className="flex justify-center mt-4">
            <CsvDownloadButton journeySteps={journeySteps} />
          </div>
        </div>
      )}
    </div>
  )
}
