import { useState } from 'react'
import {
  Users, TrendingUp, AlertTriangle, CheckCircle, Plus,
  Download, Search, MoreVertical, BarChart3, Bot, FileText,
  Sparkles, Trash2, BookOpen, Settings, Shield, Upload
} from 'lucide-react'
import { useApp, initialMentors } from '../../context/AppContext'
import AddEmployeeModal from '../modals/AddEmployeeModal'
import AIDocumentChat from '../chat/AIDocumentChat'
import AIChatWidget from '../common/AIChatWidget'

const TABS = ['Overview', 'Employees', 'Documents', 'Templates', 'Settings']

export default function AdminPanel() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('Overview')
  const [search, setSearch]       = useState('')
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showAIChat, setShowAIChat]           = useState(false)
  const [selectedDocForChat, setSelectedDocForChat] = useState<string | undefined>()

  const filtered = state.employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  )

  const atRisk       = state.employees.filter(e => e.risk === 'high').length
  const onboarding   = state.employees.filter(e => e.status === 'onboarding').length
  const avgProgress  = state.employees.length
    ? Math.round(state.employees.reduce((a, e) => a + e.progress, 0) / state.employees.length)
    : 0

  const getMentorName = (id: string | null) =>
    id ? initialMentors.find(m => m.id === id)?.name ?? '—' : 'Unassigned'

  return (
    <div className="min-h-screen" style={{ background: '#FFF8DC' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Users size={20} />, label: 'Total Employees', value: state.employees.length, sub: `${onboarding} onboarding`, color: 'bg-blue-50 text-blue-600' },
            { icon: <TrendingUp size={20} />, label: 'Avg Progress', value: `${avgProgress}%`, sub: 'across all hires', color: 'bg-green-50 text-green-600' },
            { icon: <AlertTriangle size={20} />, label: 'At Risk', value: atRisk, sub: atRisk > 0 ? 'need attention' : 'all on track ✅', color: `${atRisk > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}` },
            { icon: <FileText size={20} />, label: 'Documents', value: state.documents.length, sub: `${state.documents.filter(d => d.status === 'processed').length} processed`, color: 'bg-purple-50 text-purple-600' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-sm text-brown-500 font-medium">{s.label}</p>
                <p className="font-bold text-brown-900 text-xl leading-tight">{s.value}</p>
                <p className="text-xs text-brown-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 bg-white border border-brown-200 rounded-xl p-1">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab ? 'bg-brown-500 text-white shadow-sm' : 'text-brown-600 hover:bg-brown-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'Overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-brown-900 flex items-center gap-2"><BarChart3 size={18} />Employee Progress</h3>
                  <button onClick={() => setShowAddEmployee(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2"><Plus size={14} />Add Employee</button>
                </div>
                <div className="space-y-4">
                  {state.employees.filter(e => e.status === 'onboarding').map(emp => (
                    <div key={emp.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: emp.color }}>{emp.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-brown-800 truncate">{emp.name}</span>
                          <span className="text-xs text-brown-500 ml-2 flex-shrink-0">Day {emp.day}/{emp.totalDays} · {emp.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className={`progress-fill ${emp.risk === 'high' ? '!bg-red-400' : ''}`} style={{ width: `${emp.progress}%` }} />
                        </div>
                        <p className="text-xs text-brown-400 mt-0.5">Mentor: {getMentorName(emp.mentorId)}</p>
                      </div>
                      {emp.risk === 'high' && <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />}
                    </div>
                  ))}
                  {state.employees.filter(e => e.status === 'onboarding').length === 0 && (
                    <div className="text-center py-8 text-brown-400">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active onboarding employees. <button onClick={() => setShowAddEmployee(true)} className="text-brown-600 underline">Add one</button></p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Chatbot CTA */}
              <div className="bg-gradient-to-br from-brown-700 to-brown-900 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Sparkles size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">AI Task Generator</h3>
                    <p className="text-white/80 text-sm leading-relaxed mb-4">
                      Upload documents or select from existing ones. Our AI reads them and generates a complete onboarding task list you can assign to any employee.
                    </p>
                    <button
                      onClick={() => { setSelectedDocForChat(undefined); setShowAIChat(true) }}
                      className="bg-white text-brown-900 font-bold px-5 py-2.5 rounded-xl hover:bg-brown-50 transition-colors text-sm flex items-center gap-2"
                    >
                      <Bot size={16} /> Open AI Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="card">
                <h3 className="font-bold text-brown-900 mb-4 flex items-center gap-2"><Bot size={16} />AI Insights</h3>
                <div className="space-y-3">
                  {atRisk > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
                      ⚠️ <strong>{state.employees.filter(e => e.risk === 'high').map(e => e.name).join(', ')}</strong> — low engagement detected. Schedule a check-in.
                    </div>
                  )}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">
                    ✅ {state.documents.filter(d => d.status === 'processed').length} documents processed and ready for AI task generation.
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                    💡 You have {state.employees.length} employees. Add AI-generated tasks to accelerate their onboarding.
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold text-brown-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => setShowAddEmployee(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-brown-50 hover:bg-brown-100 border border-brown-200 transition-colors text-left">
                    <Plus size={16} className="text-brown-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-brown-800">Add New Employee</span>
                  </button>
                  <button onClick={() => { setShowAIChat(true) }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-brown-50 hover:bg-brown-100 border border-brown-200 transition-colors text-left">
                    <Sparkles size={16} className="text-brown-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-brown-800">Generate Tasks with AI</span>
                  </button>
                  <button onClick={() => setActiveTab('Documents')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-brown-50 hover:bg-brown-100 border border-brown-200 transition-colors text-left">
                    <Upload size={16} className="text-brown-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-brown-800">Upload Documents</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Employees ── */}
        {activeTab === 'Employees' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative max-w-sm w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-400" />
                <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2.5 text-sm" />
              </div>
              <button onClick={() => setShowAddEmployee(true)} className="btn-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm">
                <Plus size={16} /> Add New Employee
              </button>
            </div>

            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-brown-50 border-b border-brown-200">
                    <tr>
                      {['Employee', 'Role / Team', 'Mentor', 'Progress', 'Tasks', 'Status', 'Resume', ''].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-brown-600 px-4 py-3.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brown-100">
                    {filtered.map(emp => {
                      const myTasks = state.tasks.filter(t => t.assignedTo === emp.id)
                      const done    = myTasks.filter(t => t.status === 'done').length
                      return (
                        <tr key={emp.id} className="hover:bg-brown-50/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: emp.color }}>{emp.initials}</div>
                              <div>
                                <span className="font-semibold text-brown-900 text-sm">{emp.name}</span>
                                <p className="text-xs text-brown-400">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-brown-800 font-medium">{emp.role}</p>
                            <p className="text-xs text-brown-400">{emp.team}</p>
                          </td>
                          <td className="px-4 py-4 text-sm text-brown-600 whitespace-nowrap">{getMentorName(emp.mentorId)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 progress-bar">
                                <div className={`progress-fill ${emp.risk === 'high' ? '!bg-red-400' : ''}`} style={{ width: `${emp.progress}%` }} />
                              </div>
                              <span className="text-xs text-brown-500 font-medium">{emp.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-brown-600 whitespace-nowrap">
                            {done}/{myTasks.length} done
                          </td>
                          <td className="px-4 py-4">
                            {emp.status === 'completed'
                              ? <span className="badge-green">Completed</span>
                              : <span className="badge-orange">Onboarding</span>}
                          </td>
                          <td className="px-4 py-4">
                            {emp.resumeFileName
                              ? <span className="badge-green flex items-center gap-1 w-fit"><CheckCircle size={11} />{emp.resumeFileName.slice(0, 12)}…</span>
                              : <span className="text-xs text-brown-400">—</span>}
                          </td>
                          <td className="px-4 py-4">
                            <button className="text-brown-400 hover:text-brown-700 p-1 rounded transition-colors"><MoreVertical size={16} /></button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-brown-400">
                    <Users size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">No employees found</p>
                    <button onClick={() => setShowAddEmployee(true)} className="text-brown-600 underline text-sm mt-1">Add first employee</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {activeTab === 'Documents' && (
          <div className="space-y-5">
            <div className="border-2 border-dashed border-brown-200 rounded-2xl p-10 text-center hover:border-brown-400 transition-all cursor-pointer"
              onClick={() => setShowAIChat(true)}>
              <div className="w-16 h-16 bg-brown-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-brown-500" />
              </div>
              <h3 className="font-bold text-brown-900 text-lg mb-2">Upload & Generate Tasks with AI</h3>
              <p className="text-brown-500 text-sm mb-4">Upload HR documents — our AI reads them and creates onboarding task lists in seconds</p>
              <button className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2">
                <Sparkles size={16} /> Open AI Document Chat
              </button>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-brown-100 flex justify-between items-center">
                <h3 className="font-bold text-brown-900">Uploaded Documents</h3>
                <span className="badge-brown">{state.documents.length} files</span>
              </div>
              <div className="divide-y divide-brown-100">
                {state.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-brown-50/50 transition-colors">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center border border-red-200 flex-shrink-0">
                      <BookOpen size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brown-900 text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-brown-400">{doc.type} · {doc.size} · {doc.date}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {doc.status === 'processed'
                        ? <span className="badge-green flex items-center gap-1"><CheckCircle size={11} /> Processed</span>
                        : <span className="badge-orange">Processing…</span>}
                      <button
                        onClick={() => { setSelectedDocForChat(doc.id); setShowAIChat(true) }}
                        className="text-xs font-semibold text-brown-600 border border-brown-200 bg-white px-2.5 py-1.5 rounded-lg hover:bg-brown-50 transition-colors flex items-center gap-1"
                      >
                        <Bot size={12} /> Generate Tasks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Templates ── */}
        {activeTab === 'Templates' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '💻', name: 'Software Developer', tasks: 45, days: 30, completion: 94 },
              { icon: '📊', name: 'Sales Representative', tasks: 38, days: 21, completion: 88 },
              { icon: '📣', name: 'Marketing Manager', tasks: 32, days: 21, completion: 91 },
              { icon: '🎨', name: 'UX/UI Designer', tasks: 28, days: 14, completion: 96 },
              { icon: '⚙️', name: 'Operations Manager', tasks: 40, days: 30, completion: 85 },
              { icon: '🤝', name: 'Customer Success', tasks: 35, days: 21, completion: 89 },
            ].map(tmpl => (
              <div key={tmpl.name} className="card hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{tmpl.icon}</span>
                  <div>
                    <h4 className="font-bold text-brown-900 text-sm">{tmpl.name}</h4>
                    <p className="text-xs text-brown-500">{tmpl.tasks} tasks · {tmpl.days} days</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 btn-secondary text-xs py-2">Edit</button>
                  <button onClick={() => { setShowAIChat(true) }} className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1">
                    <Bot size={11} /> AI Generate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Settings ── */}
        {activeTab === 'Settings' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {[
              { title: 'Company Settings', icon: <Settings size={18} />, fields: [{ label: 'Company Name', value: 'Acme Corp' }, { label: 'Industry', value: 'SaaS / Software' }, { label: 'Team Size', value: '15-30 employees' }] },
              { title: 'Security & Compliance', icon: <Shield size={18} />, fields: [{ label: 'Authentication', value: 'SSO + MFA Enabled' }, { label: 'Data Encryption', value: 'AES-256' }, { label: 'Compliance', value: 'GDPR · CCPA · SOC 2' }] },
            ].map(section => (
              <div key={section.title} className="card">
                <h3 className="font-bold text-brown-900 mb-5 flex items-center gap-2">{section.icon}{section.title}</h3>
                <div className="space-y-4">
                  {section.fields.map(f => (
                    <div key={f.label}>
                      <label className="block text-xs font-semibold text-brown-600 mb-1.5">{f.label}</label>
                      <input type="text" defaultValue={f.value} className="input-field text-sm py-2.5" />
                    </div>
                  ))}
                </div>
                <button className="btn-primary w-full mt-5 text-sm py-2.5">Save Changes</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddEmployee && <AddEmployeeModal onClose={() => setShowAddEmployee(false)} />}
      {showAIChat && (
        <AIDocumentChat
          onClose={() => { setShowAIChat(false); setSelectedDocForChat(undefined) }}
          assignedBy="admin"
          assignedByName="Admin"
          preselectedDocId={selectedDocForChat}
        />
      )}
      <AIChatWidget />
    </div>
  )
}
