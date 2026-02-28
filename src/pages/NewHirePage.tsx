import { useState } from 'react'
import {
  LayoutDashboard, CheckSquare, BookOpen, MessageSquare,
  Users, Settings, ChevronLeft, ChevronRight
} from 'lucide-react'
import Navbar from '../components/common/Navbar'
import NewHireDashboard from '../components/dashboard/NewHireDashboard'
import ChatTab, { useChatUnread } from '../components/chat/ChatTab'
import Logo from '../components/common/Logo'

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <CheckSquare size={20} />,     label: 'My Tasks',  id: 'tasks'     },
  { icon: <BookOpen size={20} />,        label: 'Resources', id: 'resources' },
  { icon: <MessageSquare size={20} />,   label: 'Chat',      id: 'chat'      },
  { icon: <Users size={20} />,           label: 'My Buddy',  id: 'buddy'     },
  { icon: <Settings size={20} />,        label: 'Settings',  id: 'settings'  },
]

function NewHireNav({
  collapsed,
  active,
  setActive,
}: {
  collapsed: boolean
  active: string
  setActive: (id: string) => void
}) {
  const unread = useChatUnread()
  return (
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
          <span className="relative flex-shrink-0">
            {item.icon}
            {item.id === 'chat' && unread > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </span>
          {!collapsed && (
            <span className="font-medium text-sm flex items-center gap-1.5 flex-1">
              {item.label}
              {item.id === 'chat' && unread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}

export default function NewHirePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [active,    setActive]    = useState('dashboard')

  return (
    <div className="flex min-h-screen" style={{ background: '#F0F7FF' }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex-shrink-0 flex flex-col border-r border-brown-200 transition-all duration-300"
        style={{ background: '#E0EFFD', width: collapsed ? 64 : 240 }}
      >
        {/* Logo row + collapse toggle at the top */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-brown-200">
          {collapsed
            ? <Logo size="sm" variant="icon" />
            : <Logo size="sm" />
          }
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-brown-500 hover:bg-brown-200 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Nav items — no bottom role badge */}
        <NewHireNav collapsed={collapsed} active={active} setActive={setActive} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar variant="app" title="Employee Portal" />
        <main className="flex-1 overflow-hidden">
          {active === 'chat'
            ? <ChatTab />
            : (
              <div className="overflow-y-auto h-full">
                <NewHireDashboard activePage={active} onNavigate={setActive} />
              </div>
            )
          }
        </main>
      </div>
    </div>
  )
}
