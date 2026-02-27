import { useState } from 'react'
import {
  X, Mail, Users, Calendar, TrendingUp, CheckCircle, Clock,
  AlertCircle, FileText, Trash2, Plus, ChevronDown, ChevronUp,
  Link2, ArrowUp, ArrowDown, GripVertical
} from 'lucide-react'
import { useApp, initialMentors } from '../../context/AppContext'
import type { Employee, Task } from '../../context/AppContext'
import CreateTaskModal from './CreateTaskModal'

interface Props {
  employee: Employee
  onClose: () => void
}

const STATUS_CYCLE: Task['status'][] = ['pending', 'in-progress', 'done']
const PRIORITY_CYCLE: (Task['priority'] | undefined)[] = [undefined, 'low', 'medium', 'high']

const statusStyle = (s: Task['status']) => ({
  done:        { chip: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',       icon: <CheckCircle size={13} className="text-green-500 flex-shrink-0" />,             label: 'Done'        },
  'in-progress':{ chip: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',         icon: <Clock size={13} className="text-blue-500 flex-shrink-0" />,                   label: 'In Progress' },
  pending:     { chip: 'bg-brown-100 text-brown-600 border-brown-200 hover:bg-brown-200',       icon: <div className="w-3 h-3 rounded-full border-2 border-brown-300 flex-shrink-0" />, label: 'Pending'     },
}[s])

const priorityStyle = (p?: Task['priority']) => {
  if (p === 'high')   return 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
  if (p === 'medium') return 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
  if (p === 'low')    return 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
  return 'bg-brown-50 text-brown-400 border-brown-100 hover:bg-brown-100'
}
const priorityLabel = (p?: Task['priority']) => p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Priority'

export default function EmployeeDetailModal({ employee, onClose }: Props) {
  const { state, dispatch } = useApp()
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [expandedTask,   setExpandedTask]   = useState<Record<string, boolean>>({})
  const [confirmRemoveTask, setConfirmRemoveTask] = useState<string | null>(null)

  const mentor  = [...initialMentors, ...state.mentors].find(m => m.id === employee.mentorId)
  const myTasks = state.tasks
    .filter(t => t.assignedTo === employee.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt.localeCompare(b.createdAt))

  // Assign stable display orders on first render if missing
  const tasksWithOrder = myTasks.map((t, i) => ({ ...t, order: t.order ?? i }))

  const done    = myTasks.filter(t => t.status === 'done')
  const inProg  = myTasks.filter(t => t.status === 'in-progress')
  const pending = myTasks.filter(t => t.status === 'pending')
  const rate    = myTasks.length > 0 ? Math.round((done.length / myTasks.length) * 100) : 0

  const cycleStatus = (task: Task) => {
    const idx  = STATUS_CYCLE.indexOf(task.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates: { status: next } } })
  }

  const cyclePriority = (task: Task) => {
    const idx  = PRIORITY_CYCLE.indexOf(task.priority)
    const next = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length]
    dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates: { priority: next } } })
  }

  const moveTask = (id: string, direction: 'up' | 'down') =>
    dispatch({ type: 'REORDER_TASK', payload: { id, direction, employeeId: employee.id } })

  const removeTask = (id: string) => {
    dispatch({ type: 'REMOVE_TASK', payload: { id } })
    setConfirmRemoveTask(null)
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="px-6 py-5 flex items-center justify-between rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #D9EEFF 0%, #B3D8FF 100%)' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md" style={{ background: employee.color }}>
              {employee.initials}
            </div>
            <div>
              <h2 className="font-bold text-brown-900 text-xl">{employee.name}</h2>
              <p className="text-brown-600 text-sm">{employee.role} · {employee.team}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {employee.status === 'completed'
                  ? <span className="badge-green text-xs">Completed</span>
                  : <span className="badge-orange text-xs">Onboarding</span>}
                {employee.risk === 'high' && (
                  <span className="badge-red text-xs flex items-center gap-1"><AlertCircle size={10} />At Risk</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/60 text-brown-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Mail size={13} />,       label: 'Email',      value: employee.email },
              { icon: <Calendar size={13} />,   label: 'Start Date', value: employee.startDate },
              { icon: <Users size={13} />,      label: 'Mentor',     value: mentor?.name ?? 'Unassigned' },
              { icon: <TrendingUp size={13} />, label: 'Day',        value: `${employee.day} / ${employee.totalDays}` },
            ].map(item => (
              <div key={item.label} className="bg-brown-50 rounded-xl p-3 border border-brown-100">
                <div className="flex items-center gap-1.5 text-brown-400 mb-1">
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <p className="text-sm font-semibold text-brown-800 truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Progress card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-brown-900">Onboarding Progress</h3>
              <span className="text-brown-600 font-bold text-lg">{rate}%</span>
            </div>
            <div className="progress-bar mb-4 h-3 rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-500 ${employee.risk === 'high' ? 'bg-red-400' : 'bg-brown-500'}`}
                style={{ width: `${rate}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Completed',   count: done.length,    color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-100' },
                { label: 'In Progress', count: inProg.length,  color: 'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-100'  },
                { label: 'Pending',     count: pending.length, color: 'text-brown-600', bg: 'bg-brown-50',  border: 'border-brown-100' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-3`}>
                  <p className={`font-bold text-2xl ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-brown-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Task list ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-brown-900">Assigned Tasks</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-brown-500 font-medium">{rate}% complete · {myTasks.length} total</span>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <Plus size={12} /> Create Task
                </button>
              </div>
            </div>

            {myTasks.length === 0 ? (
              <div className="text-center py-10 bg-brown-50 rounded-xl border border-dashed border-brown-200">
                <FileText size={28} className="mx-auto mb-2 text-brown-300" />
                <p className="text-sm text-brown-500 mb-3">No tasks assigned yet</p>
                <button onClick={() => setShowCreateTask(true)} className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
                  <Plus size={13} /> Create First Task
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {tasksWithOrder.map((task, idx) => {
                  const st       = statusStyle(task.status)
                  const isExpanded = expandedTask[task.id]
                  const hasSubs  = (task.subtasks ?? []).length > 0
                  const hasLinks = (task.supportingLinks ?? []).length > 0
                  const hasDocs  = (task.supportingDocs ?? []).length > 0
                  const hasExtra = hasSubs || hasLinks || hasDocs || task.requiresInput
                  const isFirst  = idx === 0
                  const isLast   = idx === tasksWithOrder.length - 1
                  const isPendingRemove = confirmRemoveTask === task.id

                  return (
                    <div key={task.id} className={`rounded-xl border bg-white overflow-hidden transition-all ${isPendingRemove ? 'border-red-300' : 'border-brown-100'}`}>

                      {/* Main row */}
                      <div className="flex items-center gap-2 p-3">

                        {/* Reorder handles */}
                        <div className="flex flex-col gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => moveTask(task.id, 'up')}
                            disabled={isFirst}
                            className="p-0.5 rounded text-brown-300 hover:text-brown-600 hover:bg-brown-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            onClick={() => moveTask(task.id, 'down')}
                            disabled={isLast}
                            className="p-0.5 rounded text-brown-300 hover:text-brown-600 hover:bg-brown-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        <GripVertical size={14} className="text-brown-200 flex-shrink-0" />

                        {/* Task info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-brown-400' : 'text-brown-800'}`}>
                              {task.title}
                            </p>
                            {task.requiresInput && (
                              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex-shrink-0 flex items-center gap-1">
                                <AlertCircle size={9} />Input
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-brown-400 mt-0.5">{task.category} · {task.estimatedTime}</p>
                        </div>

                        {/* Priority badge — click to cycle */}
                        <button
                          onClick={() => cyclePriority(task)}
                          title="Click to change priority"
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 transition-colors ${priorityStyle(task.priority)}`}
                        >
                          {priorityLabel(task.priority)}
                        </button>

                        {/* Status chip — click to cycle */}
                        <button
                          onClick={() => cycleStatus(task)}
                          title="Click to change status"
                          className={`text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 transition-colors flex items-center gap-1 ${st.chip}`}
                        >
                          {st.icon}
                          <span>{st.label}</span>
                        </button>

                        {/* Expand toggle */}
                        {hasExtra && (
                          <button
                            onClick={() => setExpandedTask(ex => ({ ...ex, [task.id]: !ex[task.id] }))}
                            className="p-1 rounded hover:bg-brown-50 text-brown-400 flex-shrink-0 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => setConfirmRemoveTask(isPendingRemove ? null : task.id)}
                          title="Remove task"
                          className={`p-1 rounded flex-shrink-0 transition-colors ${isPendingRemove ? 'text-red-600 bg-red-50' : 'text-red-300 hover:text-red-600 hover:bg-red-50'}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Remove confirmation inline */}
                      {isPendingRemove && (
                        <div className="bg-red-50 border-t border-red-200 px-4 py-2.5 flex items-center justify-between gap-3">
                          <p className="text-xs text-red-700 font-medium">Remove this task? This cannot be undone.</p>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => setConfirmRemoveTask(null)} className="text-xs px-2.5 py-1 rounded-lg border border-brown-200 bg-white text-brown-600 hover:bg-brown-50 transition-colors">Cancel</button>
                            <button onClick={() => removeTask(task.id)} className="text-xs px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold">Yes, Remove</button>
                          </div>
                        </div>
                      )}

                      {/* Expanded details */}
                      {isExpanded && hasExtra && (
                        <div className="border-t border-brown-100 px-4 pb-3 pt-2.5 space-y-3 bg-brown-50/40">
                          {hasSubs && (
                            <div>
                              <p className="text-xs font-semibold text-brown-500 mb-1.5">Subtasks</p>
                              <div className="space-y-1.5">
                                {(task.subtasks ?? []).map(sub => (
                                  <div key={sub.id} className="flex items-center gap-2">
                                    <button
                                      onClick={() => dispatch({ type: 'UPDATE_SUBTASK_STATUS', payload: { taskId: task.id, subtaskId: sub.id, status: sub.status === 'done' ? 'pending' : 'done' } })}
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sub.status === 'done' ? 'bg-green-500 border-green-500' : 'border-brown-300 hover:border-brown-500'}`}
                                    >
                                      {sub.status === 'done' && <CheckCircle size={10} className="text-white" />}
                                    </button>
                                    <span className={`text-xs ${sub.status === 'done' ? 'line-through text-brown-400' : 'text-brown-700'}`}>{sub.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {hasDocs && (
                            <div>
                              <p className="text-xs font-semibold text-brown-500 mb-1">Supporting Documents</p>
                              {(task.supportingDocs ?? []).map(dId => {
                                const doc = state.documents.find(d => d.id === dId)
                                return doc ? (
                                  <div key={dId} className="flex items-center gap-1.5 text-xs text-brown-600">
                                    <FileText size={11} className="text-red-400 flex-shrink-0" />{doc.name}
                                  </div>
                                ) : null
                              })}
                            </div>
                          )}
                          {hasLinks && (
                            <div>
                              <p className="text-xs font-semibold text-brown-500 mb-1">Links</p>
                              {(task.supportingLinks ?? []).map((lnk, i) => (
                                <a key={i} href={lnk.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                                  <Link2 size={11} className="flex-shrink-0" />{lnk.label}
                                </a>
                              ))}
                            </div>
                          )}
                          {task.requiresInput && (
                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5">
                              <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1"><AlertCircle size={11} />Employee Input Required</p>
                              <p className="text-xs text-purple-600 mb-2">{task.inputPrompt}</p>
                              {task.inputValue
                                ? <div className="bg-white border border-purple-200 rounded p-2 text-xs text-brown-800">{task.inputValue}</div>
                                : <p className="text-xs text-purple-400 italic">Awaiting employee response…</p>
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Resume */}
          {employee.resumeFileName && (
            <div className="flex items-center gap-3 p-4 bg-brown-50 rounded-xl border border-brown-200">
              <FileText size={18} className="text-brown-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-brown-800">Resume on file</p>
                <p className="text-xs text-brown-400 mt-0.5">{employee.resumeFileName}</p>
              </div>
              <span className="badge-green flex items-center gap-1"><CheckCircle size={11} />Uploaded</span>
            </div>
          )}

          {/* Remove from org */}
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors text-sm font-semibold"
            >
              <Trash2 size={14} /> Remove from Organization
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-red-800">
                Confirm removal of <strong>{employee.name}</strong>? All their tasks will also be deleted. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
                <button
                  onClick={() => { dispatch({ type: 'REMOVE_EMPLOYEE', payload: { id: employee.id } }); onClose() }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} /> Yes, Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {showCreateTask && (
      <CreateTaskModal employee={employee} onClose={() => setShowCreateTask(false)} />
    )}
    </>
  )
}
