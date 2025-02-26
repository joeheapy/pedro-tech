export const OPEN_TOKEN_BALANCE = 1000;

export const NUMBER_OF_JOURNEY_STEPS = 10;

export const ITEMS_PER_ROW = 3;
export const NUMBER_OF_PERSONA = 6;
export const NUMBER_OF_FEATURES = 30;

//export const OPENAI_MODEL = 'gpt-3.5-turbo-1106' as const
export const OPENAI_MODEL = "gpt-4-turbo" as const;
//export const OPENAI_MODEL = 'gpt-4o-mini' as const

export const OPENAI_TEMP = 0.7;
export const OPENAI_MAX_TOKENS = 4000;

export const OPENAI_TIMEOUT = 60000;

export interface Tariffs {
  journeySteps: number;
  customerPains: number;
  businessPains: number;
  personas: number;
  features: number;
  enablers: number;
}

export const TARIFFS: Tariffs = {
  journeySteps: 1,
  customerPains: 5,
  businessPains: 10,
  personas: 15,
  features: 15,
  enablers: 15,
};

export interface UserTokens {
  balance: number;
}

export interface TokenDeduction {
  amount: number;
  reason: "journeySteps" | "customerPains" | "businessPains";
}

export interface Tokenstate {
  balance: number;
  isLoading: boolean;
  error: string | null;
}

export interface JourneyFormData {
  target_customers: string;
  persona_name: string;
  business_proposition: string;
  customer_scenario: string;
}

export interface JourneyStep {
  step: number;
  title: string;
  description: string;
  responseTitle: string;
}

export interface CustomerPainPointData {
  [key: `customer-pain-${number}`]: string;
}

export interface BusinessPainPointData {
  [key: `business-pain-${number}`]: string;
}

export interface PersonaData {
  personaName: string;
  personaAge: number;
  personaGroupName: string;
  personaGroupDescription: string;
  personaScenario: string;
  personaQuote: string;
  personaGender: string;
}

export interface FeatureData {
  featureName: string;
  featureDescription: string;
}

export interface EnablerData {
  enablerName: string;
  enablerDescription: string;
}
