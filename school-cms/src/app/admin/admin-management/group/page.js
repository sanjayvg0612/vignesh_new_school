'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'
import { groupApi, getSchoolId } from '@/lib/api'

const PER_PAGE = 10

// API uses "active"/"inactive", UI shows "Active"/"Inactive"
const toApiStatus = (s) => s.toLowerCase()
const toUiStatus  = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function GroupPage() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [modalOpen, setModal]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState({ group_name: '', status: 'Active' })
  const [errors, setErrors]     = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await groupApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const closeModal = () => { setModal(false); setErrors({}) }

  const openAdd = () => {
    setEditing(null)
    setForm({ group_name: '', status: 'Active' })
    setErrors({})
    setModal(true)
  }

  const openEdit = (g) => {
    setEditing(g)
    setForm({ group_name: g.group_name, status: toUiStatus(g.status) })
    setErrors({})
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.group_name.trim()) e.group_name = 'Group name is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      if (editing) {
        await groupApi.update(editing.school_group_id, {
          group_name: form.group_name,
          status: toApiStatus(form.status),
        })
      } else {
        await groupApi.create({
          school_id: getSchoolId(),
          group_name: form.group_name,
          status: toApiStatus(form.status),
        })
      }
      setModal(false)
      fetchGroups()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this group?')) return
    try {
      await groupApi.delete(id)
      fetchGroups()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Group"
        subtitle="Manage student groups"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Group</button>}
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search groups..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>

        <Table headers={['Sl No.', 'Group Name', 'Status', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr>
              <td colSpan={4} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((g, i) => (
            <tr key={g.school_group_id} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{g.group_name}</td>
              <td className="table-td"><StatusBadge status={toUiStatus(g.status)} /></td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(g)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(g.school_group_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Group' : 'Add Group'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <FormField label="Group Name" required>
          <input
            className={`input ${errors.group_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.group_name}
            onChange={e => { setForm(f => ({ ...f, group_name: e.target.value })); if (errors.group_name) setErrors(p => ({ ...p, group_name: '' })) }}
            placeholder="e.g. Primary"
          />
          {errors.group_name && <p className="text-xs text-red-500 mt-1">{errors.group_name}</p>}
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
