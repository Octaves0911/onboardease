import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, BookOpen, MessageSquare,
  Users, Settings, ChevronLeft, ChevronRight
} from 'lucide-react'
import Navbar from '../components/common/Navbar'
import NewHireDashboard from '../components/dashboard/NewHireDashboard'
import Logo from '../components/common/Logo'

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
  { icon: <CheckSquare size={20} />, label: 'My Tasks', id: 'tasks' },
  { icon: <BookOpen size={20} />, label: 'Resources', id: 'resources' },
  { icon: <MessageSquare size={20} />, label: 'AI Assistant', id: 'chat' },
  { icon: <Users size={20} />, label: 'My Buddy', id: 'buddy' },
  { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
]

export default function NewHirePage() {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('dashboard')

  return (
    <div className="flex min-h-screen" style={{ background: '#FFF8DC' }}>
      {/* Sidebar */}
      <aside
        className="flex-shrink-0 flex flex-col border-r border-brown-200 transition-all duration-300"
        style={{
          background: '#F5F5DC',
          width: collapsed ? 64 : 240,
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-brown-200">
          {collapsed ? <Logo size="sm" variant="icon" /> : <Logo size="sm" />}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                active === item.id
                  ? 'bg-brown-500 text-white'
                  : 'text-brown-600 hover:bg-brown-200 hover:text-brown-900'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Role badge */}
        {!collapsed && (
          <div className="p-4 border-t border-brown-200">
            <div className="bg-brown-200 rounded-xl p-3">
              <p className="text-xs text-brown-700 font-bold">New Hire</p>
              <p className="text-xs text-brown-600">Software Engineer</p>
              <p className="text-xs text-brown-500 mt-0.5">Day 2 · 28 days left</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-brown-200 text-brown-500 hover:bg-brown-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar variant="app" />
        <main className="flex-1 overflow-y-auto">
          <NewHireDashboard />
        </main>
      </div>
    </div>
  )
}
