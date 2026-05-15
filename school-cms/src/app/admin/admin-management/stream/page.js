'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'
import { streamApi, groupApi, getSchoolId } from '@/lib/api'

const PER_PAGE = 10

const toApiStatus = (s) => s.toLowerCase()
const toUiStatus  = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function StreamPage() {
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
    stream_name: '', stream_code: '', school_group_id: '', status: 'Active',
  })
  const [groups, setGroups]   = useState([])
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchStreams = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await streamApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchStreams() }, [fetchStreams])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = async (stream = null) => {
    setEditing(stream)
    setForm(stream ? {
      stream_name:     stream.stream_name,
      stream_code:     stream.stream_code || '',
      school_group_id: String(stream.school_group_id),
      status:          toUiStatus(stream.status),
    } : { stream_name: '', stream_code: '', school_group_id: '', status: 'Active' })
    setErrors({})
    try {
      const res = await groupApi.dropdown()
      setGroups(res.result || [])
    } catch { setGroups([]) }
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.school_group_id) e.school_group_id = 'Group is required'
    if (!form.stream_name.trim()) e.stream_name = 'Stream name is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      if (editing) {
        await streamApi.update(editing.school_stream_id, {
          stream_name:     form.stream_name,
          school_group_id: parseInt(form.school_group_id, 10) || undefined,
          status:          toApiStatus(form.status),
        })
      } else {
        await streamApi.create({
          school_id:       getSchoolId(),
          school_group_id: parseInt(form.school_group_id, 10),
          stream_name:     form.stream_name,
          stream_code:     form.stream_code || undefined,
          status:          toApiStatus(form.status),
        })
      }
      setModal(false)
      fetchStreams()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this stream?')) return
    try {
      await streamApi.delete(id)
      fetchStreams()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Stream"
        subtitle="Manage academic streams"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Stream</button>}
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search streams..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>

        <Table headers={['Sl No.', 'Stream Name', 'Group', 'Status', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr>
              <td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((s, i) => (
            <tr key={s.school_stream_id} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{s.stream_name}</td>
              <td className="table-td">{s.group_name || s.school_group_id}</td>
              <td className="table-td"><StatusBadge status={toUiStatus(s.status)} /></td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(s)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.school_stream_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
        title={editing ? 'Edit Stream' : 'Add Stream'}
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
            onChange={e => { setForm(f => ({ ...f, school_group_id: e.target.value })); if (errors.school_group_id) setErrors(p => ({ ...p, school_group_id: '' })) }}
          >
            <option value="">— Select Group —</option>
            {groups.map(g => (
              <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>
            ))}
          </select>
          {errors.school_group_id && <p className="text-xs text-red-500 mt-1">{errors.school_group_id}</p>}
        </FormField>
        <FormField label="Stream Name" required>
          <input
            className={`input ${errors.stream_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.stream_name}
            onChange={e => { setForm(f => ({ ...f, stream_name: e.target.value })); if (errors.stream_name) setErrors(p => ({ ...p, stream_name: '' })) }}
            placeholder="e.g. Science"
          />
          {errors.stream_name && <p className="text-xs text-red-500 mt-1">{errors.stream_name}</p>}
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
