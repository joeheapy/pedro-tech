export const OPEN_TOKEN_BALANCE = 100000

export const NUMBER_OF_JOURNEY_STEPS = 10

export const ITEMS_PER_ROW = 3
export const NUMBER_OF_PERSONA = 6
export const NUMBER_OF_FEATURES = 30

//export const OPENAI_MODEL = 'gpt-3.5-turbo-1106' as const
export const OPENAI_MODEL = 'gpt-4-turbo' as const
//export const OPENAI_MODEL = 'gpt-4o-mini' as const

export const OPENAI_TEMP = 0.7
export const OPENAI_MAX_TOKENS = 4000

export const OPENAI_TIMEOUT = 60000

export interface Project {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  profileId?: string
}

export interface ProjectDTO {
  id: string
  title: string
  description: string | null
  createdAt: string
  updatedAt: string
  profileId: string
}

export interface Tariffs {
  journeySteps: number
  customerPains: number
  businessPains: number
  personas: number
  features: number
  enablers: number
}

export const TARIFFS: Tariffs = {
  journeySteps: 1,
  customerPains: 5,
  businessPains: 10,
  personas: 15,
  features: 15,
  enablers: 15,
}

export interface UserTokens {
  balance: number
}

export interface TokenDeduction {
  amount: number
  reason: 'journeySteps' | 'customerPains' | 'businessPains'
}

export interface Tokenstate {
  balance: number
  isLoading: boolean
  error: string | null
}

// Form data structure
export interface JourneyFormData {
  business_proposition: string
  customer_scenario: string
  target_customers: string
  persona_name: string
}

// Journey step structure (OpenAI response)
export interface JourneyStep {
  step: number
  title: string
  description: string
}

// Database record structure (matching Prisma schema)
export interface JourneyStepsRecord {
  id: string
  businessProposition: string
  customerScenario: string
  targetCustomers: string
  personaName: string
  journeyData: JourneyStep[]
  projectId: string
  createdAt: string
  updatedAt: string
}

// Data structure for persona form
export interface PersonaData {
  personaName: string
  personaAge: number
  personaGroupName: string
  personaGroupDescription: string
  personaScenario: string
  personaQuote: string
  personaGender: string
}

// Database record structure for a customer pain point
export interface CustomerPainPointData {
  [key: `customer-pain-${number}`]: string
}

// This represents the full array of pain points for a project
export interface CustomerPainPointsData {
  painPoints: CustomerPainPointData[]
}

// Structure of a single customer pain record from the database
export interface CustomerPainRecord {
  id: string
  painPoints: CustomerPainPointData[]
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface BusinessPainPointData {
  [key: `business-pain-${number}`]: string
}

export interface BusinessPainPointsData {
  painPoints: BusinessPainPointData[]
}

export interface BusinessPainRecord {
  id: string
  painPoints: BusinessPainPointData[]
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface FeatureData {
  featureName: string
  featureDescription: string
}

export interface ServiceFeature {
  featureName: string
  featureDescription: string
}

export interface ServiceFeaturesData {
  features: ServiceFeature[]
}

export interface EnablerData {
  enablerName: string
  enablerDescription: string
}
