'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'
import { classApi, groupApi, getSchoolId } from '@/lib/api'

const PER_PAGE = 10

const toApiStatus = (s) => s.toLowerCase()
const toUiStatus  = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function ClassPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({
    class_name: '', class_code: '', school_group_id: '', status: 'Active',
  })
  const [groups, setGroups] = useState([])
  const [errors, setErrors] = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await classApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = async (cls = null) => {
    setEditing(cls)
    const groupId = cls ? String(cls.school_group_id || cls.group_id || '') : ''
    setForm(cls ? {
      class_name:      cls.class_name  || '',
      class_code:      cls.class_code,
      school_group_id: groupId,
      status:          toUiStatus(cls.status),
    } : { class_name: '', class_code: '', school_group_id: '', status: 'Active' })
    setErrors({})
    try {
      const groupRes = await groupApi.dropdown()
      setGroups(Array.isArray(groupRes.result) ? groupRes.result : [])
    } catch { setGroups([]) }
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.school_group_id) e.school_group_id = 'Group is required'
    if (!form.class_code.trim()) e.class_code = 'Class code is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      if (editing) {
        await classApi.update(editing.class_id, {
          class_name:      form.class_name     || undefined,
          class_code:      form.class_code,
          school_group_id: parseInt(form.school_group_id, 10) || undefined,
          status:          toApiStatus(form.status),
        })
      } else {
        await classApi.create({
          school_id:       getSchoolId(),
          school_group_id: parseInt(form.school_group_id, 10),
          class_name:      form.class_name     || undefined,
          class_code:      form.class_code,
          status:          toApiStatus(form.status),
        })
      }
      setModal(false)
      fetchClasses()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return
    try {
      await classApi.delete(id)
      fetchClasses()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Class"
        subtitle="Manage school classes"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Class</button>}
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search classes..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>

        <Table headers={['Sl No.','Class Code','Group', 'Status', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr>
              <td colSpan={5} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((c, i) => (
            <tr key={c.class_id} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-mono text-sm font-medium text-gray-900">{c.class_code}</td>
              <td className="table-td">{c.group_name  || c.school_group_id}</td>
              <td className="table-td"><StatusBadge status={toUiStatus(c.status)} /></td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(c)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.class_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
        title={editing ? 'Edit Class' : 'Add Class'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <FormField label="Group" required>
          <select
            className={`input ${errors.school_group_id ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.school_group_id}
            onChange={e => {
              setForm(f => ({ ...f, school_group_id: e.target.value }))
              if (errors.school_group_id) setErrors(p => ({ ...p, school_group_id: '' }))
            }}
          >
            <option value="">— Select Group —</option>
            {groups.map(g => (
              <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>
            ))}
          </select>
          {errors.school_group_id && <p className="text-xs text-red-500 mt-1">{errors.school_group_id}</p>}
        </FormField>
        <FormField label="Class Code" required>
          <input
            className={`input ${errors.class_code ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.class_code}
            onChange={e => { setForm(f => ({ ...f, class_code: e.target.value })); if (errors.class_code) setErrors(p => ({ ...p, class_code: '' })) }}
            placeholder="e.g. 10"
          />
          {errors.class_code && <p className="text-xs text-red-500 mt-1">{errors.class_code}</p>}
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
