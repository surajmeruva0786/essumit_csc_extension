export interface Branding {
  logo: string
  primaryColor: string
  name: string
}

export interface FeatureFlags {
  attendance: boolean
  assignments: boolean
  notifications: boolean
  timetable: boolean
  cgpa: boolean
  offline: boolean
  goalPlanner: boolean
}

export interface Selectors {
  attendance: string
  assignments: string
  notices: string
  results: string
}

export interface CollegeConfig {
  id: string
  name: string
  portalUrl: string
  branding: Branding
  featureFlags: FeatureFlags
  selectors: Selectors
}

export interface CollegeConfigInput {
  name: string
  portalUrl: string
  branding: Branding
  featureFlags: FeatureFlags
  selectors: Selectors
}

export const defaultColleges: CollegeConfig[] = [
  {
    id: 'mock-college-a',
    name: 'Mock College A',
    portalUrl: 'https://portal.mockcollegea.edu',
    branding: {
      logo: '/icons/icon128.png',
      primaryColor: '#2563eb',
      name: 'Mock College A',
    },
    featureFlags: {
      attendance: true,
      assignments: true,
      notifications: true,
      timetable: true,
      cgpa: true,
      offline: true,
      goalPlanner: true,
    },
    selectors: {
      attendance: '#attendance-table',
      assignments: '#assignment-list',
      notices: '#notice-board',
      results: '#result-table',
    },
  },
  {
    id: 'mock-college-b',
    name: 'Mock College B',
    portalUrl: 'https://portal.mockcollegeb.edu',
    branding: {
      logo: '/icons/icon128.png',
      primaryColor: '#059669',
      name: 'Mock College B',
    },
    featureFlags: {
      attendance: true,
      assignments: false,
      notifications: true,
      timetable: false,
      cgpa: true,
      offline: true,
      goalPlanner: true,
    },
    selectors: {
      attendance: '.attendance-section',
      assignments: '.assignments-section',
      notices: '.notices-section',
      results: '.results-section',
    },
  },
]

export function generateId(): string {
  return `college-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function createDefaultConfig(input: CollegeConfigInput): CollegeConfig {
  return {
    ...input,
    id: generateId(),
  }
}
