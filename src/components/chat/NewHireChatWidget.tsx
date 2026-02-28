import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, User, Sparkles, X } from 'lucide-react'
import { generalChat } from '../../services/aiService'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  ts: string
}

interface Props {
  employeeName: string
  tasksDone: number
  tasksTotal: number
  mentorName: string
  role: string
  day: number
}

const QUICK_PROMPTS = [
  'What should I prioritize this week?',
  'How do I make a good first impression?',
  'Tips for asking for help without seeming lost?',
  'How do I build relationships with my team quickly?',
]

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function NewHireChatWidget({ employeeName, tasksDone, tasksTotal, mentorName, role, day }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const buildContext = () =>
    `You are a helpful onboarding assistant for ${employeeName}, a new ${role} on Day ${day} of onboarding. They've completed ${tasksDone} of ${tasksTotal} tasks. Their mentor is ${mentorName}. Be encouraging, concise, and practical. Max 120 words per response.`

  const send = async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: msg, ts: timestamp() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const reply = await generalChat(msg, buildContext())
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'ai', content: reply, ts: timestamp() }])
    } catch {
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: 'ai', content: 'Sorry, something went wrong. Please try again.', ts: timestamp() }])
    }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-white flex flex-col overflow-hidden" style={{ height: '380px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-teal-100 bg-gradient-to-r from-teal-600 to-teal-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">AI Onboarding Assistant</p>
            <p className="text-xs text-white/60 mt-0.5">Here to help you succeed</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="ml-2 p-1 rounded hover:bg-white/20 text-white/60 hover:text-white transition-colors" title="Clear chat">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-between">
            {/* Welcome bubble */}
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]">
                <p className="text-xs text-teal-800 leading-relaxed">
                  Hi {employeeName.split(' ')[0]}! I'm your AI assistant. I can help with <strong>onboarding tips</strong>, <strong>best practices</strong>, and any <strong>questions about your first 30 days</strong>. What's on your mind?
                </p>
              </div>
            </div>

            {/* Quick prompts */}
            <div className="space-y-1.5 pb-1">
              <p className="text-xs text-brown-400 font-medium flex items-center gap-1"><Sparkles size={11} />Quick questions</p>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => { setInput(p); inputRef.current?.focus() }}
                  className="w-full text-left text-xs text-brown-600 bg-brown-50 hover:bg-brown-100 border border-brown-100 px-3 py-2 rounded-xl transition-colors leading-relaxed"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  m.role === 'ai'
                    ? 'bg-gradient-to-br from-teal-600 to-teal-800'
                    : 'bg-gradient-to-br from-blue-500 to-blue-700'
                }`}>
                  {m.role === 'ai'
                    ? <Bot size={12} className="text-white" />
                    : <User size={12} className="text-white" />
                  }
                </div>
                <div className={`max-w-[82%] ${m.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                  <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-teal-700 text-white rounded-tr-sm'
                      : 'bg-teal-50 border border-teal-100 text-teal-900 rounded-tl-sm'
                  }`}>
                    {m.content.split('\n').map((line, i) => (
                      <span key={i}>{line}{i < m.content.split('\n').length - 1 && <br />}</span>
                    ))}
                  </div>
                  <span className="text-xs text-brown-300 mt-0.5 px-1">{m.ts}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-teal-50 border border-teal-100 rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1.5">
                  <Loader2 size={12} className="text-teal-500 animate-spin" />
                  <span className="text-xs text-teal-600">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-brown-100 px-3 py-2.5 flex gap-2 items-center flex-shrink-0 bg-white">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about your onboarding…"
          disabled={loading}
          className="flex-1 text-xs bg-brown-50 border border-brown-200 rounded-xl px-3 py-2 outline-none focus:border-teal-400 transition-colors disabled:opacity-50 text-brown-800 placeholder-brown-400"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-8 h-8 rounded-xl bg-teal-700 hover:bg-teal-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
        >
          {loading
            ? <Loader2 size={13} className="text-white animate-spin" />
            : <Send size={13} className="text-white" />
          }
        </button>
      </div>
    </div>
  )
}
