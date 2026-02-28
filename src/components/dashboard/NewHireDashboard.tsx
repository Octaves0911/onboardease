import { useState } from 'react'
import {
  CheckCircle, Clock, BookOpen, Users, Calendar, Link2,
  Flame, Trophy, Bell, FileText, ChevronRight, ChevronDown,
  MessageSquare, AlertCircle, Star, Settings as SettingsIcon,
  ExternalLink, Tag, AlignLeft, ListChecks, Paperclip
} from 'lucide-react'
import { useApp, initialMentors } from '../../context/AppContext'
import type { Task } from '../../context/AppContext'
import AdminChatWidget from '../chat/AdminChatWidget'
import AIChatWidget from '../common/AIChatWidget'

// ─── Static resources ──────────────────────────────────────────────────────────
const staticResources = [
  { icon: <FileText size={16} />, label: 'Employee Handbook',   type: 'PDF'  },
  { icon: <BookOpen size={16} />, label: 'Tech Stack Overview', type: 'Doc'  },
  { icon: <Users size={16} />,    label: 'Org Chart',           type: 'Link' },
  { icon: <Calendar size={16} />, label: 'Team Calendar',       type: 'Link' },
  { icon: <Link2 size={16} />,    label: 'Tool Access Guide',   type: 'PDF'  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const assignedByLabel = (by: string, name: string) => {
  if (by === 'mentor') return `🤝 ${name}`
  if (by === 'hr')     return `👔 ${name}`
  return `🔑 ${name}`
}

const priorityBadge: Record<string, string> = {
  high:   'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-orange-100 text-orange-700 border border-orange-200',
  low:    'bg-green-100 text-green-700 border border-green-200',
}

const typeBadge: Record<string, string> = {
  '1:1':      'bg-blue-100 text-blue-700',
  'check-in': 'bg-teal-100 text-teal-700',
  'review':   'bg-purple-100 text-purple-700',
}

function today() {
  return new Date().toISOString().split('T')[0]
}

// ─── Task Detail Card (expanded task view in Tasks tab) ────────────────────────
function TaskDetailCard({ task, onToggleStatus }: { task: Task; onToggleStatus: () => void }) {
  const { state } = useApp()
  const [inputVal, setInputVal] = useState(task.inputValue ?? '')
  const { dispatch } = useApp()

  const supportingDocs = (task.supportingDocs ?? [])
    .map(id => state.documents.find(d => d.id === id))
    .filter(Boolean) as typeof state.documents

  const saveInput = () => {
    dispatch({ type: 'UPDATE_TASK_INPUT', payload: { taskId: task.id, inputValue: inputVal } })
  }

  return (
    <div className="border-t border-brown-100 px-4 pb-4 pt-3 bg-gradient-to-b from-brown-50/40 to-white space-y-4">
      {/* Description */}
      <div>
        <p className="text-xs font-semibold text-brown-500 uppercase tracking-wide mb-1 flex items-center gap-1">
          <AlignLeft size={11} /> Description
        </p>
        <p className="text-sm text-brown-700 leading-relaxed">{task.description}</p>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-xs bg-brown-100 text-brown-700 px-2 py-1 rounded-lg">
          <Clock size={11} /> {task.estimatedTime}
        </span>
        <span className="flex items-center gap-1 text-xs bg-brown-100 text-brown-700 px-2 py-1 rounded-lg">
          <Tag size={11} /> {task.category}
        </span>
        {task.priority && (
          <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${priorityBadge[task.priority] ?? ''}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
        )}
        <span className="text-xs bg-brown-100 text-brown-600 px-2 py-1 rounded-lg">
          {assignedByLabel(task.assignedBy, task.assignedByName)}
        </span>
      </div>

      {/* Subtasks */}
      {(task.subtasks ?? []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-brown-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <ListChecks size={11} /> Subtasks
          </p>
          <div className="space-y-1.5">
            {task.subtasks!.map(st => (
              <div key={st.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${st.status === 'done' ? 'bg-green-500 border-green-500' : 'border-brown-300'}`}>
                  {st.status === 'done' && <CheckCircle size={10} className="text-white" />}
                </div>
                <span className={`text-sm ${st.status === 'done' ? 'line-through text-brown-400' : 'text-brown-700'}`}>{st.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supporting Docs */}
      {supportingDocs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-brown-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Paperclip size={11} /> Supporting Documents
          </p>
          <div className="space-y-1">
            {supportingDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-brown-100">
                <FileText size={13} className="text-red-500 flex-shrink-0" />
                <span className="text-xs text-brown-700 flex-1 truncate">{doc.name}</span>
                <span className="text-[10px] text-brown-400">{doc.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supporting Links */}
      {(task.supportingLinks ?? []).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-brown-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <ExternalLink size={11} /> Supporting Links
          </p>
          <div className="space-y-1">
            {task.supportingLinks!.map((lnk, i) => (
              <a key={i} href={lnk.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline">
                <Link2 size={11} className="flex-shrink-0" />
                {lnk.label || lnk.url}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Employee Input */}
      {task.requiresInput && (
        <div>
          <p className="text-xs font-semibold text-brown-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <MessageSquare size={11} /> Response Required
          </p>
          <p className="text-xs text-brown-600 mb-2 italic">"{task.inputPrompt}"</p>
          <textarea
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onBlur={saveInput}
            rows={3}
            placeholder="Type your response here…"
            className="w-full border border-brown-200 rounded-xl px-3 py-2 text-sm text-brown-800 focus:outline-none focus:ring-2 focus:ring-brown-400 resize-none bg-white"
          />
        </div>
      )}

      {/* Feedback */}
      {(task.feedback ?? []).filter(fb => fb.visibility.includes('employee')).length > 0 && (
        <div>
          <p className="text-xs font-semibold text-brown-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Star size={11} /> Feedback
          </p>
          <div className="space-y-1.5">
            {task.feedback!.filter(fb => fb.visibility.includes('employee')).map(fb => (
              <div key={fb.id} className="bg-green-50 border border-green-100 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-green-700">{fb.addedBy}</span>
                  <span className="text-xs text-brown-400 ml-auto">{new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p className="text-xs text-brown-700">{fb.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status toggle CTA */}
      <button
        onClick={onToggleStatus}
        className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
          task.status === 'done'
            ? 'bg-brown-100 text-brown-600 hover:bg-brown-200'
            : task.status === 'in-progress'
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-brown-500 text-white hover:bg-brown-600'
        }`}
      >
        {task.status === 'done' ? 'Mark as Pending' : task.status === 'in-progress' ? 'Mark as Done ✓' : 'Start Task →'}
      </button>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface Props {
  activePage?: string
  onNavigate?: (page: string) => void
}

export default function NewHireDashboard({ activePage = 'dashboard', onNavigate }: Props) {
  const { state, dispatch } = useApp()

  const employee   = state.employees.find(e => e.id === state.currentUserId) ?? state.employees[0]
  const myTasks    = state.tasks.filter(t => t.assignedTo === employee?.id)
  const mentor     = [...initialMentors, ...state.mentors].find(m => m.id === employee?.mentorId)

  // Upcoming meetings for this employee from global state
  const upcomingMeetings = state.meetings
    .filter(m => m.menteeId === employee?.id && m.date >= today())
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [taskTab, setTaskTab] = useState<'all' | 'pending' | 'done'>('all')

  const doneCount  = myTasks.filter(t => t.status === 'done').length
  const progress   = myTasks.length > 0 ? Math.round((doneCount / myTasks.length) * 100) : 0

  const toggleTaskStatus = (taskId: string, currentStatus: string) => {
    const next = currentStatus === 'done' ? 'pending' : currentStatus === 'pending' ? 'in-progress' : 'done'
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { id: taskId, status: next as Task['status'] } })
  }

  const toggleExpand = (taskId: string) =>
    setExpandedTaskId(prev => prev === taskId ? null : taskId)

  if (!employee) return (
    <div className="min-h-screen flex items-center justify-center text-brown-500">
      <p>No employee profile found. Please log in again.</p>
    </div>
  )

  // ── TASKS VIEW ──────────────────────────────────────────────────────────────
  if (activePage === 'tasks') {
    const filtered = myTasks.filter(t => {
      if (taskTab === 'all')     return true
      if (taskTab === 'pending') return t.status !== 'done'
      return t.status === 'done'
    })

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <h2 className="text-xl font-bold text-brown-900 flex items-center gap-2">
          <ListChecks size={22} className="text-brown-600" /> My Tasks
        </h2>

        {/* Tabs */}
        <div className="flex gap-1 bg-brown-50 rounded-lg p-1 border border-brown-200 w-fit">
          {(['all', 'pending', 'done'] as const).map(tab => (
            <button key={tab} onClick={() => setTaskTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${taskTab === tab ? 'bg-brown-500 text-white' : 'text-brown-600 hover:bg-brown-100'}`}>
              {tab}{tab === 'all' ? ` (${myTasks.length})` : tab === 'done' ? ` (${doneCount})` : ` (${myTasks.filter(t => t.status !== 'done').length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card text-center py-12 text-brown-400">
            <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">
              {taskTab === 'done' ? 'No completed tasks yet' : taskTab === 'pending' ? 'No pending tasks!' : 'No tasks assigned yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(task => (
              <div key={task.id} className={`card p-0 overflow-hidden border-2 transition-all duration-200 ${
                expandedTaskId === task.id ? 'border-brown-400 shadow-md' :
                task.status === 'done' ? 'border-green-200' :
                task.status === 'in-progress' ? 'border-brown-300' : 'border-brown-100'
              }`}>
                {/* Task header row — click to expand */}
                <div
                  onClick={() => toggleExpand(task.id)}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-brown-50/50 transition-colors"
                >
                  {/* Status circle */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    task.status === 'done' ? 'bg-green-500 border-green-500' :
                    task.status === 'in-progress' ? 'border-brown-500' : 'border-brown-300'
                  }`}>
                    {task.status === 'done' && <CheckCircle size={12} className="text-white" />}
                    {task.status === 'in-progress' && <div className="w-2 h-2 bg-brown-500 rounded-full" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-brown-400' : 'text-brown-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-brown-400"><Clock size={10} className="inline mr-0.5" />{task.estimatedTime}</span>
                      <span className="badge-brown py-0.5 text-xs">{task.category}</span>
                      {task.priority && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${priorityBadge[task.priority] ?? ''}`}>
                          {task.priority}
                        </span>
                      )}
                      {(task.subtasks ?? []).length > 0 && (
                        <span className="text-xs text-brown-400">{task.subtasks!.filter(s => s.status === 'done').length}/{task.subtasks!.length} subtasks</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.status === 'done'        && <span className="badge-green text-xs py-1">Done</span>}
                    {task.status === 'in-progress' && <span className="badge-orange text-xs py-1">In Progress</span>}
                    {task.status === 'pending'     && <span className="text-xs text-brown-400 font-medium">Pending</span>}
                    {expandedTaskId === task.id
                      ? <ChevronDown size={16} className="text-brown-500" />
                      : <ChevronRight size={16} className="text-brown-400" />
                    }
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedTaskId === task.id && (
                  <TaskDetailCard task={task} onToggleStatus={() => toggleTaskStatus(task.id, task.status)} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── BUDDY VIEW ──────────────────────────────────────────────────────────────
  if (activePage === 'buddy') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <h2 className="text-xl font-bold text-brown-900 flex items-center gap-2">
          <Users size={22} className="text-brown-600" /> My Buddy / Mentor
        </h2>

        {mentor ? (
          <>
            <div className="card space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{ background: mentor.color }}>{mentor.initials}</div>
                <div>
                  <h3 className="font-bold text-brown-900 text-lg">{mentor.name}</h3>
                  <p className="text-sm text-brown-500">{mentor.specialty}</p>
                  <p className="text-xs text-brown-400">{mentor.department} Department</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-green-600 font-medium">Available</span>
                  </div>
                </div>
              </div>
              <div className="bg-brown-50 rounded-xl p-3 border border-brown-100">
                <p className="text-xs text-brown-600">
                  <span className="font-semibold">Mentor tasks assigned to you:</span>{' '}
                  {myTasks.filter(t => t.assignedBy === 'mentor').length}
                </p>
              </div>
              <button
                onClick={() => onNavigate?.('chat')}
                className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare size={15} /> Message {mentor.name.split(' ')[0]}
              </button>
            </div>

            {/* Upcoming Meetings */}
            <div className="card space-y-3">
              <h3 className="font-bold text-brown-900 flex items-center gap-2">
                <Calendar size={16} className="text-teal-600" /> Upcoming Meetings
              </h3>
              {upcomingMeetings.length === 0 ? (
                <p className="text-xs text-brown-400 text-center py-4">No upcoming meetings scheduled by your mentor yet.</p>
              ) : (
                upcomingMeetings.map(mtg => (
                  <div key={mtg.id} className="flex items-center gap-3 p-3 rounded-xl bg-brown-50 border border-brown-100">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brown-900 truncate">{mtg.title}</p>
                      <p className="text-xs text-brown-500">{new Date(mtg.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {mtg.time}</p>
                      {mtg.notes && <p className="text-xs text-brown-400 mt-0.5 truncate">{mtg.notes}</p>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${typeBadge[mtg.type] ?? 'bg-brown-100 text-brown-600'}`}>
                      {mtg.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="card text-center py-12 text-brown-400">
            <Users size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No mentor assigned yet</p>
            <p className="text-sm mt-1">Contact HR or Admin to get a mentor assigned to you.</p>
          </div>
        )}
      </div>
    )
  }

  // ── RESOURCES VIEW ──────────────────────────────────────────────────────────
  if (activePage === 'resources') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <h2 className="text-xl font-bold text-brown-900 flex items-center gap-2">
          <BookOpen size={22} className="text-brown-600" /> Resources
        </h2>
        <div className="card space-y-2">
          {staticResources.map(r => (
            <a key={r.label} href="#"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-brown-50 transition-colors group border border-transparent hover:border-brown-200">
              <div className="w-9 h-9 bg-brown-100 rounded-xl flex items-center justify-center text-brown-600 group-hover:bg-brown-200 transition-colors">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brown-800">{r.label}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="badge-brown text-xs">{r.type}</span>
                <ChevronRight size={14} className="text-brown-400" />
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  // ── SETTINGS VIEW ──────────────────────────────────────────────────────────
  if (activePage === 'settings') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <h2 className="text-xl font-bold text-brown-900 flex items-center gap-2">
          <SettingsIcon size={22} className="text-brown-600" /> Settings
        </h2>
        <div className="card space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
              style={{ background: employee.color }}>{employee.initials}</div>
            <div>
              <p className="font-bold text-brown-900">{employee.name}</p>
              <p className="text-sm text-brown-500">{employee.role} · {employee.team}</p>
              <p className="text-xs text-brown-400">{employee.email}</p>
            </div>
          </div>
          <hr className="border-brown-100" />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brown-500">Onboarding Progress</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-brown-100 rounded-full overflow-hidden">
                <div className="h-full bg-brown-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-bold text-brown-700">{progress}%</span>
            </div>
            <p className="text-xs text-brown-400">Day {employee.day} of {employee.totalDays}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── DASHBOARD (OVERVIEW) VIEW ──────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-brown-600 to-brown-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10"><Trophy size={80} /></div>
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">Day {employee.day} of {employee.totalDays} · {employee.role}</p>
            <h2 className="text-2xl font-bold">Welcome, {employee.name.split(' ')[0]}! 👋</h2>
            <p className="text-white/80 text-sm mt-2">
              {doneCount > 0
                ? `You've completed ${doneCount} of ${myTasks.length} tasks. Keep it up!`
                : myTasks.length > 0
                ? `You have ${myTasks.length} tasks assigned. Let's get started!`
                : 'Your onboarding tasks will appear here once assigned.'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs mb-1">Progress</p>
            <p className="text-3xl font-black">{progress}%</p>
            <div className="w-32 h-2 bg-white/20 rounded-full mt-2">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {employee.bio && (
        <div className="bg-white border border-brown-100 rounded-2xl p-4 flex gap-3 shadow-sm">
          <MessageSquare size={16} className="text-brown-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-brown-500 mb-0.5">About Me</p>
            <p className="text-sm text-brown-700 leading-relaxed">{employee.bio}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <CheckCircle size={20} />, label: 'Done',        value: `${doneCount}/${myTasks.length}`,                          color: 'text-green-600 bg-green-50'  },
          { icon: <Flame size={20} />,       label: 'Day Streak',  value: `${employee.day} 🔥`,                                      color: 'text-orange-600 bg-orange-50' },
          { icon: <Clock size={20} />,       label: 'Pending',     value: myTasks.filter(t => t.status === 'pending').length,         color: 'text-blue-600 bg-blue-50'    },
          { icon: <Bell size={20} />,        label: 'From Mentor', value: myTasks.filter(t => t.assignedBy === 'mentor').length,      color: 'text-teal-600 bg-teal-50'    },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-sm text-brown-500 font-medium">{s.label}</p>
              <p className="font-bold text-brown-900 text-lg leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left/center: Concise task list ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brown-900 text-base flex items-center gap-2">
                <ListChecks size={17} className="text-brown-500" /> My Tasks
                <span className="text-xs font-normal text-brown-400">({myTasks.length} total)</span>
              </h3>
              <button
                onClick={() => onNavigate?.('tasks')}
                className="text-xs font-semibold text-brown-600 hover:text-brown-900 flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={13} />
              </button>
            </div>

            {myTasks.length === 0 ? (
              <div className="text-center py-8 text-brown-400">
                <AlertCircle size={30} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No tasks assigned yet — check back soon</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myTasks.slice(0, 6).map(task => (
                  <div
                    key={task.id}
                    onClick={() => { onNavigate?.('tasks') }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all group ${
                      task.status === 'done'        ? 'border-green-200 bg-green-50/40 hover:bg-green-50' :
                      task.status === 'in-progress' ? 'border-brown-300 bg-brown-50 hover:bg-brown-100' :
                      'border-brown-100 hover:border-brown-200 hover:bg-brown-50/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      task.status === 'done' ? 'bg-green-500 border-green-500' :
                      task.status === 'in-progress' ? 'border-brown-500' : 'border-brown-300'
                    }`}>
                      {task.status === 'done' && <CheckCircle size={10} className="text-white" />}
                      {task.status === 'in-progress' && <div className="w-1.5 h-1.5 bg-brown-500 rounded-full" />}
                    </div>
                    <p className={`text-sm font-medium flex-1 truncate ${task.status === 'done' ? 'line-through text-brown-400' : 'text-brown-800'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-brown-400">{task.estimatedTime}</span>
                      <span className="badge-brown text-xs py-0.5">{task.category}</span>
                      {task.status === 'done'        && <span className="badge-green text-xs py-0.5">Done</span>}
                      {task.status === 'in-progress' && <span className="badge-orange text-xs py-0.5">In Progress</span>}
                    </div>
                  </div>
                ))}
                {myTasks.length > 6 && (
                  <button
                    onClick={() => onNavigate?.('tasks')}
                    className="w-full text-xs text-brown-500 hover:text-brown-700 font-medium py-2 hover:bg-brown-50 rounded-lg transition-colors"
                  >
                    +{myTasks.length - 6} more tasks — View All →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AI Assistance — same as admin page */}
          <AdminChatWidget
            employeeCount={1}
            atRiskCount={employee.risk === 'high' ? 1 : 0}
            avgProgress={progress}
            docCount={state.documents.length}
            atRiskNames={employee.risk === 'high' ? [employee.name] : []}
          />
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Mentor card */}
          {mentor && (
            <div className="card">
              <h3 className="font-bold text-brown-900 mb-4">Your Mentor / Buddy</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: mentor.color }}>{mentor.initials}</div>
                <div>
                  <p className="font-semibold text-brown-900">{mentor.name}</p>
                  <p className="text-sm text-brown-500">{mentor.specialty}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs text-green-600">Available</span>
                  </div>
                </div>
              </div>
              <div className="bg-brown-50 rounded-lg p-3 mb-3 border border-brown-100">
                <p className="text-xs text-brown-600">
                  <span className="font-semibold">Mentor tasks:</span>{' '}
                  {myTasks.filter(t => t.assignedBy === 'mentor').length} assigned to you
                </p>
              </div>
              <button
                onClick={() => onNavigate?.('chat')}
                className="w-full btn-secondary py-2 text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> Message {mentor.name.split(' ')[0]}
              </button>
            </div>
          )}

          {/* Upcoming Meetings (replaces Quick Resources) */}
          <div className="card">
            <h3 className="font-bold text-brown-900 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-teal-600" /> Upcoming Meetings
            </h3>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-6 text-brown-400">
                <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">No upcoming meetings scheduled yet</p>
                <p className="text-xs mt-1 opacity-70">Your mentor will schedule meetings from their portal</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingMeetings.slice(0, 4).map(mtg => (
                  <div key={mtg.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-brown-50 border border-brown-100">
                    <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-100">
                      <Calendar size={14} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-brown-900 truncate">{mtg.title}</p>
                      <p className="text-[11px] text-brown-500">{new Date(mtg.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {mtg.time}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeBadge[mtg.type] ?? 'bg-brown-100 text-brown-600'}`}>
                      {mtg.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks by source */}
          <div className="card">
            <h3 className="font-bold text-brown-900 mb-4">Tasks by Source</h3>
            <div className="space-y-2.5">
              {[
                { label: 'From Admin',  count: myTasks.filter(t => t.assignedBy === 'admin').length,  color: 'bg-brown-500', icon: '🔑' },
                { label: 'From HR',     count: myTasks.filter(t => t.assignedBy === 'hr').length,     color: 'bg-purple-500', icon: '👔' },
                { label: 'From Mentor', count: myTasks.filter(t => t.assignedBy === 'mentor').length, color: 'bg-teal-500',  icon: '🤝' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs text-brown-600 mb-1 font-medium">
                      <span>{item.label}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${myTasks.length > 0 ? (item.count / myTasks.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AIChatWidget />
    </div>
  )
}
