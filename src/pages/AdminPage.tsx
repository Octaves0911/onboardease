import { useState } from 'react'
import {
  LayoutDashboard, Users, FileText, LayoutTemplate,
  BarChart3, Settings, Shield, ChevronLeft, ChevronRight, Plug
} from 'lucide-react'
import Navbar from '../components/common/Navbar'
import AdminPanel from '../components/dashboard/AdminPanel'
import Logo from '../components/common/Logo'

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Overview', id: 'overview' },
  { icon: <Users size={20} />, label: 'Employees', id: 'employees' },
  { icon: <FileText size={20} />, label: 'Documents', id: 'docs' },
  { icon: <LayoutTemplate size={20} />, label: 'Templates', id: 'templates' },
  { icon: <BarChart3 size={20} />, label: 'Analytics', id: 'analytics' },
  { icon: <Plug size={20} />, label: 'Integrations', id: 'integrations' },
  { icon: <Shield size={20} />, label: 'Compliance', id: 'compliance' },
  { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
]

export default function AdminPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState('overview')

  return (
    <div className="flex min-h-screen" style={{ background: '#FFF8DC' }}>
      <aside
        className="flex-shrink-0 flex flex-col border-r border-brown-200 transition-all duration-300"
        style={{ background: '#F5F5DC', width: collapsed ? 64 : 240 }}
      >
        <div className="h-16 flex items-center px-4 border-b border-brown-200">
          {collapsed ? <Logo size="sm" variant="icon" /> : <Logo size="sm" />}
        </div>

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

        {!collapsed && (
          <div className="p-4 border-t border-brown-200">
            <div className="bg-brown-200 rounded-xl p-3">
              <p className="text-xs text-brown-700 font-bold">Admin</p>
              <p className="text-xs text-brown-600">Acme Corp</p>
              <p className="text-xs text-brown-500 mt-0.5">Growth Plan</p>
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
        <main className="flex-1 overflow-y-auto">
          <AdminPanel />
        </main>
      </div>
    </div>
  )
}
