import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Users, UserCheck, User, ArrowRight, ChevronLeft } from 'lucide-react'
import Logo from '../components/common/Logo'
import { useApp, initialMentors } from '../context/AppContext'

type RoleStep = 'pick-role' | 'pick-mentor' | 'pick-employee'

const ROLE_CARDS = [
  {
    role: 'admin' as const,
    title: 'Admin',
    description: 'Manage employees, assign mentors, upload documents, and configure the platform.',
    icon: <Shield size={32} />,
    color: 'from-brown-700 to-brown-900',
    bg: 'bg-brown-50 border-brown-300',
    route: '/admin',
  },
  {
    role: 'hr' as const,
    title: 'HR Manager',
    description: 'View all employees, assign tasks, use AI to generate onboarding plans from documents.',
    icon: <Users size={32} />,
    color: 'from-purple-600 to-purple-800',
    bg: 'bg-purple-50 border-purple-300',
    route: '/hr',
  },
  {
    role: 'mentor' as const,
    title: 'Mentor / Buddy',
    description: 'Track your assigned mentees, view their resumes, and create AI-personalized task lists.',
    icon: <UserCheck size={32} />,
    color: 'from-teal-600 to-teal-800',
    bg: 'bg-teal-50 border-teal-300',
    route: '/mentor',
  },
  {
    role: 'employee' as const,
    title: 'New Hire',
    description: 'View your onboarding tasks, track progress, chat with AI assistant, and complete your journey.',
    icon: <User size={32} />,
    color: 'from-green-600 to-green-800',
    bg: 'bg-green-50 border-green-300',
    route: '/new-hire',
  },
]

export default function LoginPage() {
  const navigate  = useNavigate()
  const { state, dispatch } = useApp()
  const [step, setStep]     = useState<RoleStep>('pick-role')
  const [selectedRole, setSelectedRole] = useState<typeof ROLE_CARDS[0] | null>(null)

  const handleRoleClick = (card: typeof ROLE_CARDS[0]) => {
    if (card.role === 'mentor') {
      setSelectedRole(card)
      setStep('pick-mentor')
    } else if (card.role === 'employee') {
      setSelectedRole(card)
      setStep('pick-employee')
    } else {
      dispatch({ type: 'SET_ROLE', payload: { role: card.role } })
      navigate(card.route)
    }
  }

  const handleMentorSelect = (mentorId: string) => {
    dispatch({ type: 'SET_ROLE', payload: { role: 'mentor', userId: mentorId } })
    navigate('/mentor')
  }

  const handleEmployeeSelect = (employeeId: string) => {
    dispatch({ type: 'SET_ROLE', payload: { role: 'employee', userId: employeeId } })
    navigate('/new-hire')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #FFF8DC 0%, #F5F5DC 100%)' }}>
      {/* Logo */}
      <div className="mb-10">
        <Logo size="lg" />
        <p className="text-center text-brown-500 text-sm mt-2">Effortless onboarding for growing teams</p>
      </div>

      {/* ── Step: Pick Role ── */}
      {step === 'pick-role' && (
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Choose your role to continue</h2>
            <p className="text-brown-500 text-sm">No password needed — just select who you are</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {ROLE_CARDS.map(card => (
              <button
                key={card.role}
                onClick={() => handleRoleClick(card)}
                className={`group relative text-left p-6 rounded-2xl border-2 ${card.bg} hover:shadow-xl transition-all duration-200 hover:-translate-y-1`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-brown-900 mb-2">{card.title}</h3>
                <p className="text-sm text-brown-600 leading-relaxed">{card.description}</p>
                <div className="flex items-center gap-2 mt-4 text-brown-500 group-hover:text-brown-800 transition-colors font-semibold text-sm">
                  Enter as {card.title} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Pick Mentor ── */}
      {step === 'pick-mentor' && (
        <div className="w-full max-w-lg animate-fade-in">
          <button onClick={() => setStep('pick-role')} className="flex items-center gap-2 text-brown-500 hover:text-brown-800 mb-6 font-medium text-sm transition-colors">
            <ChevronLeft size={16} /> Back to roles
          </button>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Select your Mentor profile</h2>
            <p className="text-brown-500 text-sm">Choose which mentor you are logging in as</p>
          </div>
          <div className="space-y-3">
            {initialMentors.map(mentor => {
              const assignedCount = state.employees.filter(e => e.mentorId === mentor.id).length
              return (
                <button
                  key={mentor.id}
                  onClick={() => handleMentorSelect(mentor.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-brown-200 hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 group text-left"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: mentor.color }}>
                    {mentor.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-brown-900">{mentor.name}</p>
                    <p className="text-sm text-brown-500">{mentor.specialty}</p>
                    <p className="text-xs text-teal-600 font-medium mt-0.5">{assignedCount} mentee{assignedCount !== 1 ? 's' : ''} assigned</p>
                  </div>
                  <ArrowRight size={18} className="text-brown-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Step: Pick Employee ── */}
      {step === 'pick-employee' && (
        <div className="w-full max-w-lg animate-fade-in">
          <button onClick={() => setStep('pick-role')} className="flex items-center gap-2 text-brown-500 hover:text-brown-800 mb-6 font-medium text-sm transition-colors">
            <ChevronLeft size={16} /> Back to roles
          </button>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-2">Select your Employee profile</h2>
            <p className="text-brown-500 text-sm">Choose which new hire you are logging in as</p>
          </div>
          <div className="space-y-3">
            {state.employees.map(emp => {
              const mentor = initialMentors.find(m => m.id === emp.mentorId)
              const myTasks = state.tasks.filter(t => t.assignedTo === emp.id)
              const done    = myTasks.filter(t => t.status === 'done').length
              return (
                <button
                  key={emp.id}
                  onClick={() => handleEmployeeSelect(emp.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-brown-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200 group text-left"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: emp.color }}>
                    {emp.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brown-900">{emp.name}</p>
                    <p className="text-sm text-brown-500">{emp.role}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-brown-400">Day {emp.day}/30</span>
                      <span className="text-brown-300">·</span>
                      <span className="text-xs text-green-600 font-medium">{done}/{myTasks.length} tasks done</span>
                      {mentor && <><span className="text-brown-300">·</span><span className="text-xs text-brown-400">Mentor: {mentor.name}</span></>}
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-brown-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <p className="mt-10 text-xs text-brown-400 text-center">Demo environment — explore all features freely.</p>
    </div>
  )
}
