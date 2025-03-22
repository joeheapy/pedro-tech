'use client'

import { useState } from 'react'
import { Save, Trash2, ArrowRight, Pencil } from 'lucide-react'
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
import { toast } from 'react-hot-toast'

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
  initialMode?: 'create' | 'view' | 'edit' // Added 'edit' mode
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
  const [mode, setMode] = useState<'create' | 'view' | 'edit'>(initialMode)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // New method to handle saving edits
  const handleSaveEdit = async () => {
    if (!isTitleValid || !isDescriptionValid || !project?.id) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update project')
      }

      const updatedProject = await response.json()

      // Convert API response to Project format
      const formattedProject: Project = {
        id: updatedProject.id,
        title: updatedProject.title,
        description: updatedProject.description || '',
        createdAt: new Date(updatedProject.createdAt),
        updatedAt: new Date(updatedProject.updatedAt),
      }

      onSave?.(formattedProject)
      setMode('view')
      toast.success('Project updated successfully')
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    } finally {
      setIsSubmitting(false)
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

  // Enter edit mode
  const handleEdit = () => {
    setTitle(project?.title || '')
    setDescription(project?.description || '')
    setMode('edit')
  }

  // Render edit mode (similar to create mode but with different actions)
  if (mode === 'edit') {
    return (
      <Card className="mb-6 w-full">
        <CardHeader>
          <CardTitle className="text-xl">Edit Project</CardTitle>
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
            <Button variant="ghost" onClick={() => setMode('view')}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!isTitleValid || !isDescriptionValid || isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Render create mode (unchanged)
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

  // Render view mode (project card) - add Edit button
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground font-bold">
          {title}
        </CardTitle>
        <CardDescription className="mt-2 text-xl text-foreground/60">
          {description}
        </CardDescription>
      </CardHeader>
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
          {/* Edit button */}
          <Button
            variant="outline"
            onClick={handleEdit}
            className="text-base last:hover:bg-primary/10"
          >
            <Pencil size={18} className="mr-2" />
            Edit
          </Button>

          {/* Go to project button */}
          <Button
            className="bg-primary text-base text-primary-foreground hover:bg-primary/90"
            onClick={() => project?.id && onGoToProject?.(project.id)}
          >
            <ArrowRight size={18} className="mr-2" />
            Go to Project
          </Button>

          {/* Delete button */}
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
