'use client'

import { useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Project {
  id: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
}

interface CreateProjectProps {
  onSave?: (project: Project) => void
  onCancel?: () => void
  onDelete?: (id: string) => void
  onGoToProject?: (id: string) => void
  initialMode?: 'create' | 'view'
  project?: {
    id: string
    title: string
    description: string | null
    createdAt: Date
    updatedAt: Date
  }
}

export default function CreateProject({
  onSave,
  onCancel,
  onDelete,
  onGoToProject,
  initialMode = 'create',
  project,
}: CreateProjectProps) {
  const [title, setTitle] = useState(project?.title || '')
  const [description, setDescription] = useState(project?.description || '')
  const [mode, setMode] = useState<'create' | 'view'>(initialMode)

  const projectTitleMaxLength = 80
  const projectDescriptionMaxLength = 150
  const minCharacters = 5

  const isTitleValid = title.trim().length >= minCharacters
  const isDescriptionValid =
    !description.trim() || description.trim().length >= minCharacters

  const handleSave = () => {
    if (isTitleValid && isDescriptionValid) {
      const now = new Date()
      const newProject: Project = {
        id: project?.id || `project-${Date.now()}`,
        title,
        description,
        createdAt: project?.createdAt || now,
        updatedAt: now,
      }

      onSave?.(newProject)
      setMode('view')
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= projectTitleMaxLength) {
      setTitle(e.target.value)
    }
  }

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (e.target.value.length <= projectDescriptionMaxLength) {
      setDescription(e.target.value)
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Render form mode
  if (mode === 'create') {
    return (
      <Card className="mb-6 w-full">
        <CardHeader>
          {/* <CardTitle className="text-xl">Create New Project</CardTitle> */}
          {/* <CardDescription>
            Enter the details of your new service design project
          </CardDescription> */}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="project-title" className="flex items-center gap-1">
              Project Title
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-title"
              placeholder="Meals on Wheels"
              value={title}
              onChange={handleTitleChange}
              maxLength={projectTitleMaxLength}
              className={title && !isTitleValid ? 'border-destructive' : ''}
            />
            <div className="flex justify-between mt-1">
              {title && !isTitleValid && (
                <p className="text-xs text-destructive">
                  Minimum {minCharacters} characters required
                </p>
              )}
              <p
                className={`text-xs ${
                  title && !isTitleValid
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                } ml-auto`}
              >
                {title.length}/{projectTitleMaxLength} characters
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="project-description">Description (optional)</Label>
            <Textarea
              id="project-description"
              placeholder="Meals on Wheels service delivers nutritious meals to homebound individuals."
              className={`resize-none ${
                description && !isDescriptionValid ? 'border-destructive' : ''
              }`}
              rows={3}
              value={description}
              onChange={handleDescriptionChange}
              maxLength={projectDescriptionMaxLength}
            />
            <div className="flex justify-between mt-1">
              {description && !isDescriptionValid && (
                <p className="text-xs text-destructive">
                  Minimum {minCharacters} characters required if provided
                </p>
              )}
              <p
                className={`text-xs ${
                  description && !isDescriptionValid
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                } ml-auto`}
              >
                {description.length}/{projectDescriptionMaxLength} characters
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <span className="text-destructive">*</span> Required field (min.{' '}
            {minCharacters} characters)
          </div>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!isTitleValid || !isDescriptionValid}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save size={18} className="mr-2" />
              Save Project
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Render view mode (project card)
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Content area - could contain a preview or stats */}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {/* Dates in separate muted boxes */}
        <div className="flex gap-3 text-sm">
          <div className="bg-muted px-3 py-2 rounded-md">
            <p>Created on {formatDate(project?.createdAt || new Date())}</p>
          </div>
          <div className="bg-muted px-3 py-2 rounded-md">
            <p>Last modified {formatDate(project?.updatedAt || new Date())}</p>
          </div>
        </div>

        {/* Buttons on the right */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hover:bg-primary/10"
            onClick={() => project?.id && onGoToProject?.(project.id)}
          >
            Go to Project
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => project?.id && onDelete?.(project.id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
