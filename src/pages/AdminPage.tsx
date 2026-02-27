import { useState } from 'react'
import {
  LayoutDashboard, Users, FileText,
  BarChart3, Settings, ChevronLeft, ChevronRight, Plug, GraduationCap
} from 'lucide-react'
import Navbar from '../components/common/Navbar'
import AdminPanel from '../components/dashboard/AdminPanel'
import ProfileModal from '../components/modals/ProfileModal'
import Logo from '../components/common/Logo'

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Overview',     id: 'overview'      },
  { icon: <Users size={20} />,           label: 'Employees',    id: 'employees'     },
  { icon: <FileText size={20} />,        label: 'Documents',    id: 'docs'          },
  { icon: <GraduationCap size={20} />,   label: 'Mentors',      id: 'mentors'       },
  { icon: <BarChart3 size={20} />,       label: 'Analytics',    id: 'analytics'     },
  { icon: <Plug size={20} />,            label: 'Integrations', id: 'integrations'  },
  { icon: <Settings size={20} />,        label: 'Settings',     id: 'settings'      },
]

export default function AdminPage() {
  const [collapsed,    setCollapsed]    = useState(false)
  const [active,       setActive]       = useState('overview')
  const [showProfile,  setShowProfile]  = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: '#F0F7FF' }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex-shrink-0 flex flex-col border-r border-brown-200 transition-all duration-300"
        style={{ background: '#E0EFFD', width: collapsed ? 64 : 240 }}
      >
        {/* Logo + collapse toggle in same row */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-brown-200">
          {collapsed
            ? <Logo size="sm" variant="icon" />
            : <Logo size="sm" />
          }
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-brown-500 hover:bg-brown-200 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                active === item.id
                  ? 'bg-brown-500 text-white shadow-sm'
                  : 'text-brown-600 hover:bg-brown-200 hover:text-brown-900'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top navbar — no logo, shows "Admin Portal" title */}
        <Navbar
          variant="app"
          title="Admin Portal"
          onProfileClick={() => setShowProfile(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <AdminPanel activeSection={active} />
        </main>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  )
}
