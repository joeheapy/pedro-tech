'use client'

import { useState, JSX, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { JourneyContainer } from '@/components/journeySteps/JourneyContainer'
import { CustomerPainsContainer } from '@/components/customerPains/CustomerPainsContainer'
import { BusinessPainsContainer } from '@/components/businessPains/BusinessPainsContainer'
import { PersonasContainer } from '@/components/personas/PersonasContainer'
import { FeaturesContainer } from '@/components/features/FeaturesContainer'
import { EnablersContainer } from '@/components/enablers/EnablersContainer'
import { TokenControls } from '@/components/ui/tokenControls'
import { useSubscription } from '@/app/hooks/useSubscription'
import {
  JourneyStep,
  CustomerPainPointData,
  BusinessPainPointData,
  PersonaData,
  TARIFFS,
} from '@/app/lib/types'
import { useTokens } from '@/app/utils/useTokens'
import { Loader2, ArrowLeft } from 'lucide-react'
import UpgradeYourAccess from '@/components/upgradeYourAccess'
import { toast } from 'react-hot-toast'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Interface for project details
interface Project {
  id: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export default function ServiceStoryMakerDashboard(): JSX.Element {
  const { Tokens, deductTokens, resetTokens } = useTokens()
  const { isSubscribed, isLoading, redirectToSubscribe } = useSubscription()
  const searchParams = useSearchParams()

  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([])
  const [customerPains, setCustomerPains] = useState<CustomerPainPointData[]>(
    []
  )
  const [businessPains, setBusinessPains] = useState<BusinessPainPointData[]>(
    []
  )
  const [personaData, setPersonaData] = useState<PersonaData[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loadingProject, setLoadingProject] = useState<boolean>(false)

  // Get project ID from URL query parameters
  const projectId = searchParams.get('projectId')

  // Fetch project details if there's a project ID
  useEffect(() => {
    async function fetchProjectDetails() {
      if (!projectId || !isSubscribed) return

      try {
        setLoadingProject(true)
        const response = await fetch(`/api/projects/${projectId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch project details')
        }

        const projectData = await response.json()
        setCurrentProject({
          ...projectData,
          createdAt: new Date(projectData.createdAt),
          updatedAt: new Date(projectData.updatedAt),
        })
      } catch (error) {
        console.error('Error fetching project:', error)
        toast.error('Failed to load project details')
      } finally {
        setLoadingProject(false)
      }
    }

    fetchProjectDetails()
  }, [projectId, isSubscribed])

  const handleJourneyGenerated = (steps: JourneyStep[]): void => {
    try {
      deductTokens(TARIFFS.journeySteps)
      setJourneySteps(steps)
    } catch (error) {
      console.error('Failed to generate journey:', error)
    }
  }

  const handleCustomerPainPointsGenerated = (
    pains: CustomerPainPointData[]
  ): void => {
    try {
      console.log('Received customer pains:', pains)
      setCustomerPains(pains)
      deductTokens(TARIFFS.customerPains)
    } catch (error) {
      console.error('Failed to handle customer pains:', error)
    }
  }

  const handleBusinessPainPointsGenerated = (
    pains: BusinessPainPointData[]
  ): void => {
    try {
      console.log('Received business pains:', pains)
      setBusinessPains(pains)
      deductTokens(TARIFFS.businessPains)
    } catch (error) {
      console.error('Failed to handle business pains:', error)
    }
  }

  const handlePersonasGenerated = (personas: PersonaData[]): void => {
    try {
      setPersonaData(personas) // Store personas in state
      deductTokens(TARIFFS.personas)
    } catch (error) {
      console.error('Failed to handle personas:', error)
    }
  }

  const handleFeaturesGenerated = (tariff: number): void => {
    try {
      deductTokens(tariff)
    } catch (error) {
      console.error('Failed to deduct Tokens:', error)
    }
  }

  const handleEnablersGenerated = (tariff: number): void => {
    try {
      deductTokens(tariff)
    } catch (error) {
      console.error('Failed to deduct Tokens:', error)
    }
  }

  if (isLoading || (projectId && loadingProject)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <>
      <div className="sr-only">
        <TokenControls
          Tokens={Tokens.balance}
          error={Tokens.error}
          onReset={resetTokens}
        />
      </div>
      <main className="min-h-screen">
        <div className="container mx-auto space-y-8 py-8">
          {/* Project details section for subscribed users */}
          {isSubscribed && currentProject && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Link href="/projects">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ArrowLeft size={16} />
                    Back to Projects
                  </Button>
                </Link>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {currentProject.title}
                  </CardTitle>
                  {currentProject.description && (
                    <CardDescription className="mt-2 text-base">
                      {currentProject.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Journey container is accessible to everyone */}
          <JourneyContainer
            journeySteps={journeySteps}
            onJourneyGenerated={handleJourneyGenerated}
          />

          {/* Protected components or upgrade prompt */}
          {isSubscribed ? (
            <>
              <PersonasContainer
                journeySteps={journeySteps}
                onPersonasGenerated={handlePersonasGenerated}
              />
              <CustomerPainsContainer
                journeySteps={journeySteps}
                onCustomerPainPointsGenerated={
                  handleCustomerPainPointsGenerated
                }
              />
              <BusinessPainsContainer
                journeySteps={journeySteps}
                onBusinessPainPointsGenerated={
                  handleBusinessPainPointsGenerated
                }
              />
              <FeaturesContainer
                journeySteps={journeySteps}
                customerPains={customerPains}
                businessPains={businessPains}
                personaData={personaData}
                onFeaturesGenerated={() =>
                  handleFeaturesGenerated(TARIFFS.features)
                }
              />
              <EnablersContainer
                journeySteps={journeySteps}
                customerPains={customerPains}
                businessPains={businessPains}
                personaData={personaData}
                onEnablersGenerated={() =>
                  handleEnablersGenerated(TARIFFS.features)
                }
              />
            </>
          ) : (
            <UpgradeYourAccess redirectToSubscribe={redirectToSubscribe} />
          )}
        </div>
      </main>
    </>
  )
}
