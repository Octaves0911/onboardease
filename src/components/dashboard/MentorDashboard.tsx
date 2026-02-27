import { useState, useRef, useEffect } from 'react'
import {
  Users, Bot, Sparkles, Send, FileText, ListChecks,
  AlertTriangle, CheckCircle, Calendar, MessageSquare,
  ChevronRight, Clock, X, Upload
} from 'lucide-react'
import { useApp, initialMentors, Employee } from '../../context/AppContext'
import { generateTasksFromResume, parseTasksFromResponse, ParsedTask } from '../../services/aiService'
import AssignTaskModal from '../modals/AssignTaskModal'
import AIChatWidget from '../common/AIChatWidget'

interface ChatMsg { id: string; role: 'user' | 'ai'; content: string; tasks?: ParsedTask[]; timestamp: Date }

function ResumeAIChat({ employee, mentorName, onClose }: { employee: Employee; mentorName: string; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([{
    id: '0', role: 'ai', timestamp: new Date(),
    content: `👋 I'm your AI onboarding specialist.\n\n${employee.resumeFileName ? `I've analyzed **${employee.resumeFileName}** for ${employee.name}. They're joining as **${employee.role}**.` : `${employee.name} doesn't have a resume uploaded yet, but I can still create a plan based on their role as **${employee.role}**.`}\n\nTell me what kind of onboarding plan you'd like me to create:\n• **"Create a 30-day technical plan for a React developer"**\n• **"Build a plan focusing on communication and team integration"**\n• **"Generate a task list for their first week only"**`,
  }])
  const [input, setInput]         = useState('')
  const [typing, setTyping]       = useState(false)
  const [pendingTasks, setPendingTasks] = useState<ParsedTask[] | null>(null)
  const [showAssign, setShowAssign]     = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || typing) return
    setInput('')
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }])
    setTyping(true)

    const aiText = await generateTasksFromResume(
      employee.resumeContent ?? `${employee.name}, ${employee.role}, ${employee.team} team.`,
      employee.resumeFileName ?? '',
      msg,
      employee.role
    )

    const parsed = parseTasksFromResponse(aiText)
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: aiText, tasks: parsed.length > 0 ? parsed : undefined, timestamp: new Date() }])
    if (parsed.length > 0) setPendingTasks(parsed)
    setTyping(false)
  }

  const fmt = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[680px] flex flex-col animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-teal-600 to-teal-800 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white">Resume AI — {employee.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-soft" />
                  <span className="text-white/70 text-xs">
                    {employee.resumeFileName ? `📄 ${employee.resumeFileName}` : `${employee.role} · No resume`}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-white"><X size={18} /></button>
          </div>

          {/* Resume snippet */}
          {employee.resumeContent && (
            <div className="px-4 py-2.5 bg-teal-50 border-b border-teal-100 flex-shrink-0">
              <p className="text-xs text-teal-800 line-clamp-2">
                <span className="font-semibold">Resume: </span>{employee.resumeContent}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-teal-50/10">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={15} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : 'bg-white text-brown-800 border border-teal-200 rounded-tl-sm shadow-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: fmt(msg.content) }}
                  />
                  {msg.tasks && msg.tasks.length > 0 && (
                    <button onClick={() => { setPendingTasks(msg.tasks!); setShowAssign(true) }}
                      className="flex items-center gap-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-2 rounded-lg mt-1 transition-colors">
                      <ListChecks size={14} /> Assign {msg.tasks.length} Tasks to {employee.name}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 animate-fade-in">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-white border border-teal-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 py-2 border-t border-teal-100 flex gap-2 overflow-x-auto flex-shrink-0">
            {['Create 30-day plan', 'Week 1 tasks only', 'Technical deep-dive', 'Team integration focus'].map(p => (
              <button key={p} onClick={() => send(p)}
                className="flex-shrink-0 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1.5 rounded-full hover:bg-teal-100 transition-colors">
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-1 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white border border-teal-200 rounded-xl px-4 py-2.5">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Describe the onboarding plan you want to create..."
                className="flex-1 bg-transparent text-sm text-brown-800 placeholder-brown-400 outline-none"
              />
              <button onClick={() => send()} disabled={!input.trim() || typing}
                className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white disabled:opacity-40 hover:bg-teal-700 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAssign && pendingTasks && (
        <AssignTaskModal tasks={pendingTasks} preselectedEmployeeId={employee.id}
          onClose={() => setShowAssign(false)} assignedBy="mentor" assignedByName={mentorName} />
      )}
    </>
  )
}

// ─── Main Mentor Dashboard ────────────────────────────────────────────────────

export default function MentorDashboard() {
  const { state } = useApp()
  const currentMentor = initialMentors.find(m => m.id === state.currentUserId) ?? initialMentors[0]
  const myMentees = state.employees.filter(e => e.mentorId === currentMentor.id)
  const [selectedMentee, setSelectedMentee] = useState<Employee | null>(null)
  const [showResumeChat, setShowResumeChat] = useState(false)

  const statusConfig = {
    'on-track': { label: 'On Track', badge: 'badge-green' },
    'ahead': { label: 'Ahead 🚀', badge: 'bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full' },
    'at-risk': { label: 'At Risk ⚠️', badge: 'badge-red' },
  }

  return (
    <div className="min-h-screen" style={{ background: '#F0F7FF' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>{currentMentor.initials}</div>
            <div>
              <h2 className="text-2xl font-bold">Welcome, {currentMentor.name}!</h2>
              <p className="text-teal-100 text-sm">{currentMentor.specialty} · {myMentees.length} active mentee{myMentees.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Users size={20} />, label: 'My Mentees', value: myMentees.length, color: 'bg-teal-50 text-teal-700' },
            { icon: <AlertTriangle size={20} />, label: 'At Risk', value: myMentees.filter(e => e.risk === 'high').length, color: 'bg-red-50 text-red-600' },
            { icon: <ListChecks size={20} />, label: 'Tasks I Assigned', value: state.tasks.filter(t => t.assignedBy === 'mentor' && myMentees.some(e => e.id === t.assignedTo)).length, color: 'bg-brown-50 text-brown-600' },
            { icon: <CheckCircle size={20} />, label: 'With Resumes', value: myMentees.filter(e => !!e.resumeFileName).length, color: 'bg-green-50 text-green-600' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-sm text-brown-500 font-medium">{s.label}</p>
                <p className="font-bold text-brown-900 text-xl leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mentee cards */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-brown-900 text-lg">My Mentees</h3>
            {myMentees.length === 0 ? (
              <div className="card text-center py-12 text-brown-400">
                <Users size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No mentees assigned yet</p>
                <p className="text-sm mt-1">Ask your Admin to assign employees to you</p>
              </div>
            ) : (
              myMentees.map(mentee => {
                const myTasks = state.tasks.filter(t => t.assignedTo === mentee.id && t.assignedBy === 'mentor')
                const done    = myTasks.filter(t => t.status === 'done').length
                const status  = mentee.risk === 'high' ? 'at-risk' : mentee.progress > 70 ? 'ahead' : 'on-track'
                const cfg     = statusConfig[status]
                return (
                  <div key={mentee.id} className="card hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: mentee.color }}>{mentee.initials}</div>
                        <div>
                          <h4 className="font-bold text-brown-900">{mentee.name}</h4>
                          <p className="text-sm text-brown-500">{mentee.role} · {mentee.team}</p>
                          <p className="text-xs text-brown-400 mt-0.5">Started {mentee.startDate} · Day {mentee.day}/{mentee.totalDays}</p>
                        </div>
                      </div>
                      <span className={cfg.badge}>{cfg.label}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs text-brown-500 mb-1 font-medium"><span>Progress</span><span>{mentee.progress}%</span></div>
                        <div className="progress-bar"><div className={`progress-fill ${mentee.risk === 'high' ? '!bg-red-400' : ''}`} style={{ width: `${mentee.progress}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-brown-500 mb-1 font-medium"><span>My Tasks</span><span>{done}/{myTasks.length}</span></div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: myTasks.length > 0 ? `${(done / myTasks.length) * 100}%` : '0%' }} /></div>
                      </div>
                    </div>

                    {/* Resume status */}
                    <div className={`mt-4 p-3 rounded-xl border ${mentee.resumeFileName ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={15} className={mentee.resumeFileName ? 'text-green-600' : 'text-amber-600'} />
                          <span className="text-xs font-semibold">
                            {mentee.resumeFileName ? mentee.resumeFileName : 'No resume uploaded'}
                          </span>
                        </div>
                        {mentee.resumeFileName && <span className="badge-green text-xs">AI Ready</span>}
                      </div>
                      {mentee.resumeFileName && (
                        <p className="text-xs text-green-700 mt-1 line-clamp-2">{mentee.resumeContent?.slice(0, 100)}…</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-brown-100 flex-wrap gap-2">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 text-xs font-medium text-brown-600 bg-brown-50 hover:bg-brown-100 px-3 py-1.5 rounded-lg transition-colors border border-brown-200">
                          <MessageSquare size={13} /> Message
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-medium text-brown-600 bg-brown-50 hover:bg-brown-100 px-3 py-1.5 rounded-lg transition-colors border border-brown-200">
                          <Calendar size={13} /> Schedule
                        </button>
                      </div>
                      <button
                        onClick={() => { setSelectedMentee(mentee); setShowResumeChat(true) }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-1.5 rounded-lg transition-colors"
                      >
                        <Sparkles size={13} /> {mentee.resumeFileName ? 'AI Task Builder' : 'Create Tasks with AI'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* AI feature callout */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-900 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Bot size={18} className="text-teal-200" />
                <h3 className="font-bold">Resume AI Planner</h3>
              </div>
              <p className="text-sm text-teal-100 leading-relaxed mb-4">
                Select a mentee and use our AI to create a personalized onboarding plan based on their resume and your guidance.
              </p>
              <div className="space-y-2 text-xs text-teal-200">
                <p className="flex items-center gap-2">✅ Reads the resume automatically</p>
                <p className="flex items-center gap-2">✅ Generates role-specific tasks</p>
                <p className="flex items-center gap-2">✅ Uses your mentor prompts</p>
                <p className="flex items-center gap-2">✅ Assigns directly to mentee</p>
              </div>
            </div>

            {/* Recent tasks I assigned */}
            <div className="card">
              <h3 className="font-bold text-brown-900 mb-4 flex items-center gap-2"><ListChecks size={16} />Tasks I Assigned</h3>
              <div className="space-y-2">
                {state.tasks.filter(t => t.assignedBy === 'mentor' && myMentees.some(e => e.id === t.assignedTo)).slice(-5).map(task => {
                  const emp = state.employees.find(e => e.id === task.assignedTo)
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-teal-50 border border-teal-100">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.status === 'done' ? 'bg-green-500' : 'bg-teal-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-brown-800 truncate">{task.title}</p>
                        <p className="text-xs text-brown-400">→ {emp?.name}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock size={10} className="text-brown-400" />
                        <span className="text-xs text-brown-400">{task.estimatedTime}</span>
                      </div>
                    </div>
                  )
                })}
                {state.tasks.filter(t => t.assignedBy === 'mentor').length === 0 && (
                  <p className="text-xs text-brown-400 text-center py-4">Use the AI Task Builder to assign tasks to your mentees</p>
                )}
              </div>
            </div>

            {/* Upcoming check-ins */}
            <div className="card">
              <h3 className="font-bold text-brown-900 mb-4 flex items-center gap-2"><Calendar size={16} />Check-ins</h3>
              <div className="space-y-2">
                {myMentees.slice(0, 3).map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-brown-50 border border-brown-100">
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brown-900 truncate">{m.name}</p>
                      <p className="text-xs text-brown-500">{['Today 2:00 PM', 'Tomorrow 10:00 AM', 'Thu 3:00 PM'][i]}</p>
                    </div>
                    <span className="badge-brown text-xs">1:1</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showResumeChat && selectedMentee && (
        <ResumeAIChat employee={selectedMentee} mentorName={currentMentor.name} onClose={() => { setShowResumeChat(false); setSelectedMentee(null) }} />
      )}
      <AIChatWidget />
    </div>
  )
}
