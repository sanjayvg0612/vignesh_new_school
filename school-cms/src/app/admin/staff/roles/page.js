'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { PageHeader, Table, Modal, FormField } from '@/components/ui'
import { roleApi } from '@/lib/api'

export default function StaffRolesPage() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({ role_name: '', is_active: true })
  const [errors, setErrors]   = useState({})

  const fetchRoles = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await roleApi.list()
      setData(res.result?.data || res.result || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = (item = null) => {
    setEditing(item)
    setForm(item
      ? { role_name: item.role_name || '', is_active: item.is_active ?? true }
      : { role_name: '', is_active: true })
    setErrors({})
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.role_name.trim()) e.role_name = 'Role name is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      if (editing) {
        await roleApi.update(editing.role_id, { role_name: form.role_name, is_active: form.is_active })
      } else {
        await roleApi.create({ role_name: form.role_name, is_active: form.is_active })
      }
      setModal(false)
      fetchRoles()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader
        title="Staff Roles"
        subtitle="Manage roles for staff members"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Role</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <Table headers={['Sl No.', 'Role Name', 'Active', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={4} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((item, i) => (
            <tr key={item.role_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{i + 1}</td>
              <td className="table-td font-medium text-gray-900">{item.role_name}</td>
              <td className="table-td">
                {item.is_active
                  ? <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Yes</span>
                  : <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">No</span>}
              </td>
              <td className="table-td">
                <button onClick={() => openModal(item)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Role' : 'Add Role'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Role Name" required>
          <input
            className={`input ${errors.role_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.role_name}
            onChange={e => { setForm(f => ({ ...f, role_name: e.target.value })); if (errors.role_name) setErrors(p => ({ ...p, role_name: '' })) }}
            placeholder="e.g. Accountant, Librarian, Peon"
          />
          {errors.role_name && <p className="text-xs text-red-500 mt-1">{errors.role_name}</p>}
        </FormField>
        <FormField label="Active">
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Mark as active</span>
          </label>
        </FormField>
      </Modal>
    </div>
  )
}
