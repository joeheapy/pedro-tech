'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CreateProject from '@/components/createProject'

interface Project {
  id: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  const handleSaveProject = (newProject: Project) => {
    // Check if this project already exists and update it, or add as new
    const existingIndex = projects.findIndex((p) => p.id === newProject.id)

    if (existingIndex >= 0) {
      // Update existing project
      const updatedProjects = [...projects]
      updatedProjects[existingIndex] = newProject
      setProjects(updatedProjects)
    } else {
      // Add new project
      setProjects([...projects, newProject])
    }

    setShowCreateForm(false)
  }

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id))
  }

  const handleGoToProject = (id: string) => {
    router.push(`/servicestorymaker?projectId=${id}`)
  }

  return (
    <main className="min-h-screen pt-20 p-4">
      <div className="container mx-auto">
        {/* Flex container for title and button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {/* Create project form */}
        {showCreateForm && (
          <CreateProject
            onSave={handleSaveProject}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* List of projects */}
        {projects.map((project) => (
          <CreateProject
            key={project.id}
            initialMode="view"
            project={project}
            onDelete={handleDeleteProject}
            onGoToProject={handleGoToProject}
          />
        ))}

        {/* Empty state */}
        {projects.length === 0 && !showCreateForm && (
          <p className="text-center text-muted-foreground mt-4">
            No projects to display. Click New Project to create one.
          </p>
        )}
      </div>
    </main>
  )
}
