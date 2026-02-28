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
  bio?: string             // short bio for new hire
}

export interface SubTask {
  id: string
  title: string
  status: 'pending' | 'done'
}

export interface SupportingLink {
  label: string
  url: string
}

export type FeedbackVisibility = 'admin' | 'hr' | 'mentor' | 'employee'

export interface TaskFeedback {
  id: string
  text: string
  addedBy: string                   // display name
  addedByRole: FeedbackVisibility
  createdAt: string
  visibility: FeedbackVisibility[]  // who can see this feedback
}

export interface Task {
  id: string
  title: string
  description: string
  category: string
  estimatedTime: string
  priority?: 'low' | 'medium' | 'high'
  assignedTo: string          // employee id
  assignedBy: 'admin' | 'hr' | 'mentor'
  assignedByName: string
  status: 'pending' | 'in-progress' | 'done'
  createdAt: string
  order?: number              // display order within employee task list
  subtasks?: SubTask[]
  supportingDocs?: string[]        // document ids
  supportingLinks?: SupportingLink[]
  requiresInput?: boolean
  inputPrompt?: string
  inputValue?: string
  feedback?: TaskFeedback[]   // feedback on completed tasks
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
  fileData?: string // base64 data URL of the actual uploaded file (not persisted to localStorage)
}

export interface MentorUser {
  id: string
  name: string
  specialty: string
  department: string
  initials: string
  color: string
}

export interface Notification {
  id: string
  type: 'task_assigned' | 'employee_added' | 'employee_removed'
  message: string
  createdAt: string
  read: boolean
}

interface AppState {
  currentRole: 'admin' | 'hr' | 'mentor' | 'employee' | null
  currentUserId: string | null
  employees: Employee[]
  tasks: Task[]
  documents: Document[]
  mentors: MentorUser[]
  notifications: Notification[]
}

type Action =
  | { type: 'SET_ROLE'; payload: { role: AppState['currentRole']; userId?: string } }
  | { type: 'LOGOUT' }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'ADD_TASKS'; payload: Task[] }
  | { type: 'UPDATE_TASK_STATUS'; payload: { id: string; status: Task['status'] } }
  | { type: 'UPDATE_SUBTASK_STATUS'; payload: { taskId: string; subtaskId: string; status: SubTask['status'] } }
  | { type: 'UPDATE_TASK_INPUT'; payload: { taskId: string; inputValue: string } }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'REMOVE_TASK'; payload: { id: string } }
  | { type: 'REORDER_TASK'; payload: { id: string; direction: 'up' | 'down'; employeeId: string } }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_EMPLOYEE_RESUME'; payload: { id: string; resumeFileName: string; resumeContent: string } }
  | { type: 'REMOVE_EMPLOYEE'; payload: { id: string } }
  | { type: 'ADD_MENTOR';    payload: MentorUser }
  | { type: 'REMOVE_MENTOR'; payload: { id: string } }
  | { type: 'REMOVE_DOCUMENT'; payload: { id: string } }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'ADD_TASK_FEEDBACK'; payload: { taskId: string; feedback: TaskFeedback } }
  | { type: 'UPDATE_EMPLOYEE_BIO'; payload: { id: string; bio: string } }

// ─── Initial Data ─────────────────────────────────────────────────────────────

const COLORS = ['#2B85DC', '#4EA0EB', '#7DBCF5', '#B3D8FF', '#1F6EC4', '#1558A8']

