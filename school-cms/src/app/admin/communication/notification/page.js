'use client'
import { useState } from 'react'
import { Plus, Trash2, Send } from 'lucide-react'
import { NOTIFICATIONS } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField } from '@/components/ui'
import clsx from 'clsx'

export default function NotificationPage() {
  const [data, setData] = useState(NOTIFICATIONS)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ title:'', message:'', type:'Info', sent_to:'All' })
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
    setData(p => [...p, { ...form, id:Date.now(), date:new Date().toISOString().split('T')[0], sent:false }])
    setModal(false)
  }
  const handleSend = (id) => setData(p => p.map(n => n.id===id ? {...n,sent:true} : n))
  const handleDelete = (id) => { if (!confirm('Delete?')) return; setData(p => p.filter(n => n.id !== id)) }

  const typeColor = { Info:'badge-blue', Warning:'badge-yellow', Alert:'badge-red', Success:'badge-green' }

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send push notifications to students, parents and staff"
        action={<button onClick={() => { setForm({ title:'',message:'',type:'Info',sent_to:'All' }); setErrors({}); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> New Notification</button>}
      />
      <div className="card">
        <Table headers={['#','Title','Message','Type','Sent To','Date','Status','Actions']} empty={data.length===0}>
          {data.map((n,i) => (
            <tr key={n.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{i+1}</td>
              <td className="table-td font-medium">{n.title}</td>
              <td className="table-td text-xs text-gray-500 max-w-xs truncate">{n.message}</td>
              <td className="table-td"><span className={clsx('badge', typeColor[n.type]||'badge-gray')}>{n.type}</span></td>
              <td className="table-td">{n.sent_to}</td>
              <td className="table-td">{n.date}</td>
              <td className="table-td"><span className={clsx('badge', n.sent?'badge-green':'badge-yellow')}>{n.sent?'Sent':'Draft'}</span></td>
              <td className="table-td"><div className="flex gap-1">
                {!n.sent && <button onClick={()=>handleSend(n.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Send"><Send className="w-3.5 h-3.5"/></button>}
                <button onClick={()=>handleDelete(n.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
              </div></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={closeModal} title="New Notification"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save as Draft</button></>}>
        <div className="space-y-4">
          <FormField label="Title" required>
            <input className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.title} onChange={f('title')} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </FormField>
          <FormField label="Message"><textarea className="input" rows={3} value={form.message} onChange={f('message')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type">
              <select className="input" value={form.type} onChange={f('type')}><option>Info</option><option>Warning</option><option>Alert</option><option>Success</option></select>
            </FormField>
            <FormField label="Send To">
              <select className="input" value={form.sent_to} onChange={f('sent_to')}><option>All</option><option>Students</option><option>Parents</option><option>Teachers</option><option>Staff</option></select>
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  )
}
