'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CreateProject from '@/components/CreateProject'
import { Project, ProjectDTO } from '@/app/lib/types'
import { toast } from 'react-hot-toast'
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
        toast.error('Failed to load projects')
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
      toast.success('Project created successfully')
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Failed to create project')
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
      toast.success('Project deleted successfully')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      // No need to call API here as it's already called in the component
      // Just update the local state
      setProjects(
        projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      )
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    }
  }

  const handleGoToProject = (id: string) => {
    router.push(`/servicestorymaker?projectId=${id}`)
  }

  return (
    <main className="min-h-screen pt-12 p-4">
      <div className="container mx-auto">
        {/* Flex container for title and button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {isLoaded && user?.firstName ? `${user.firstName}'s` : 'Your'}{' '}
            projects
          </h1>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2"
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

            {/* Empty state */}
            {projects.length === 0 && !showCreateForm && (
              <p className="text-center text-muted-foreground mt-4">
                No projects to display. Create a new project to get started.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
