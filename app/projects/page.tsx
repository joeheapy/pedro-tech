'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CreateProject from '@/components/CreateProject'
import { Project, ProjectDTO } from '@/app/lib/types'
import { notify } from '@/components/ui/toast-config'
import { useUser } from '@clerk/nextjs'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, isLoaded } = useUser()

  // Fetch projects when component mounts
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }

        const data = await response.json()

        // Convert API date strings to Date objects
        const formattedProjects = data.projects.map((project: ProjectDTO) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          profileId: project.profileId,
        }))

        setProjects(formattedProjects)
      } catch (error) {
        console.error('Error loading projects:', error)
        notify.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleSaveProject = async (newProject: Project) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save project')
      }

      const savedProjectDTO = (await response.json()) as ProjectDTO

      // Convert date strings to Date objects
      const savedProject: Project = {
        id: savedProjectDTO.id,
        title: savedProjectDTO.title,
        description: savedProjectDTO.description,
        createdAt: new Date(savedProjectDTO.createdAt),
        updatedAt: new Date(savedProjectDTO.updatedAt),
      }

      setProjects([...projects, savedProject])
      setShowCreateForm(false)
      notify.success('Project created successfully')
    } catch (error) {
      console.error('Error saving project:', error)
      notify.error('Failed to create project')
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      setProjects(projects.filter((project) => project.id !== id))
      notify.success('Project deleted successfully')
    } catch (error) {
      console.error('Error deleting project:', error)
      notify.error('Failed to delete project')
    }
  }

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      setProjects(
        projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      )
    } catch (error) {
      console.error('Error updating project:', error)
      notify.error('Failed to update project')
    }
  }

  const handleGoToProject = (id: string) => {
    router.push(`/servicestorymaker?projectId=${id}`)
  }

  return (
    <main className="min-h-screen pt-16 px-4 sm:px-6 pb-8">
      <div className="container mx-auto max-w-3xl">
        {/* Flex container for title and button - stacks on mobile */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-y-6 sm:gap-4 mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            {isLoaded && user?.firstName ? `${user.firstName}'s` : 'Your'}{' '}
            projects
          </h1>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} />
            New Project
          </button>
        </div>

        {/* Create project form */}
        {showCreateForm && (
          <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <CreateProject
              onSave={handleSaveProject}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">
              Loading projects...
            </span>
          </div>
        ) : (
          <>
            {/* List of projects */}
            <div className="space-y-6">
              {projects.map((project) => (
                <CreateProject
                  key={project.id}
                  initialMode="view"
                  project={project}
                  onDelete={handleDeleteProject}
                  onGoToProject={handleGoToProject}
                  onSave={handleUpdateProject}
                />
              ))}
            </div>

            {/* Empty state */}
            {projects.length === 0 && !showCreateForm && (
              <div className="text-center py-12 bg-card rounded-lg shadow-sm">
                <p className="text-muted-foreground">
                  No projects to display. Create a new project to get started.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
