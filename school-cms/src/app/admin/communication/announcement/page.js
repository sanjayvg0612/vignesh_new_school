'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ANNOUNCEMENTS } from '@/lib/mockData'
import { PageHeader, Modal, FormField } from '@/components/ui'
import clsx from 'clsx'

export default function AnnouncementPage() {
  const [data, setData] = useState(ANNOUNCEMENTS)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ title:'', content:'',  date:'' })
  const [errors, setErrors] = useState({})

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if(errors[k]) setErrors(p=>({...p,[k]:''})) }
  const closeModal = () => { setModal(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setData(p => [...p, { ...form, id:Date.now(), date: form.date || new Date().toISOString().split('T')[0] }])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete?')) return; setData(p => p.filter(a => a.id !== id)) }

  const priorityColor = { High:'badge-red', Normal:'badge-blue', Low:'badge-gray' }

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Post important announcements for the school community"
        action={<button onClick={() => { setForm({ title:'',content:'',date:'' }); setErrors({}); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> Add Announcement</button>}
      />
      <div className="space-y-3">
        {data.map(a => (
          <div key={a.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* <span className={clsx('badge', priorityColor[a.priority]||'badge-gray')}>{a.priority}</span> */}
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1" style={{fontFamily:'Outfit'}}>{a.title}</h3>
                <p className="text-sm text-gray-500">{a.content}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 shrink-0"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        ))}
        {data.length === 0 && <div className="card p-12 text-center text-sm text-gray-400">No announcements yet</div>}
      </div>
      <Modal open={modalOpen} onClose={closeModal} title="Add Announcement"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Publish</button></>}>
        <div className="space-y-4">
          <FormField label="Title" required>
            <input className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.title} onChange={f('title')} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </FormField>
          <FormField label="Content"><textarea className="input" rows={4} value={form.content} onChange={f('content')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date"><input className="input" type="date" value={form.date} onChange={f('date')} /></FormField>
          </div>
        </div>
      </Modal>
    </div>
  )
}
