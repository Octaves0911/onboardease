import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Employee {
  id: string
  name: string
  role: string
  email: string
  team: string
  mentorId: string | null
  startDate: string
  progress: number
  day: number
  totalDays: number
  status: 'onboarding' | 'completed'
  risk: 'low' | 'high'
  initials: string
  color: string
  resumeFileName?: string
  resumeContent?: string   // simulated extracted text
}

export interface Task {
  id: string
  title: string
  description: string
  category: string
  estimatedTime: string
  assignedTo: string          // employee id
  assignedBy: 'admin' | 'hr' | 'mentor'
  assignedByName: string
  status: 'pending' | 'in-progress' | 'done'
  createdAt: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: string
  status: 'processed' | 'processing'
  uploadedBy: string
  taskCount?: number
  date: string
  content: string   // simulated extracted content for AI
}

export interface MentorUser {
  id: string
  name: string
  specialty: string
  department: string
  initials: string
  color: string
}

interface AppState {
  currentRole: 'admin' | 'hr' | 'mentor' | 'employee' | null
  currentUserId: string | null
  employees: Employee[]
  tasks: Task[]
  documents: Document[]
  mentors: MentorUser[]
}

type Action =
  | { type: 'SET_ROLE'; payload: { role: AppState['currentRole']; userId?: string } }
  | { type: 'LOGOUT' }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'ADD_TASKS'; payload: Task[] }
  | { type: 'UPDATE_TASK_STATUS'; payload: { id: string; status: Task['status'] } }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_EMPLOYEE_RESUME'; payload: { id: string; resumeFileName: string; resumeContent: string } }

// ─── Initial Data ─────────────────────────────────────────────────────────────

const COLORS = ['#8B4513', '#A0724A', '#C49A6C', '#D2B48C', '#7A3C10', '#6B3410']

export const initialMentors: MentorUser[] = [
  { id: 'mentor-1', name: 'Sarah Chen', specialty: 'Engineering & Architecture', department: 'Engineering', initials: 'SC', color: '#8B4513' },
  { id: 'mentor-2', name: 'Mike Johnson', specialty: 'Sales & Business Development', department: 'Sales', initials: 'MJ', color: '#A0724A' },
  { id: 'mentor-3', name: 'Priya Patel', specialty: 'Design & Product', department: 'Product', initials: 'PP', color: '#C49A6C' },
]

const initialEmployees: Employee[] = [
  { id: 'emp-1', name: 'Jordan Lee', role: 'Software Engineer', email: 'jordan@company.com', team: 'Engineering', mentorId: 'mentor-1', startDate: 'Feb 24, 2026', progress: 22, day: 2, totalDays: 30, status: 'onboarding', risk: 'low', initials: 'JL', color: COLORS[0] },
  { id: 'emp-2', name: 'Priya Kapoor', role: 'Product Manager', email: 'priya.k@company.com', team: 'Product', mentorId: 'mentor-3', startDate: 'Feb 20, 2026', progress: 54, day: 6, totalDays: 30, status: 'onboarding', risk: 'low', initials: 'PK', color: COLORS[1] },
  { id: 'emp-3', name: 'Marcus Stone', role: 'Sales Representative', email: 'marcus@company.com', team: 'Sales', mentorId: 'mentor-2', startDate: 'Feb 17, 2026', progress: 31, day: 9, totalDays: 21, status: 'onboarding', risk: 'high', initials: 'MS', color: COLORS[2] },
  { id: 'emp-4', name: 'Aiko Tanaka', role: 'UX Designer', email: 'aiko@company.com', team: 'Design', mentorId: 'mentor-3', startDate: 'Feb 10, 2026', progress: 78, day: 16, totalDays: 21, status: 'onboarding', risk: 'low', initials: 'AT', color: COLORS[3] },
]

