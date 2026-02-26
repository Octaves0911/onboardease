import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, User } from 'lucide-react'
import Logo from './Logo'

interface NavbarProps {
  variant?: 'landing' | 'app'
}

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()

  if (variant === 'app') {
    return (
      <nav className="sticky top-0 z-40 bg-brown-50 border-b border-brown-200 shadow-sm" style={{ background: '#FFF8DC' }}>
        <div className="flex items-center justify-between px-6 h-16">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-brown-100 transition-colors text-brown-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brown-500 rounded-full"></span>
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brown-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brown-500 flex items-center justify-center text-white text-sm font-semibold">
                  SR
                </div>
                <span className="text-brown-800 font-medium text-sm hidden sm:block">Sam Rivera</span>
                <ChevronDown size={16} className="text-brown-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-brown-200 rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                  <a href="#" className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-700 hover:bg-brown-50 transition-colors">
                    <User size={16} /> Profile
                  </a>
                  <hr className="my-1 border-brown-100" />
                  <Link to="/" className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-700 hover:bg-brown-50 transition-colors">
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

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
  ]

  return (
    <nav className="sticky top-0 z-40 border-b border-brown-200 shadow-sm" style={{ background: '#FFF8DC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/">
            <Logo size="md" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-brown-600 hover:text-brown-900 font-medium text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-brown-600 hover:text-brown-900 font-medium text-sm px-4 py-2 rounded-lg hover:bg-brown-100 transition-colors"
            >
              Sign In
            </Link>
            <Link to="/setup" className="btn-primary text-sm py-2.5 px-5">
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-brown-100 text-brown-700 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-brown-200 px-4 py-4 space-y-2 animate-fade-in">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-4 text-brown-700 hover:bg-brown-50 rounded-lg font-medium transition-colors"
            >
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
