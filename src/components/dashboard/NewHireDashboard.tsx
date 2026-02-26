import { useState } from 'react'
import { CheckCircle, Clock, BookOpen, Users, Calendar, Link2, Flame, Trophy, Bell, FileText, ChevronRight } from 'lucide-react'
import { useApp, initialMentors } from '../../context/AppContext'
import AIChatWidget from '../common/AIChatWidget'

const resources = [
  { icon: <FileText size={18} />, label: 'Employee Handbook', type: 'PDF' },
  { icon: <BookOpen size={18} />, label: 'Tech Stack Overview', type: 'Doc' },
  { icon: <Users size={18} />, label: 'Org Chart', type: 'Link' },
  { icon: <Calendar size={18} />, label: 'Team Calendar', type: 'Link' },
  { icon: <Link2 size={18} />, label: 'Tool Access Guide', type: 'PDF' },
]

export default function NewHireDashboard() {
  const { state, dispatch } = useApp()

  // Resolve current employee
  const employee = state.employees.find(e => e.id === state.currentUserId) ?? state.employees[0]
  const myTasks  = state.tasks.filter(t => t.assignedTo === employee?.id)
  const mentor   = initialMentors.find(m => m.id === employee?.mentorId)

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'done'>('all')

  const toggleTaskStatus = (taskId: string, currentStatus: string) => {
    const next = currentStatus === 'done' ? 'pending' : currentStatus === 'pending' ? 'in-progress' : 'done'
    dispatch({ type: 'UPDATE_TASK_STATUS', payload: { id: taskId, status: next as any } })
  }

  const displayed = myTasks.filter(t => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return t.status !== 'done'
    return t.status === 'done'
  })

  const doneCount    = myTasks.filter(t => t.status === 'done').length
  const progress     = myTasks.length > 0 ? Math.round((doneCount / myTasks.length) * 100) : 0
  const assignedByLabel = (by: string, name: string) => {
    if (by === 'mentor') return `🤝 ${name}`
    if (by === 'hr') return `👔 ${name}`
    return `🔑 ${name}`
  }

  if (!employee) return (
    <div className="min-h-screen flex items-center justify-center text-brown-500">
      <p>No employee profile found. Please log in again.</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#FFF8DC' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-brown-600 to-brown-800 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-4 top-4 opacity-10"><Trophy size={80} /></div>
          <div className="relative">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-white/70 text-sm mb-1">Day {employee.day} of {employee.totalDays} · {employee.role}</p>
                <h2 className="text-2xl font-bold">Welcome, {employee.name.split(' ')[0]}! 👋</h2>
                <p className="text-white/80 text-sm mt-2">
                  {doneCount > 0 ? `You've completed ${doneCount} of ${myTasks.length} tasks. Keep it up!` : myTasks.length > 0 ? `You have ${myTasks.length} tasks assigned. Let's get started!` : 'Your onboarding tasks will appear here once assigned.'}
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <CheckCircle size={20} />, label: 'Done', value: `${doneCount}/${myTasks.length}`, color: 'text-green-600 bg-green-50' },
            { icon: <Flame size={20} />, label: 'Day Streak', value: `${employee.day} 🔥`, color: 'text-orange-600 bg-orange-50' },
            { icon: <Clock size={20} />, label: 'Pending', value: myTasks.filter(t => t.status === 'pending').length, color: 'text-blue-600 bg-blue-50' },
            { icon: <Bell size={20} />, label: 'From Mentor', value: myTasks.filter(t => t.assignedBy === 'mentor').length, color: 'text-teal-600 bg-teal-50' },
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
          {/* Task list */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-brown-900 text-lg">My Onboarding Tasks</h3>
              <div className="flex gap-1 bg-brown-50 rounded-lg p-1 border border-brown-200">
                {(['all', 'pending', 'done'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-200 ${activeTab === tab ? 'bg-brown-500 text-white' : 'text-brown-600 hover:bg-brown-100'}`}>
                    {tab}{tab === 'all' ? ` (${myTasks.length})` : tab === 'done' ? ` (${doneCount})` : ` (${myTasks.filter(t => t.status !== 'done').length})`}
                  </button>
                ))}
              </div>
            </div>

            {displayed.length === 0 ? (
              <div className="text-center py-12 text-brown-400">
                <CheckCircle size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium text-sm">
                  {activeTab === 'done' ? 'No completed tasks yet' : activeTab === 'pending' ? 'No pending tasks!' : 'No tasks assigned yet — check back soon'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {displayed.map(task => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group ${
                      task.status === 'done' ? 'border-green-200 bg-green-50/50' :
                      task.status === 'in-progress' ? 'border-brown-400 bg-brown-50 shadow-sm' :
                      'border-brown-100 hover:border-brown-200 hover:bg-brown-50/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      task.status === 'done' ? 'bg-green-500 border-green-500' :
                      task.status === 'in-progress' ? 'border-brown-500' :
                      'border-brown-300 group-hover:border-brown-400'
                    }`}>
                      {task.status === 'done' && <CheckCircle size={12} className="text-white" />}
                      {task.status === 'in-progress' && <div className="w-2 h-2 bg-brown-500 rounded-full" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-brown-400' : 'text-brown-800'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Clock size={11} className="text-brown-400 flex-shrink-0" />
                        <span className="text-xs text-brown-400">{task.estimatedTime}</span>
                        <span className="badge-brown py-0.5 text-xs">{task.category}</span>
                        <span className="text-xs text-brown-400">{assignedByLabel(task.assignedBy, task.assignedByName)}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {task.status === 'done' && <span className="badge-green text-xs py-1">Done</span>}
                      {task.status === 'in-progress' && <span className="badge-orange text-xs py-1">In Progress</span>}
                      {task.status === 'pending' && <span className="text-xs text-brown-400 font-medium">Click to start</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {displayed.length > 0 && (
              <p className="text-xs text-brown-400 mt-4 text-center">Click a task to cycle through statuses: Pending → In Progress → Done</p>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Buddy */}
            {mentor && (
              <div className="card">
                <h3 className="font-bold text-brown-900 mb-4">Your Mentor / Buddy</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: mentor.color }}>{mentor.initials}</div>
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
                <button className="w-full btn-secondary py-2 text-sm">Message {mentor.name.split(' ')[0]}</button>
              </div>
            )}

            {/* Task summary by source */}
            <div className="card">
              <h3 className="font-bold text-brown-900 mb-4">Tasks by Source</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'From Admin', count: myTasks.filter(t => t.assignedBy === 'admin').length, color: 'bg-brown-500', icon: '🔑' },
                  { label: 'From HR', count: myTasks.filter(t => t.assignedBy === 'hr').length, color: 'bg-purple-500', icon: '👔' },
                  { label: 'From Mentor', count: myTasks.filter(t => t.assignedBy === 'mentor').length, color: 'bg-teal-500', icon: '🤝' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs text-brown-600 mb-1 font-medium">
                        <span>{item.label}</span>
                        <span>{item.count} tasks</span>
                      </div>
                      <div className="progress-bar">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${myTasks.length > 0 ? (item.count / myTasks.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="card">
              <h3 className="font-bold text-brown-900 mb-4">Quick Resources</h3>
              <div className="space-y-2">
                {resources.map(r => (
                  <a key={r.label} href="#" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-brown-50 transition-colors group">
                    <div className="w-8 h-8 bg-brown-100 rounded-lg flex items-center justify-center text-brown-600 group-hover:bg-brown-200 transition-colors">{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brown-800 truncate">{r.label}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="badge-brown text-xs">{r.type}</span>
                      <ChevronRight size={14} className="text-brown-400" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AIChatWidget />
    </div>
  )
}
