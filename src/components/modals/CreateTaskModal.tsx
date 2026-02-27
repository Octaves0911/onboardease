import { useState } from 'react'
import {
  X, Plus, Trash2, Bot, Send, CheckCircle, Sparkles,
  Link2, FileText, AlertCircle, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Employee, Task, SubTask, SupportingLink } from '../../context/AppContext'
import { suggestTasksForEmployee } from '../../services/aiService'
import type { SuggestedTask } from '../../services/aiService'

interface Props {
  employee: Employee
  onClose: () => void
}

const CATEGORIES = ['Setup', 'Learning', 'Technical', 'Compliance', 'People', 'Tools', 'Admin', 'General']
const PRIORITIES: { value: Task['priority']; label: string; color: string }[] = [
  { value: 'high',   label: 'High',   color: 'text-red-600 bg-red-50 border-red-200'    },
  { value: 'medium', label: 'Medium', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 'low',    label: 'Low',    color: 'text-green-600 bg-green-50 border-green-200' },
]

type Mode = 'manual' | 'ai'

// ─── Manual form state ─────────────────────────────────────────────────────────
interface ManualForm {
  title: string
  description: string
  category: string
  estimatedTime: string
  priority: Task['priority']
  subtasks: string[]
  supportingDocIds: string[]
  supportingLinks: { label: string; url: string }[]
  requiresInput: boolean
  inputPrompt: string
}

function emptyForm(): ManualForm {
  return {
    title: '', description: '', category: 'General', estimatedTime: '30 min',
    priority: 'medium', subtasks: [], supportingDocIds: [],
    supportingLinks: [], requiresInput: false, inputPrompt: '',
  }
}

