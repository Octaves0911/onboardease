import { useState, useRef } from 'react'
import {
  X, Plus, Trash2, CheckCircle,
  Link2, FileText, AlertCircle, FlaskConical, Upload, Edit3
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Task, SupportingLink, Document } from '../../context/AppContext'

const CATEGORIES = ['Setup', 'Learning', 'Technical', 'Compliance', 'People', 'Tools', 'Admin', 'General']
const PRIORITIES: { value: Task['priority']; label: string }[] = [
  { value: 'high',   label: 'High'   },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Low'    },
]

interface EditForm {
  title: string
  description: string
  category: string
  estimatedTime: string
  priority: Task['priority']
  subtasks: { id: string; title: string; status: 'pending' | 'done' }[]
  supportingDocIds: string[]
  supportingLinks: SupportingLink[]
  requiresInput: boolean
  inputPrompt: string
  playgroundEnabled: boolean
}

interface Props {
  task: Task
  onClose: () => void
}

export default function EditTaskModal({ task, onClose }: Props) {
  const { state, dispatch } = useApp()
  const docUploadRef = useRef<HTMLInputElement>(null)

  // Get employee name for display
  const employee = state.employees.find(e => e.id === task.assignedTo)

  // Determine the uploaderId based on who created the task
  const uploaderId = task.assignedBy === 'mentor'
    ? (state.currentUserId ?? task.assignedBy)
    : task.assignedBy

  // Show docs uploaded by the creator + any already-attached docs from other sources
  const creatorDocs      = state.documents.filter(d => d.uploadedBy === uploaderId)
  const attachedFromOthers = state.documents.filter(d =>
    (task.supportingDocs ?? []).includes(d.id) && d.uploadedBy !== uploaderId
  )
  const visibleDocs = [
    ...creatorDocs,
    ...attachedFromOthers.filter(d => !creatorDocs.some(cd => cd.id === d.id)),
  ]

  const [form, setForm] = useState<EditForm>({
    title:            task.title,
    description:      task.description,
    category:         task.category,
    estimatedTime:    task.estimatedTime,
    priority:         task.priority ?? 'medium',
    subtasks:         (task.subtasks ?? []).map(s => ({ id: s.id, title: s.title, status: s.status })),
    supportingDocIds: task.supportingDocs ?? [],
    supportingLinks:  task.supportingLinks ?? [],
    requiresInput:    task.requiresInput ?? false,
    inputPrompt:      task.inputPrompt ?? '',
    playgroundEnabled: task.playgroundEnabled ?? false,
  })

  const [newSubtask,  setNewSubtask]  = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl,   setNewLinkUrl]   = useState('')
  const [formError,    setFormError]    = useState('')
  const [fieldErrors,  setFieldErrors]  = useState<{ title?: string; description?: string; inputPrompt?: string }>({})
  const [saved,        setSaved]        = useState(false)

  // ── Subtask helpers ──
  const addSubtask = () => {
    if (!newSubtask.trim()) return
    setForm(f => ({
      ...f,
      subtasks: [...f.subtasks, { id: `st-edit-${Date.now()}`, title: newSubtask.trim(), status: 'pending' as const }],
    }))
    setNewSubtask('')
  }
  const removeSubtask = (id: string) =>
    setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s.id !== id) }))

  // ── Link helpers ──
  const addLink = () => {
    if (!newLinkUrl.trim()) return
    setForm(f => ({
      ...f,
      supportingLinks: [...f.supportingLinks, { label: newLinkLabel.trim() || newLinkUrl.trim(), url: newLinkUrl.trim() }],
    }))
    setNewLinkLabel('')
    setNewLinkUrl('')
  }
  const removeLink = (i: number) =>
    setForm(f => ({ ...f, supportingLinks: f.supportingLinks.filter((_, idx) => idx !== i) }))

  // ── Doc toggle ──
  const toggleDoc = (id: string) =>
    setForm(f => ({
      ...f,
      supportingDocIds: f.supportingDocIds.includes(id)
        ? f.supportingDocIds.filter(d => d !== id)
        : [...f.supportingDocIds, id],
    }))

  // ── Inline doc upload ──
  const handleInlineDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const docId = `doc-${Date.now()}`
    const reader = new FileReader()
    reader.onload = () => {
      const newDoc: Document = {
        id:         docId,
        name:       file.name,
        type:       file.name.split('.').pop()?.toUpperCase() ?? 'FILE',
        size:       `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status:     'processed',
        uploadedBy: uploaderId ?? task.assignedBy,
        date:       new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        content:    `Document: ${file.name}.`,
        fileData:   reader.result as string,
      }
      dispatch({ type: 'ADD_DOCUMENT', payload: newDoc })
      setForm(f => ({ ...f, supportingDocIds: [...f.supportingDocIds, docId] }))
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ── Save handler ──
  const handleSave = () => {
    const errs: typeof fieldErrors = {}
    if (!form.title.trim())       errs.title       = 'Task title is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (form.requiresInput && !form.inputPrompt.trim())
      errs.inputPrompt = 'Input prompt is required when employee input is enabled.'

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setFormError('Please fill in all required fields before saving.')
      return
    }
    setFieldErrors({})
    setFormError('')

    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: {
          title:            form.title.trim(),
          description:      form.description.trim(),
          category:         form.category,
          estimatedTime:    form.estimatedTime.trim() || '30 min',
          priority:         form.priority,
          subtasks:         form.subtasks,
          supportingDocs:   form.supportingDocIds,
          supportingLinks:  form.supportingLinks,
          requiresInput:    form.requiresInput,
          inputPrompt:      form.requiresInput ? form.inputPrompt.trim() : undefined,
          playgroundEnabled: task.assignedBy === 'mentor' ? form.playgroundEnabled : task.playgroundEnabled,
        },
      },
    })
    setSaved(true)
    setTimeout(() => onClose(), 900)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brown-100 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #EFF8FF 0%, #DBEEFF 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <Edit3 size={16} className="text-brown-600" />
            </div>
            <div>
              <h2 className="font-bold text-brown-900 text-base">Edit Task</h2>
              <p className="text-xs text-brown-500">
                {employee ? `For ${employee.name} · ${employee.role}` : 'Editing task'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 text-brown-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {saved && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle size={13} /> Task updated successfully!
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-brown-600 mb-1.5">Task Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setFieldErrors(fe => ({ ...fe, title: undefined })); setFormError('') }}
              className={`input-field text-sm py-2.5 ${fieldErrors.title ? 'border-red-400 focus:ring-red-300' : ''}`}
            />
            {fieldErrors.title && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertCircle size={11} />{fieldErrors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-brown-600 mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setFieldErrors(fe => ({ ...fe, description: undefined })); setFormError('') }}
              rows={3}
              className={`input-field text-sm py-2.5 resize-none ${fieldErrors.description ? 'border-red-400 focus:ring-red-300' : ''}`}
            />
            {fieldErrors.description && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertCircle size={11} />{fieldErrors.description}</p>}
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
              <input
                type="text"
                value={form.estimatedTime}
                onChange={e => setForm(f => ({ ...f, estimatedTime: e.target.value }))}
                placeholder="30 min"
                className="input-field text-sm py-2.5"
              />
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
            <label className="block text-xs font-semibold text-brown-600 mb-2">
              Subtasks <span className="text-brown-400 font-normal">(optional)</span>
            </label>
            <div className="space-y-1.5 mb-2">
              {form.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 bg-brown-50 rounded-lg px-3 py-2 border border-brown-100">
                  <CheckCircle size={13} className="text-brown-400 flex-shrink-0" />
                  <span className="text-sm text-brown-700 flex-1">{st.title}</span>
                  <button onClick={() => removeSubtask(st.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                placeholder="Add a subtask…"
                className="input-field text-sm py-2 flex-1"
              />
              <button onClick={addSubtask} className="btn-secondary text-sm px-3 py-2 flex items-center gap-1">
                <Plus size={14} />Add
              </button>
            </div>
          </div>

          {/* Supporting Docs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-brown-600">
                Supporting Documents <span className="text-brown-400 font-normal">(optional)</span>
              </label>
              <button
                type="button"
                onClick={() => docUploadRef.current?.click()}
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 border border-teal-200 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Upload size={11} /> Upload &amp; Attach
              </button>
              <input ref={docUploadRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.png,.jpg" onChange={handleInlineDocUpload} />
            </div>
            {visibleDocs.length === 0 ? (
              <div className="border border-dashed border-brown-200 rounded-lg p-4 text-center">
                <p className="text-xs text-brown-400">No documents yet. Upload one above to attach it.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {visibleDocs.map(doc => (
                  <label key={doc.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${form.supportingDocIds.includes(doc.id) ? 'border-brown-400 bg-brown-50' : 'border-brown-100 hover:border-brown-200'}`}>
                    <input
                      type="checkbox"
                      checked={form.supportingDocIds.includes(doc.id)}
                      onChange={() => toggleDoc(doc.id)}
                      className="accent-brown-600"
                    />
                    <FileText size={13} className="text-red-500 flex-shrink-0" />
                    <span className="text-sm text-brown-700 truncate flex-1">{doc.name}</span>
                    <span className="text-xs text-brown-400">{doc.type}</span>
                    {form.supportingDocIds.includes(doc.id) && (
                      <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Attached</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Supporting Links */}
          <div>
            <label className="block text-xs font-semibold text-brown-600 mb-2">
              Supporting Links <span className="text-brown-400 font-normal">(optional)</span>
            </label>
            <div className="space-y-1.5 mb-2">
              {form.supportingLinks.map((lnk, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  <Link2 size={13} className="text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-blue-700 flex-1 truncate">{lnk.label}</span>
                  <button onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLinkLabel}
                onChange={e => setNewLinkLabel(e.target.value)}
                placeholder="Label (optional)"
                className="input-field text-sm py-2 w-32 flex-shrink-0"
              />
              <input
                type="text"
                value={newLinkUrl}
                onChange={e => setNewLinkUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLink()}
                placeholder="https://…"
                className="input-field text-sm py-2 flex-1"
              />
              <button onClick={addLink} className="btn-secondary text-sm px-3 py-2 flex items-center gap-1">
                <Plus size={14} />Add
              </button>
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
                  onChange={e => { setForm(f => ({ ...f, inputPrompt: e.target.value })); setFieldErrors(fe => ({ ...fe, inputPrompt: undefined })); setFormError('') }}
                  placeholder="What should the employee write or submit? e.g. 'Describe 3 things you learned…'"
                  rows={2}
                  className={`input-field text-sm py-2 resize-none ${fieldErrors.inputPrompt ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
                {fieldErrors.inputPrompt && <p className="flex items-center gap-1 text-xs text-red-600 mt-1"><AlertCircle size={11} />{fieldErrors.inputPrompt}</p>}
              </div>
            )}
          </div>

          {/* Playground toggle — mentor tasks only */}
          {task.assignedBy === 'mentor' && (
            <div className={`border rounded-xl p-4 transition-colors ${form.playgroundEnabled ? 'bg-teal-50 border-teal-200' : 'bg-brown-50 border-brown-200'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, playgroundEnabled: !f.playgroundEnabled }))}
                  className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 relative cursor-pointer ${form.playgroundEnabled ? 'bg-teal-500' : 'bg-brown-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.playgroundEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <FlaskConical size={15} className={form.playgroundEnabled ? 'text-teal-600' : 'text-brown-400'} />
                  <div>
                    <p className="text-sm font-semibold text-brown-800">Enable Playground</p>
                    <p className="text-xs text-brown-500">Mentee can try this task freely without it affecting official progress</p>
                  </div>
                </div>
              </label>
            </div>
          )}

          {formError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              {formError}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-3 px-6 py-4 border-t border-brown-100 flex-shrink-0 bg-brown-50/30">
          <button onClick={onClose} className="flex-1 btn-secondary text-sm py-2.5">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <CheckCircle size={15} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
