import { useState } from 'react'
import {
  LayoutDashboard, Users, BarChart3, MessageSquare,
  Calendar, Settings, ChevronLeft, ChevronRight, Bot
} from 'lucide-react'
import Navbar from '../components/common/Navbar'
import MentorDashboard from '../components/dashboard/MentorDashboard'
import ChatTab, { useChatUnread } from '../components/chat/ChatTab'
import Logo from '../components/common/Logo'

const NAV_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Overview',   id: 'overview'  },
  { icon: <Users size={20} />,           label: 'My Mentees', id: 'mentees'   },
  { icon: <BarChart3 size={20} />,       label: 'Progress',   id: 'progress'  },
  { icon: <Bot size={20} />,             label: 'AI Insights',id: 'insights'  },
  { icon: <Calendar size={20} />,        label: 'Schedule',   id: 'schedule'  },
  { icon: <MessageSquare size={20} />,   label: 'Chat',       id: 'chat'      },
  { icon: <Settings size={20} />,        label: 'Settings',   id: 'settings'  },
]

function MentorNav({ collapsed, active, setActive }: { collapsed: boolean; active: string; setActive: (id: string) => void }) {
  const unread = useChatUnread()
  return (
    <nav className="flex-1 p-3 space-y-1">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
            active === item.id
              ? 'bg-brown-500 text-white'
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

export default function MentorPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [active,    setActive]    = useState('overview')

  return (
    <div className="flex min-h-screen" style={{ background: '#F0F7FF' }}>
      <aside
        className="flex-shrink-0 flex flex-col border-r border-brown-200 transition-all duration-300"
        style={{ background: '#E0EFFD', width: collapsed ? 64 : 240 }}
      >
        <div className="h-16 flex items-center px-4 border-b border-brown-200">
          {collapsed ? <Logo size="sm" variant="icon" /> : <Logo size="sm" />}
        </div>

        <MentorNav collapsed={collapsed} active={active} setActive={setActive} />

        {!collapsed && (
          <div className="p-4 border-t border-brown-200">
            <div className="bg-brown-200 rounded-xl p-3">
              <p className="text-xs text-brown-700 font-bold">Mentor</p>
              <p className="text-xs text-brown-600">Sarah Chen</p>
              <p className="text-xs text-brown-500 mt-0.5">4 active mentees</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-brown-200 text-brown-500 hover:bg-brown-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar variant="app" />
        <main className="flex-1 overflow-hidden">
          {active === 'chat'
            ? <ChatTab />
            : <div className="overflow-y-auto h-full"><MentorDashboard /></div>
          }
        </main>
      </div>
    </div>
  )
}