const initialDocuments: Document[] = [
  { id: 'doc-1', name: 'Employee Handbook v3.2', type: 'PDF', size: '2.4 MB', status: 'processed', uploadedBy: 'admin', taskCount: 32, date: 'Feb 20', content: 'Company values: innovation, collaboration, integrity. Communication policy: use Slack for quick messages, email for formal comms. Work hours: flexible 9-5. Benefits: health, dental, vision, 401k. PTO: 15 days/year. Code of conduct: respect all team members. Performance reviews: quarterly. Promotion cycle: annual. Remote work: hybrid 3 days in office.' },
  { id: 'doc-2', name: 'IT Security Policy', type: 'PDF', size: '1.1 MB', status: 'processed', uploadedBy: 'hr', taskCount: 15, date: 'Feb 18', content: 'All employees must complete security training within first week. MFA required on all accounts. Password policy: minimum 12 characters. VPN required for remote work. Data classification: public, internal, confidential, restricted. Incident reporting: contact security@company.com. No personal devices for company data. Regular security audits. Phishing awareness training required annually.' },
  { id: 'doc-3', name: 'Engineering Onboarding Guide', type: 'PDF', size: '3.2 MB', status: 'processed', uploadedBy: 'admin', taskCount: 28, date: 'Feb 15', content: 'Tech stack: React, TypeScript, Node.js, PostgreSQL, AWS. Repository: GitHub - clone main repo, set up dev environment. Code review: all PRs require 2 approvals. Testing: unit tests required, 80% coverage. CI/CD: automated pipeline with GitHub Actions. Deployment: staging → production. Architecture: microservices. Documentation: all APIs must be documented. Pair programming: first 2 weeks with buddy. Sprint cycle: 2 weeks, daily standups at 10am.' },
  { id: 'doc-4', name: 'Sales Playbook 2026', type: 'PDF', size: '1.8 MB', status: 'processed', uploadedBy: 'admin', taskCount: 20, date: 'Feb 12', content: 'Sales process: prospect, qualify, demo, proposal, close. CRM: Salesforce - mandatory for all deals. Target: $50k quota per month. Product knowledge: complete all 8 product certification modules. Discovery calls: BANT framework. Demo script: follow standard demo deck. Objection handling: pricing, competition, timing. Pipeline management: weekly review with manager. Commission structure: 8% on closed deals. Territory assignment: by region.' },
]

const initialTasks: Task[] = [
  { id: 'task-init-1', title: 'Complete company overview module', description: 'Watch company overview video and complete knowledge check', category: 'Learning', estimatedTime: '20 min', assignedTo: 'emp-1', assignedBy: 'hr', assignedByName: 'HR Team', status: 'done', createdAt: '2026-02-24' },
  { id: 'task-init-2', title: 'Set up Slack workspace', description: 'Install Slack, join all required channels, update profile', category: 'Tools', estimatedTime: '5 min', assignedTo: 'emp-1', assignedBy: 'admin', assignedByName: 'Admin', status: 'done', createdAt: '2026-02-24' },
  { id: 'task-init-3', title: 'Meet your buddy Sarah Chen', description: 'Schedule and complete first 1:1 with your assigned mentor', category: 'People', estimatedTime: '30 min', assignedTo: 'emp-1', assignedBy: 'admin', assignedByName: 'Admin', status: 'in-progress', createdAt: '2026-02-24' },
  { id: 'task-init-4', title: 'Review employee handbook', description: 'Read all sections and acknowledge receipt', category: 'Compliance', estimatedTime: '45 min', assignedTo: 'emp-1', assignedBy: 'hr', assignedByName: 'HR Team', status: 'pending', createdAt: '2026-02-24' },
  { id: 'task-init-5', title: 'Complete IT security training', description: 'Finish the mandatory cybersecurity awareness course', category: 'Compliance', estimatedTime: '30 min', assignedTo: 'emp-2', assignedBy: 'hr', assignedByName: 'HR Team', status: 'done', createdAt: '2026-02-20' },
  { id: 'task-init-6', title: 'Set up product management tools', description: 'Access Jira, Confluence, and Figma with required permissions', category: 'Tools', estimatedTime: '20 min', assignedTo: 'emp-2', assignedBy: 'admin', assignedByName: 'Admin', status: 'done', createdAt: '2026-02-20' },
  { id: 'task-init-7', title: 'Salesforce CRM walkthrough', description: 'Complete CRM tour and enter first 5 mock deals', category: 'Tools', estimatedTime: '60 min', assignedTo: 'emp-3', assignedBy: 'mentor', assignedByName: 'Mike Johnson', status: 'pending', createdAt: '2026-02-17' },
]

// ─── Load/Save from localStorage ─────────────────────────────────────────────

const STORAGE_KEY = 'onboardease_state'

function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      employees: state.employees,
      tasks: state.tasks,
      documents: state.documents,
    }))
  } catch {}
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, currentRole: action.payload.role, currentUserId: action.payload.userId || null }
    case 'LOGOUT':
      return { ...state, currentRole: null, currentUserId: null }
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'ADD_TASKS':
      return { ...state, tasks: [...state.tasks, ...action.payload] }
    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, status: action.payload.status } : t
        )
      }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.payload, ...state.documents] }
    case 'UPDATE_EMPLOYEE_RESUME':
      return {
        ...state,
        employees: state.employees.map(e =>
          e.id === action.payload.id
            ? { ...e, resumeFileName: action.payload.resumeFileName, resumeContent: action.payload.resumeContent }
            : e
        )
      }
    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadState()
  const initialState: AppState = {
    currentRole: null,
    currentUserId: null,
    mentors: initialMentors,
    employees: persisted.employees ?? initialEmployees,
    tasks: persisted.tasks ?? initialTasks,
    documents: persisted.documents ?? initialDocuments,
  }
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => { saveState(state) }, [state.employees, state.tasks, state.documents])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
