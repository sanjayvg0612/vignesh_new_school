'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { NOTICES } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField } from '@/components/ui'

export default function NoticePage() {
  const [data, setData] = useState(NOTICES)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ title:'', content:'', target:'All', date:'' })
  const [errors, setErrors] = useState({})

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
    setData(p => [...p, { ...form, id: Date.now(), date: form.date || new Date().toISOString().split('T')[0] }])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete this notice?')) return; setData(p => p.filter(n => n.id !== id)) }

  const targetColor = { All: 'badge-purple', Parents: 'badge-blue', Students: 'badge-green', Teachers: 'badge-orange' }

  return (
    <div>
      <PageHeader title="Notice" subtitle="Publish notices to students, teachers and parents"
        action={<button onClick={() => { setForm({ title:'',content:'',target:'All',date:'' }); setErrors({}); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> Add Notice</button>}
      />
      <div className="card">
        <Table headers={['#','Title','Target','Date','Actions']} empty={data.length===0}>
          {data.map((n,i) => (
            <tr key={n.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{i+1}</td>
              <td className="table-td font-medium text-gray-900">{n.title}</td>
              <td className="table-td"><span className={`badge ${targetColor[n.target] || 'badge-gray'}`}>{n.target}</span></td>
              <td className="table-td">{n.date}</td>
              <td className="table-td"><button onClick={()=>handleDelete(n.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={closeModal} title="Add Notice"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Publish</button></>}>
        <div className="space-y-4">
          <FormField label="Title" required>
            <input className={`input ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.title} onChange={e => { setForm({...form,title:e.target.value}); if(errors.title) setErrors(p=>({...p,title:''})) }} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </FormField>
          <FormField label="Content"><textarea className="input" rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} /></FormField>
          <FormField label="Target Audience">
            <select className="input" value={form.target} onChange={e=>setForm({...form,target:e.target.value})}>
              <option>All</option><option>Students</option><option>Teachers</option><option>Parents</option>
            </select>
          </FormField>
          <FormField label="Date"><input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></FormField>
        </div>
      </Modal>
    </div>
  )
}
