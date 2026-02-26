import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Zap, Users, TrendingUp } from 'lucide-react'

const stats = [
  { icon: <Zap size={18} />, label: 'Faster Onboarding', value: '48hr' },
  { icon: <TrendingUp size={18} />, label: 'HR Time Saved', value: '70%' },
  { icon: <Users size={18} />, label: 'Retention Boost', value: '+25%' },
]

const highlights = [
  'Setup in under 15 minutes',
  'AI-powered personalization',
  'Works with your existing tools',
]

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden py-20 lg:py-28"
      style={{ background: 'linear-gradient(135deg, #FFF8DC 0%, #F5F5DC 50%, #EDE0C8 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brown-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brown-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brown-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brown-500/10 text-brown-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-brown-200">
              <Zap size={14} className="text-brown-500" />
              AI-Powered Onboarding Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brown-900 leading-tight mb-6">
              Onboard new hires in{' '}
              <span className="text-brown-500 relative">
                48 hours
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6">
                  <path d="M0 5 Q100 0 200 5" stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
                </svg>
              </span>
              , not weeks
            </h1>

            <p className="text-lg sm:text-xl text-brown-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              OnboardEase uses document intelligence to auto-generate role-specific task plans, and pairs each hire with an AI-matched mentor — so your team spends zero time on manual setup.
            </p>

            {/* Highlights */}
            <ul className="flex flex-col sm:flex-row flex-wrap gap-3 mb-10 justify-center lg:justify-start">
              {highlights.map(h => (
                <li key={h} className="flex items-center gap-2 text-brown-700 text-sm font-medium">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/setup"
                className="btn-primary inline-flex items-center justify-center gap-2 text-base"
              >
                Start Free Trial
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/new-hire"
                className="btn-secondary inline-flex items-center justify-center gap-2 text-base"
              >
                View Demo
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-8 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['#8B4513', '#A0724A', '#C49A6C', '#D2B48C'].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: color }}
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-brown-500">500+ startups onboarded</p>
              </div>
            </div>
          </div>

          {/* Right: Visual mockup */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
            {/* Main dashboard mockup */}
            <div className="bg-white rounded-2xl shadow-2xl border border-brown-200 overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-brown-50 border-b border-brown-100">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-3 bg-brown-100 rounded-md px-3 py-0.5 text-xs text-brown-500 flex-1 max-w-[200px]">
                  app.onboardease.com
                </div>
              </div>

              <div className="p-5">
                {/* Welcome banner */}
                <div className="bg-gradient-to-r from-brown-500 to-brown-700 rounded-xl p-4 text-white mb-4">
                  <p className="text-xs opacity-80 mb-1">Day 1 of your journey 🎉</p>
                  <h3 className="font-bold text-lg">Welcome, Jordan!</h3>
                  <p className="text-sm opacity-90 mt-1">3 tasks completed · 12 remaining</p>
                  <div className="mt-3 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '20%' }} />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-brown-50 rounded-xl p-3 text-center border border-brown-100">
                      <p className="text-brown-500 mb-1 flex justify-center">{stat.icon}</p>
                      <p className="font-bold text-brown-900 text-base">{stat.value}</p>
                      <p className="text-xs text-brown-500 leading-tight">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Task list */}
                <div className="space-y-2">
                  {[
                    { label: 'Complete company overview', done: true },
                    { label: 'Set up Slack workspace', done: true },
                    { label: 'Meet your buddy — Sarah', done: false, active: true },
                    { label: 'Review team handbook', done: false },
                  ].map((task, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        task.active
                          ? 'border-brown-300 bg-brown-50'
                          : 'border-brown-100 bg-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        task.done ? 'bg-green-500' : task.active ? 'bg-brown-500' : 'border-2 border-brown-200'
                      }`}>
                        {task.done && <CheckCircle size={12} className="text-white" />}
                        {task.active && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={`text-sm ${
                        task.done ? 'line-through text-brown-400' : 'text-brown-800 font-medium'
                      }`}>
                        {task.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating AI chat bubble */}
            <div className="absolute -bottom-3 -right-4 bg-brown-500 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-xl text-sm max-w-[220px]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">🤖</span>
                </div>
                <span className="font-semibold text-xs">AI Assistant</span>
              </div>
              <p className="text-xs opacity-90">Your next task is ready! Meet Sarah at 2 PM 👋</p>
            </div>

            {/* Floating progress badge */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-xl border border-brown-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-brown-500 font-medium">Setup Complete</p>
                  <p className="text-sm font-bold text-brown-900">Ready in 12 min!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
