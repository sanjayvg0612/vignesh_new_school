'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ROLES } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField } from '@/components/ui'

export default function RolesPage() {
  const [data, setData] = useState(ROLES)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', permissions:'', description:'' })
  const [errors, setErrors] = useState({})

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if(errors[k]) setErrors(p=>({...p,[k]:''})) }
  const closeModal = () => { setModal(false); setErrors({}) }
  const openAdd = () => { setEditing(null); setForm({ name:'',permissions:'',description:'' }); setErrors({}); setModal(true) }
  const openEdit = (r) => { setEditing(r); setForm({ name:r.name,permissions:r.permissions,description:r.description }); setErrors({}); setModal(true) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Role name is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    if (editing) setData(p => p.map(r => r.id===editing.id ? {...r,...form} : r))
    else setData(p => [...p, {...form, id:Date.now(), users:0}])
    setModal(false)
  }
  const handleDelete = (id) => { if (!confirm('Delete this role?')) return; setData(p => p.filter(r => r.id !== id)) }

  return (
    <div>
      <PageHeader title="Roles" subtitle="Define admin roles and permission sets"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Role</button>}
      />
      <div className="card">
        <Table headers={['#','Role Name','Permissions','Users','Description','Actions']} empty={data.length===0}>
          {data.map((r,i) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{i+1}</td>
              <td className="table-td"><span className="font-semibold text-primary-700">{r.name}</span></td>
              <td className="table-td text-xs text-gray-500 max-w-xs">{r.permissions}</td>
              <td className="table-td"><span className="badge badge-blue">{r.users} users</span></td>
              <td className="table-td text-gray-500 text-sm">{r.description}</td>
              <td className="table-td"><div className="flex gap-1">
                <button onClick={()=>openEdit(r)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5"/></button>
                <button onClick={()=>handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
              </div></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={closeModal} title={editing?'Edit Role':'Add Role'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Role Name" required>
            <input className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.name} onChange={f('name')} placeholder="Admin" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </FormField>
          <FormField label="Permissions"><textarea className="input" rows={2} value={form.permissions} onChange={f('permissions')} placeholder="Students, Teachers, Fees..." /></FormField>
          <FormField label="Description"><input className="input" value={form.description} onChange={f('description')} /></FormField>
        </div>
      </Modal>
    </div>
  )
}
