import { useState } from 'react'
import { X, Mail, Users, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle, FileText, Trash2, Plus, ChevronDown, ChevronUp, Link2 } from 'lucide-react'
import { useApp, initialMentors } from '../../context/AppContext'
import type { Employee } from '../../context/AppContext'
import CreateTaskModal from './CreateTaskModal'

interface Props {
  employee: Employee
  onClose: () => void
}

export default function EmployeeDetailModal({ employee, onClose }: Props) {
  const { state, dispatch } = useApp()
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [expandedTask,   setExpandedTask]   = useState<Record<string, boolean>>({})
  const mentor   = initialMentors.find(m => m.id === employee.mentorId)
  const myTasks  = state.tasks.filter(t => t.assignedTo === employee.id)
  const done     = myTasks.filter(t => t.status === 'done')
  const inProg   = myTasks.filter(t => t.status === 'in-progress')
  const pending  = myTasks.filter(t => t.status === 'pending')
  const rate     = myTasks.length > 0 ? Math.round((done.length / myTasks.length) * 100) : 0

  const taskStatusStyle = (status: string) => {
    if (status === 'done')        return { chip: 'bg-green-100 text-green-700', icon: <CheckCircle size={13} className="text-green-500 flex-shrink-0" /> }
    if (status === 'in-progress') return { chip: 'bg-blue-100 text-blue-700',   icon: <Clock size={13} className="text-blue-500 flex-shrink-0" /> }
    return { chip: 'bg-brown-100 text-brown-600', icon: <div className="w-3 h-3 rounded-full border-2 border-brown-300 flex-shrink-0" /> }
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
              { icon: <Mail size={13} />,      label: 'Email',      value: employee.email },
              { icon: <Calendar size={13} />,  label: 'Start Date', value: employee.startDate },
              { icon: <Users size={13} />,     label: 'Mentor',     value: mentor?.name ?? 'Unassigned' },
              { icon: <TrendingUp size={13} />,label: 'Day',        value: `${employee.day} / ${employee.totalDays}` },
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

          {/* Task list */}
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
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {myTasks.map(task => {
                  const style    = taskStatusStyle(task.status)
                  const isExpanded = expandedTask[task.id]
                  const hasSubs  = (task.subtasks ?? []).length > 0
                  const hasLinks = (task.supportingLinks ?? []).length > 0
                  const hasDocs  = (task.supportingDocs ?? []).length > 0
                  const hasExtra = hasSubs || hasLinks || hasDocs || task.requiresInput
                  return (
                    <div key={task.id} className="rounded-xl border border-brown-100 bg-white overflow-hidden">
                      <div className="flex items-center gap-3 p-3">
                        {style.icon}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-brown-400' : 'text-brown-800'}`}>
                              {task.title}
                            </p>
                            {task.priority === 'high' && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 flex-shrink-0">High</span>}
                            {task.requiresInput && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex-shrink-0 flex items-center gap-1"><AlertCircle size={9} />Input needed</span>}
                          </div>
                          <p className="text-xs text-brown-400">{task.category} · {task.estimatedTime}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${style.chip}`}>
                          {task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                        </span>
                        {hasExtra && (
                          <button
                            onClick={() => setExpandedTask(ex => ({ ...ex, [task.id]: !ex[task.id] }))}
                            className="p-1 rounded hover:bg-brown-50 text-brown-400 flex-shrink-0"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>

                      {/* Expanded details */}
                      {isExpanded && hasExtra && (
                        <div className="border-t border-brown-100 px-3 pb-3 pt-2.5 space-y-3 bg-brown-50/40">
                          {hasSubs && (
                            <div>
                              <p className="text-xs font-semibold text-brown-500 mb-1.5">Subtasks</p>
                              <div className="space-y-1">
                                {(task.subtasks ?? []).map(st => (
                                  <div key={st.id} className="flex items-center gap-2">
                                    <button
                                      onClick={() => dispatch({ type: 'UPDATE_SUBTASK_STATUS', payload: { taskId: task.id, subtaskId: st.id, status: st.status === 'done' ? 'pending' : 'done' } })}
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${st.status === 'done' ? 'bg-green-500 border-green-500' : 'border-brown-300 hover:border-brown-500'}`}
                                    >
                                      {st.status === 'done' && <CheckCircle size={10} className="text-white" />}
                                    </button>
                                    <span className={`text-xs ${st.status === 'done' ? 'line-through text-brown-400' : 'text-brown-700'}`}>{st.title}</span>
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
                                    <FileText size={11} className="text-red-400 flex-shrink-0" />
                                    {doc.name}
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
                                  <Link2 size={11} className="flex-shrink-0" />
                                  {lnk.label}
                                </a>
                              ))}
                            </div>
                          )}
                          {task.requiresInput && (
                            <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5">
                              <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1"><AlertCircle size={11} />Employee Input Required</p>
                              <p className="text-xs text-purple-600 mb-2">{task.inputPrompt}</p>
                              {task.inputValue ? (
                                <div className="bg-white border border-purple-200 rounded p-2 text-xs text-brown-800">{task.inputValue}</div>
                              ) : (
                                <p className="text-xs text-purple-400 italic">Awaiting employee response…</p>
                              )}
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
                  onClick={() => {
                    dispatch({ type: 'REMOVE_EMPLOYEE', payload: { id: employee.id } })
                    onClose()
                  }}
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
