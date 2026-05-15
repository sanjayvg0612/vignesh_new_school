'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ADMINS } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField, StatusBadge } from '@/components/ui'

export default function AdminsPage() {
  const [data, setData] = useState(ADMINS)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', email:'', phone:'', role:'Admin', status:'Active' })
  const [errors, setErrors] = useState({})

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if(errors[k]) setErrors(p=>({...p,[k]:''})) }
  const closeModal = () => { setModal(false); setErrors({}) }
  const openAdd = () => { setEditing(null); setForm({ name:'',email:'',phone:'',role:'Admin',status:'Active' }); setErrors({}); setModal(true) }
  const openEdit = (a) => { setEditing(a); setForm({ name:a.name,email:a.email,phone:a.phone,role:a.role,status:a.status }); setErrors({}); setModal(true) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    if (editing) setData(p => p.map(a => a.id===editing.id ? {...a,...form} : a))
    else setData(p => [...p, {...form, id:Date.now(), last_login:'—'}])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete this admin?')) return; setData(p => p.filter(a => a.id !== id)) }

  return (
    <div>
      <PageHeader title="Admins" subtitle="Manage admin user accounts"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Admin</button>}
      />
      <div className="card">
        <Table headers={['#','Name','Email','Phone','Role','Last Login','Status','Actions']} empty={data.length===0}>
          {data.map((a,i) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{i+1}</td>
              <td className="table-td font-medium">{a.name}</td>
              <td className="table-td">{a.email}</td>
              <td className="table-td">{a.phone}</td>
              <td className="table-td"><span className="badge badge-purple">{a.role}</span></td>
              <td className="table-td text-xs text-gray-400">{a.last_login}</td>
              <td className="table-td"><StatusBadge status={a.status} /></td>
              <td className="table-td"><div className="flex gap-1">
                <button onClick={()=>openEdit(a)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5"/></button>
                <button onClick={()=>handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
              </div></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={closeModal} title={editing?'Edit Admin':'Add Admin'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Full Name" required>
            <input className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.name} onChange={f('name')} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </FormField>
          <FormField label="Email" required>
            <input className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`} type="email" value={form.email} onChange={f('email')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </FormField>
          <FormField label="Phone"><input className="input" value={form.phone} onChange={f('phone')} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Role">
              <select className="input" value={form.role} onChange={f('role')}><option>Super Admin</option><option>Admin</option><option>Moderator</option></select>
            </FormField>
            <FormField label="Status">
              <select className="input" value={form.status} onChange={f('status')}><option>Active</option><option>Inactive</option></select>
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  )
}