export const initialMentors: MentorUser[] = [
  { id: 'mentor-1', name: 'Sarah Chen', specialty: 'Engineering & Architecture', department: 'Engineering', initials: 'SC', color: '#2B85DC' },
  { id: 'mentor-2', name: 'Mike Johnson', specialty: 'Sales & Business Development', department: 'Sales', initials: 'MJ', color: '#4EA0EB' },
  { id: 'mentor-3', name: 'Priya Patel', specialty: 'Design & Product', department: 'Product', initials: 'PP', color: '#7DBCF5' },
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
      mentors:  state.mentors,
      notifications: state.notifications,
      // Strip fileData (binary) before persisting to avoid bloating localStorage
      documents: state.documents.map(({ fileData: _fd, ...d }) => d),
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
    case 'ADD_EMPLOYEE': {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        type: 'employee_added',
        message: `New employee ${action.payload.name} (${action.payload.role}) added to onboarding`,
        createdAt: new Date().toISOString(),
        read: false,
      }
      return { ...state, employees: [...state.employees, action.payload], notifications: [...state.notifications, notif] }
    }
    case 'ADD_TASK': {
      const newNotifs = action.payload.assignedBy === 'admin'
        ? [...state.notifications, {
            id: `notif-${Date.now()}`,
            type: 'task_assigned' as const,
            message: `Admin assigned "${action.payload.title}"`,
            createdAt: new Date().toISOString(),
            read: false,
          }]
        : state.notifications
      return { ...state, tasks: [...state.tasks, action.payload], notifications: newNotifs }
    }
    case 'ADD_TASKS': {
      const adminTasks = action.payload.filter(t => t.assignedBy === 'admin')
      const newNotifs = adminTasks.length > 0
        ? [...state.notifications, {
            id: `notif-${Date.now()}`,
            type: 'task_assigned' as const,
            message: `Admin assigned ${adminTasks.length} new task${adminTasks.length > 1 ? 's' : ''}`,
            createdAt: new Date().toISOString(),
            read: false,
          }]
        : state.notifications
      return { ...state, tasks: [...state.tasks, ...action.payload], notifications: newNotifs }
    }
    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, status: action.payload.status } : t
        )
      }
    case 'UPDATE_SUBTASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, subtasks: (t.subtasks ?? []).map(s => s.id === action.payload.subtaskId ? { ...s, status: action.payload.status } : s) }
            : t
        )
      }
    case 'UPDATE_TASK_INPUT':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId ? { ...t, inputValue: action.payload.inputValue } : t
        )
      }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        )
      }
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload.id) }
    case 'REORDER_TASK': {
      const empTasks = state.tasks.filter(t => t.assignedTo === action.payload.employeeId)
      const sorted   = [...empTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const idx      = sorted.findIndex(t => t.id === action.payload.id)
      if (idx === -1) return state
      const swapIdx  = action.payload.direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sorted.length) return state
      // Swap order values
      const orderA = sorted[idx].order ?? idx
      const orderB = sorted[swapIdx].order ?? swapIdx
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id === sorted[idx].id)    return { ...t, order: orderB }
          if (t.id === sorted[swapIdx].id) return { ...t, order: orderA }
          return t
        }),
      }
    }
    case 'REMOVE_EMPLOYEE': {
      const removedEmp = state.employees.find(e => e.id === action.payload.id)
      const removeNotif: Notification = {
        id: `notif-${Date.now()}`,
        type: 'employee_removed',
        message: removedEmp ? `${removedEmp.name} was removed from onboarding` : 'An employee was removed',
        createdAt: new Date().toISOString(),
        read: false,
      }
      return {
        ...state,
        employees: state.employees.filter(e => e.id !== action.payload.id),
        tasks:     state.tasks.filter(t => t.assignedTo !== action.payload.id),
        notifications: [...state.notifications, removeNotif],
      }
    }
    case 'ADD_MENTOR':
      return { ...state, mentors: [...state.mentors, action.payload] }
    case 'REMOVE_MENTOR':
      return {
        ...state,
        mentors:   state.mentors.filter(m => m.id !== action.payload.id),
        // Unassign employees whose mentor was removed
        employees: state.employees.map(e =>
          e.mentorId === action.payload.id ? { ...e, mentorId: null } : e
        ),
      }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.payload, ...state.documents] }
    case 'REMOVE_DOCUMENT':
      return { ...state, documents: state.documents.filter(d => d.id !== action.payload.id) }
    case 'MARK_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }
    case 'ADD_TASK_FEEDBACK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, feedback: [...(t.feedback ?? []), action.payload.feedback] }
            : t
        ),
      }
    case 'UPDATE_EMPLOYEE_BIO':
      return {
        ...state,
        employees: state.employees.map(e =>
          e.id === action.payload.id ? { ...e, bio: action.payload.bio } : e
        ),
      }
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
    mentors: persisted.mentors ?? initialMentors,
    employees: persisted.employees ?? initialEmployees,
    tasks: persisted.tasks ?? initialTasks,
    documents: persisted.documents ?? initialDocuments,
    notifications: (persisted as any).notifications ?? [],
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
