import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, User } from 'lucide-react'
import Logo from './Logo'
import { useApp, initialMentors } from '../../context/AppContext'

interface NavbarProps {
  variant?: 'landing' | 'app'
  title?: string
  onProfileClick?: () => void
}

export default function Navbar({ variant = 'landing', title, onProfileClick }: NavbarProps) {
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const notifRef   = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const location   = useLocation()
  const { state, dispatch }  = useApp()

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Role-based display info ──────────────────────────────────────────────────
  const getUser = () => {
    const { currentRole, currentUserId, employees } = state
    if (currentRole === 'admin')    return { name: 'Admin',      initials: 'A',  color: '#2B85DC' }
    if (currentRole === 'hr')       return { name: 'HR Manager', initials: 'HR', color: '#7C3AED' }
    if (currentRole === 'mentor') {
      const m = initialMentors.find(x => x.id === currentUserId)
      return m ? { name: m.name, initials: m.initials, color: m.color } : { name: 'Mentor', initials: 'M', color: '#0D9488' }
    }
    if (currentRole === 'employee') {
      const e = employees.find(x => x.id === currentUserId)
      return e ? { name: e.name, initials: e.initials, color: e.color } : { name: 'New Hire', initials: 'NH', color: '#16A34A' }
    }
    return { name: 'User', initials: 'U', color: '#2B85DC' }
  }

  const user = getUser()

  // ── App variant ─────────────────────────────────────────────────────────────
  if (variant === 'app') {
    return (
      <nav className="sticky top-0 z-40 border-b border-brown-200 shadow-sm" style={{ background: '#F0F7FF' }}>
        <div className="flex items-center justify-between px-6 h-16">

          {/* Left: Portal title */}
          <div>
            {title
              ? <h1 className="text-lg font-bold text-brown-900">{title}</h1>
              : <Link to="/"><Logo size="sm" /></Link>
            }
          </div>

          <div className="flex items-center gap-2">

            {/* Notifications — HR sees global events; Mentor sees mentee-assignment events */}
            {(() => {
              const isHR     = state.currentRole === 'hr'
              const isMentor = state.currentRole === 'mentor'
              const mentorId = state.currentUserId

              // HR: all notifications without a mentorId scope
              // Mentor: only notifications scoped to their mentorId
              const visibleNotifs = isHR
                ? state.notifications.filter(n => !n.mentorId)
                : isMentor
                  ? state.notifications.filter(n => n.mentorId === mentorId)
                  : []

              const unread = visibleNotifs.filter(n => !n.read).length

              const handleOpen = () => {
                setNotifOpen(!notifOpen)
                setProfileOpen(false)
                if (!notifOpen && unread > 0) {
                  if (isHR)     dispatch({ type: 'MARK_NOTIFICATIONS_READ' })
                  if (isMentor && mentorId) dispatch({ type: 'MARK_MENTOR_NOTIFICATIONS_READ', payload: { mentorId } })
                }
              }

              return (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleOpen}
                    className="relative p-2 rounded-lg hover:bg-brown-100 transition-colors text-brown-600"
                  >
                    <Bell size={20} />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-brown-200 rounded-2xl shadow-xl py-1 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-brown-100 flex items-center justify-between">
                        <p className="font-bold text-brown-900 text-sm">Notifications</p>
                        <span className="text-xs text-brown-400">{unread} new</span>
                      </div>
                      {visibleNotifs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-brown-400">
                          <Bell size={28} className="mb-2 opacity-30" />
                          <p className="text-sm font-medium">No notifications yet</p>
                          <p className="text-xs mt-1 opacity-70">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="max-h-72 overflow-y-auto divide-y divide-brown-50">
                          {[...visibleNotifs].reverse().map(n => (
                            <div key={n.id} className={`px-4 py-3 flex items-start gap-3 ${n.read ? 'opacity-60' : ''}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm
                                ${n.type === 'employee_added' ? 'bg-green-100 text-green-700' :
                                  n.type === 'employee_removed' ? 'bg-red-100 text-red-600' :
                                  'bg-blue-100 text-blue-700'}`}>
                                {n.type === 'employee_added' ? '👤' : n.type === 'employee_removed' ? '🗑' : '📋'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-brown-800">{n.message}</p>
                                <p className="text-xs text-brown-400 mt-0.5">{new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              {!n.read && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brown-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: user.color }}>
                  {user.initials}
                </div>
                <span className="text-brown-800 font-medium text-sm hidden sm:block">{user.name}</span>
                <ChevronDown size={16} className="text-brown-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-brown-200 rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-brown-100">
                    <p className="font-semibold text-brown-900 text-sm">{user.name}</p>
                    <p className="text-xs text-brown-400 capitalize mt-0.5">{state.currentRole ?? 'User'}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); onProfileClick?.() }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brown-700 hover:bg-brown-50 transition-colors"
                  >
                    <User size={15} /> My Profile
                  </button>
                  <hr className="my-1 border-brown-100" />
                  <Link to="/" className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    Sign Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // ── Landing variant ─────────────────────────────────────────────────────────
  const navLinks = [
    { label: 'Features',     href: '#features'     },
    { label: 'How It Works', href: '#how-it-works'  },
    { label: 'Pricing',      href: '#pricing'       },
    { label: 'Testimonials', href: '#testimonials'  },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-brown-200 shadow-sm" style={{ background: '#F0F7FF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/"><Logo size="md" /></Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} className="text-brown-600 hover:text-brown-900 font-medium text-sm transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-brown-600 hover:text-brown-900 font-medium text-sm px-4 py-2 rounded-lg hover:bg-brown-100 transition-colors">
              Sign In
            </Link>
            <Link to="/setup" className="btn-primary text-sm py-2.5 px-5">Get Started Free</Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-brown-100 text-brown-700 transition-colors">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-brown-200 px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block py-2.5 px-4 text-brown-700 hover:bg-brown-50 rounded-lg font-medium transition-colors">
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="btn-secondary text-center">Sign In</Link>
            <Link to="/setup" className="btn-primary text-center">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
