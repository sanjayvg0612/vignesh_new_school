'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'

const PER_PAGE = 8

const INITIAL = [
  { id: 1, name: 'Dashboard Icon',  category: 'Navigation', icon_value: 'layout-dashboard', status: 'Active' },
  { id: 2, name: 'Student Icon',    category: 'People',     icon_value: 'users',             status: 'Active' },
  { id: 3, name: 'Teacher Icon',    category: 'People',     icon_value: 'graduation-cap',    status: 'Active' },
  { id: 4, name: 'Calendar Icon',   category: 'General',    icon_value: 'calendar',          status: 'Active' },
  { id: 5, name: 'Settings Icon',   category: 'System',     icon_value: 'settings',          status: 'Inactive' },
]

export default function IconPage() {
  const [data, setData]       = useState(INITIAL)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({ name: '', category: '', icon_value: '', status: 'Active' })
  const [errors, setErrors]   = useState({})

  const filtered = data.filter(ic =>
    ic.name.toLowerCase().includes(search.toLowerCase()) ||
    ic.category.toLowerCase().includes(search.toLowerCase()) ||
    ic.icon_value.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const closeModal = () => { setModal(false); setErrors({}) }
  const openAdd  = () => { setEditing(null); setForm({ name: '', category: '', icon_value: '', status: 'Active' }); setErrors({}); setModal(true) }
  const openEdit = (ic) => { setEditing(ic); setForm({ name: ic.name, category: ic.category, icon_value: ic.icon_value, status: ic.status }); setErrors({}); setModal(true) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Icon name is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    if (editing) {
      setData(prev => prev.map(ic => ic.id === editing.id ? { ...ic, ...form } : ic))
    } else {
      setData(prev => [...prev, { ...form, id: Date.now() }])
    }
    setModal(false)
  }

  const handleDelete = (id) => {
    if (!confirm('Delete this icon?')) return
    setData(prev => prev.filter(ic => ic.id !== id))
  }

  return (
    <div>
      <PageHeader title="Icon" subtitle="Manage system icons"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Icon</button>}
      />
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search icons..." />
          <span className="text-sm text-gray-500">{filtered.length} records</span>
        </div>
        <Table headers={['#', 'Name', 'Icon Value', 'Category', 'Status', 'Actions']} empty={rows.length === 0}>
          {rows.map((ic, i) => (
            <tr key={ic.id} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{ic.name}</td>
              <td className="table-td font-mono text-xs text-gray-600">{ic.icon_value}</td>
              <td className="table-td">{ic.category}</td>
              <td className="table-td"><StatusBadge status={ic.status} /></td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(ic)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(ic.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Icon' : 'Add Icon'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}
      >
        <FormField label="Icon Name" required>
          <input className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); if(errors.name) setErrors(p=>({...p,name:''})) }} placeholder="e.g. Dashboard Icon" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </FormField>
        <FormField label="Icon Value">
          <input className="input" value={form.icon_value} onChange={e => setForm(f => ({ ...f, icon_value: e.target.value }))} placeholder="e.g. layout-dashboard" />
        </FormField>
        <FormField label="Category">
          <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Navigation" />
        </FormField>
        <FormField label="Status">
          <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormField>
      </Modal>
    </div>
  )
}