export default function CreateTaskModal({ employee, onClose }: Props) {
  const { state, dispatch } = useApp()
  const [mode, setMode] = useState<Mode>('manual')

  // ── Manual state ──
  const [form, setForm] = useState<ManualForm>(emptyForm())
  const [newSubtask, setNewSubtask] = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl, setNewLinkUrl]   = useState('')
  const [formError, setFormError]     = useState('')

  // ── AI state ──
  const [aiPrompt, setAiPrompt]         = useState('')
  const [aiLoading, setAiLoading]       = useState(false)
  const [suggestions, setSuggestions]   = useState<SuggestedTask[]>([])
  const [expanded, setExpanded]         = useState<Record<number, boolean>>({})
  const [aiError, setAiError]           = useState('')
  const [aiAsked, setAiAsked]           = useState(false)

  // ── Manual helpers ──
  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setForm(f => ({ ...f, subtasks: [...f.subtasks, newSubtask.trim()] }))
    setNewSubtask('')
  }

  const removeSubtask = (i: number) =>
    setForm(f => ({ ...f, subtasks: f.subtasks.filter((_, idx) => idx !== i) }))

  const addLink = () => {
    if (!newLinkUrl.trim()) return
    setForm(f => ({ ...f, supportingLinks: [...f.supportingLinks, { label: newLinkLabel.trim() || newLinkUrl.trim(), url: newLinkUrl.trim() }] }))
    setNewLinkLabel(''); setNewLinkUrl('')
  }

  const removeLink = (i: number) =>
    setForm(f => ({ ...f, supportingLinks: f.supportingLinks.filter((_, idx) => idx !== i) }))

  const toggleDoc = (id: string) =>
    setForm(f => ({
      ...f,
      supportingDocIds: f.supportingDocIds.includes(id)
        ? f.supportingDocIds.filter(d => d !== id)
        : [...f.supportingDocIds, id],
    }))

  const submitManual = () => {
    if (!form.title.trim()) { setFormError('Task title is required.'); return }
    if (!form.description.trim()) { setFormError('Description is required.'); return }
    if (form.requiresInput && !form.inputPrompt.trim()) { setFormError('Please add a prompt for the employee input.'); return }
    setFormError('')

    const task: Task = {
      id: `task-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      estimatedTime: form.estimatedTime.trim() || '30 min',
      priority: form.priority,
      assignedTo: employee.id,
      assignedBy: 'admin',
      assignedByName: 'Admin',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      subtasks: form.subtasks.map((t, i) => ({ id: `st-${Date.now()}-${i}`, title: t, status: 'pending' })),
      supportingDocs: form.supportingDocIds,
      supportingLinks: form.supportingLinks,
      requiresInput: form.requiresInput,
      inputPrompt: form.requiresInput ? form.inputPrompt.trim() : undefined,
    }
    dispatch({ type: 'ADD_TASK', payload: task })
    onClose()
  }

  // ── AI helpers ──
  const askAI = async () => {
    if (!aiPrompt.trim() || aiLoading) return
    setAiLoading(true)
    setAiError('')
    setSuggestions([])
    setAiAsked(true)
    try {
      const docCtx = state.documents.slice(0, 2).map(d => d.content).join(' ')
      const results = await suggestTasksForEmployee(employee.role, employee.name, aiPrompt.trim(), docCtx)
      setSuggestions(results)
      setExpanded(Object.fromEntries(results.map((_, i) => [i, true])))
    } catch {
      setAiError('AI suggestion failed. Please try again.')
    }
    setAiLoading(false)
  }

  const assignSuggestion = (s: SuggestedTask) => {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: s.title,
      description: s.description,
      category: s.category,
      estimatedTime: s.estimatedTime,
      priority: s.priority,
      assignedTo: employee.id,
      assignedBy: 'admin',
      assignedByName: 'Admin',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      subtasks: (s.subtasks ?? []).map((st, i) => ({ id: `st-${Date.now()}-${i}`, title: st.title, status: 'pending' as const })),
      requiresInput: s.requiresInput,
      inputPrompt: s.requiresInput ? s.inputPrompt : undefined,
    }
    dispatch({ type: 'ADD_TASK', payload: task })
  }

  const assignAllSuggestions = () => {
    suggestions.forEach(s => assignSuggestion(s))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brown-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: employee.color }}
            >
              {employee.initials}
            </div>
            <div>
              <h2 className="font-bold text-brown-900 text-base">Create Task</h2>
              <p className="text-xs text-brown-500">For {employee.name} · {employee.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brown-100 text-brown-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Mode tabs ── */}
        <div className="flex border-b border-brown-100 flex-shrink-0">
          {([['manual', 'Manual'], ['ai', 'AI Assisted']] as [Mode, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                mode === m
                  ? 'border-b-2 border-brown-600 text-brown-900'
                  : 'text-brown-400 hover:text-brown-600'
              }`}
            >
              {m === 'ai' && <Sparkles size={14} />}
              {label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ──────── MANUAL MODE ──────── */}
          {mode === 'manual' && (
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-brown-600 mb-1.5">Task Title *</label>
                <input
                  type="text" value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setFormError('') }}
                  placeholder="e.g. Complete security training"
                  className="input-field text-sm py-2.5"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-brown-600 mb-1.5">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setFormError('') }}
                  placeholder="What should the employee do and why?"
                  rows={3}
                  className="input-field text-sm py-2.5 resize-none"
                />
              </div>

              {/* Category + Time + Priority */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brown-600 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field text-sm py-2.5">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brown-600 mb-1.5">Est. Time</label>
                  <input type="text" value={form.estimatedTime} onChange={e => setForm(f => ({ ...f, estimatedTime: e.target.value }))} placeholder="30 min" className="input-field text-sm py-2.5" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brown-600 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))} className="input-field text-sm py-2.5">
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="block text-xs font-semibold text-brown-600 mb-2">Subtasks <span className="text-brown-400 font-normal">(optional)</span></label>
                <div className="space-y-1.5 mb-2">
                  {form.subtasks.map((st, i) => (
                    <div key={i} className="flex items-center gap-2 bg-brown-50 rounded-lg px-3 py-2 border border-brown-100">
                      <CheckCircle size={13} className="text-brown-400 flex-shrink-0" />
                      <span className="text-sm text-brown-700 flex-1">{st}</span>
                      <button onClick={() => removeSubtask(i)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSubtask()}
                    placeholder="Add a subtask…"
                    className="input-field text-sm py-2 flex-1"
                  />
                  <button onClick={addSubtask} className="btn-secondary text-sm px-3 py-2 flex items-center gap-1"><Plus size={14} />Add</button>
                </div>
              </div>

              {/* Supporting Docs */}
              {state.documents.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-brown-600 mb-2">Supporting Documents <span className="text-brown-400 font-normal">(optional)</span></label>
                  <div className="space-y-1.5">
                    {state.documents.map(doc => (
                      <label key={doc.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${form.supportingDocIds.includes(doc.id) ? 'border-brown-400 bg-brown-50' : 'border-brown-100 hover:border-brown-200'}`}>
                        <input type="checkbox" checked={form.supportingDocIds.includes(doc.id)} onChange={() => toggleDoc(doc.id)} className="accent-brown-600" />
                        <FileText size={13} className="text-red-500 flex-shrink-0" />
                        <span className="text-sm text-brown-700 truncate flex-1">{doc.name}</span>
                        <span className="text-xs text-brown-400">{doc.type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting Links */}
              <div>
                <label className="block text-xs font-semibold text-brown-600 mb-2">Supporting Links <span className="text-brown-400 font-normal">(optional)</span></label>
                <div className="space-y-1.5 mb-2">
                  {form.supportingLinks.map((lnk, i) => (
                    <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <Link2 size={13} className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-blue-700 flex-1 truncate">{lnk.label}</span>
                      <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="Label (optional)" className="input-field text-sm py-2 w-32 flex-shrink-0" />
                  <input type="text" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addLink()} placeholder="https://…" className="input-field text-sm py-2 flex-1" />
                  <button onClick={addLink} className="btn-secondary text-sm px-3 py-2 flex items-center gap-1"><Plus size={14} />Add</button>
                </div>
              </div>

              {/* Requires Input */}
              <div className="bg-brown-50 border border-brown-200 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <div
                    onClick={() => setForm(f => ({ ...f, requiresInput: !f.requiresInput }))}
                    className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 relative cursor-pointer ${form.requiresInput ? 'bg-brown-600' : 'bg-brown-200'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.requiresInput ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brown-800">Requires Employee Input</p>
                    <p className="text-xs text-brown-500">Employee must submit a written response to complete this task</p>
                  </div>
                </label>
                {form.requiresInput && (
                  <div>
                    <label className="block text-xs font-semibold text-brown-600 mb-1.5">Input Prompt *</label>
                    <textarea
                      value={form.inputPrompt}
                      onChange={e => { setForm(f => ({ ...f, inputPrompt: e.target.value })); setFormError('') }}
                      placeholder="What should the employee write or submit? e.g. 'Describe 3 things you learned…'"
                      rows={2}
                      className="input-field text-sm py-2 resize-none"
                    />
                  </div>
                )}
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={13} />
                  {formError}
                </div>
              )}
            </div>
          )}

          {/* ──────── AI ASSISTED MODE ──────── */}
          {mode === 'ai' && (
            <div className="p-6 space-y-5">
              {/* Prompt */}
              <div>
                <label className="block text-xs font-semibold text-brown-600 mb-1.5">What tasks should be created?</label>
                <div className="flex gap-2">
                  <textarea
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI() }}}
                    placeholder={`e.g. "Create 3 technical setup tasks for a new ${employee.role.toLowerCase()}" or "Day 1 compliance checklist"`}
                    rows={2}
                    className="input-field text-sm py-2.5 resize-none flex-1"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={askAI}
                    disabled={!aiPrompt.trim() || aiLoading}
                    className="btn-primary px-4 py-2.5 flex items-center gap-2 self-start flex-shrink-0 disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {aiLoading ? 'Thinking…' : 'Generate'}
                  </button>
                </div>
                <p className="text-xs text-brown-400 mt-1.5">Press Enter or click Generate. AI uses {employee.name}'s role and your company documents as context.</p>
              </div>

              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2">
                {[
                  `3 technical tasks for ${employee.role}`,
                  'Day 1 onboarding checklist',
                  'Compliance & policy tasks',
                  'Tools & access setup',
                ].map(p => (
                  <button
                    key={p}
                    onClick={() => setAiPrompt(p)}
                    className="text-xs bg-brown-50 text-brown-600 border border-brown-200 px-3 py-1.5 rounded-full hover:bg-brown-100 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {aiError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={13} />{aiError}
                </div>
              )}

              {/* Loading skeleton */}
              {aiLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card animate-pulse">
                      <div className="h-4 bg-brown-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-brown-50 rounded w-full mb-1" />
                      <div className="h-3 bg-brown-50 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-brown-900">{suggestions.length} tasks suggested</p>
                    <button
                      onClick={assignAllSuggestions}
                      className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <Plus size={13} /> Assign All to {employee.name.split(' ')[0]}
                    </button>
                  </div>
                  {suggestions.map((s, i) => (
                    <div key={i} className="card border border-brown-200">
                      {/* Task header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-brown-900 text-sm">{s.title}</p>
                            {s.priority && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITIES.find(p => p.value === s.priority)?.color ?? ''}`}>
                                {s.priority}
                              </span>
                            )}
                            {s.requiresInput && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                <AlertCircle size={10} /> Requires input
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-brown-500 mt-0.5">{s.category} · {s.estimatedTime}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => setExpanded(ex => ({ ...ex, [i]: !ex[i] }))}
                            className="p-1.5 rounded-lg hover:bg-brown-50 text-brown-400"
                          >
                            {expanded[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            onClick={() => { assignSuggestion(s); setSuggestions(prev => prev.filter((_, idx) => idx !== i)) }}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                          >
                            <Plus size={12} /> Assign
                          </button>
                        </div>
                      </div>

                      {expanded[i] && (
                        <div className="space-y-3 border-t border-brown-100 pt-3 mt-1">
                          <p className="text-xs text-brown-600 leading-relaxed">{s.description}</p>

                          {s.subtasks && s.subtasks.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-brown-500 mb-1.5">Subtasks ({s.subtasks.length})</p>
                              <div className="space-y-1">
                                {s.subtasks.map((st, j) => (
                                  <div key={j} className="flex items-center gap-2 text-xs text-brown-600">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-brown-300 flex-shrink-0" />
                                    {st.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {s.requiresInput && s.inputPrompt && (
                            <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                              <p className="text-xs font-semibold text-purple-700 mb-0.5 flex items-center gap-1"><AlertCircle size={11} />Employee Input Required</p>
                              <p className="text-xs text-purple-600">{s.inputPrompt}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {aiAsked && !aiLoading && suggestions.length === 0 && !aiError && (
                <div className="text-center py-8 text-brown-400">
                  <Bot size={28} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No suggestions generated. Try a different prompt.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-brown-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 btn-secondary py-2.5 text-sm">Cancel</button>
          {mode === 'manual' && (
            <button onClick={submitManual} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
              <Plus size={15} /> Create Task
            </button>
          )}
          {mode === 'ai' && suggestions.length > 0 && (
            <button onClick={assignAllSuggestions} className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2">
              <Sparkles size={15} /> Assign All ({suggestions.length})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
