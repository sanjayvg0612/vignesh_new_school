'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { EVENTS } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField, StatusBadge } from '@/components/ui'

export default function EventPage() {
  const [data, setData] = useState(EVENTS)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ title:'', date:'', venue:'', organizer:'', status:'Upcoming' })
  const [errors, setErrors] = useState({})

  const closeModal = () => { setModal(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Event title is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setData(p => [...p, { ...form, id: Date.now() }])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete this event?')) return; setData(p => p.filter(e => e.id !== id)) }

  return (
    <div>
      <PageHeader title="Events" subtitle="Manage school events and activities"
        action={<button onClick={() => { setForm({ title:'',date:'',venue:'',organizer:'',status:'Upcoming' }); setErrors({}); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> Add Event</button>}
      />
      <div className="card">
        <Table headers={['#','Title','Date','Venue','Organizer','Status','Actions']} empty={data.length===0}>
          {data.map((e,i) => (
            <tr key={e.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{i+1}</td>
              <td className="table-td font-medium text-gray-900">{e.title}</td>
              <td className="table-td">{e.date}</td>
              <td className="table-td">{e.venue}</td>
              <td className="table-td">{e.organizer}</td>
              <td className="table-td"><StatusBadge status={e.status} /></td>
              <td className="table-td"><button onClick={()=>handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={closeModal} title="Add Event"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Event Title" required>
            <input className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.title} onChange={e => { setForm({...form,title:e.target.value}); if(errors.title) setErrors(p=>({...p,title:''})) }} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </FormField>
          <FormField label="Date"><input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></FormField>
          <FormField label="Venue"><input className="input" value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} /></FormField>
          <FormField label="Organizer"><input className="input" value={form.organizer} onChange={e=>setForm({...form,organizer:e.target.value})} /></FormField>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Upcoming</option><option>Completed</option><option>Cancelled</option></select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
