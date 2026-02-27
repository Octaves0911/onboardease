import { X, Mail, Users, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import { useApp, initialMentors } from '../../context/AppContext'
import type { Employee } from '../../context/AppContext'

interface Props {
  employee: Employee
  onClose: () => void
}

export default function EmployeeDetailModal({ employee, onClose }: Props) {
  const { state } = useApp()
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
              <span className="text-xs text-brown-500 font-medium">{rate}% complete · {myTasks.length} total</span>
            </div>

            {myTasks.length === 0 ? (
              <div className="text-center py-10 bg-brown-50 rounded-xl border border-dashed border-brown-200">
                <FileText size={28} className="mx-auto mb-2 text-brown-300" />
                <p className="text-sm text-brown-500">No tasks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {myTasks.map(task => {
                  const style = taskStatusStyle(task.status)
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-brown-100 bg-white hover:bg-brown-50/50 transition-colors">
                      {style.icon}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-brown-400' : 'text-brown-800'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-brown-400">{task.category} · {task.estimatedTime}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${style.chip}`}>
                        {task.status === 'done' ? 'Done' : task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </span>
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
        </div>
      </div>
    </div>
  )
}
