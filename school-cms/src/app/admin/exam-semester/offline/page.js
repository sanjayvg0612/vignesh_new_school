'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField, SearchBar } from '@/components/ui'
import { examApi, classApi } from '@/lib/api'

const PER_PAGE = 10

export default function OfflineExamPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [classes, setClasses] = useState([])
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({
    exam_name: '', class_id: '', session_yr: '', exam_description: '', is_active: true,
  })
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(Array.isArray(r.result) ? r.result : [])).catch(() => setClasses([]))
  }, [])

  const fetchExams = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await examApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchExams() }, [fetchExams])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = (item = null) => {
    setEditing(item)
    setForm(item ? {
      exam_name:        item.exam_name        || '',
      class_id:         item.class_id != null ? String(item.class_id) : '',
      session_yr:       item.session_yr       || '',
      exam_description: item.exam_description || '',
      is_active:        item.is_active !== false,
    } : { exam_name: '', class_id: '', session_yr: '', exam_description: '', is_active: true })
    setErrors({})
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.exam_name.trim()) e.exam_name = 'Exam name is required'
    if (!form.class_id)         e.class_id  = 'Class is required'
    if (!form.session_yr.trim()) e.session_yr = 'Session year is required'
    if (!form.exam_description.trim()) e.exam_description = 'Description is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      const payload = {
        exam_name:        form.exam_name.trim(),
        class_id:         parseInt(form.class_id, 10),
        session_yr:       form.session_yr.trim(),
        exam_description: form.exam_description.trim(),
        is_active:        form.is_active,
      }
      if (editing) {
        await examApi.update(editing.exam_id ?? editing.id, payload)
      } else {
        await examApi.create(payload)
      }
      setModal(false)
      fetchExams()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete exam "${item.exam_name}"?`)) return
    try { await examApi.delete(item.exam_id ?? item.id); fetchExams() }
    catch (e) { alert(e.message) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const className = (id) => classes.find(c => String(c.class_id) === String(id))?.class_code || (id ? `#${id}` : '—')

  return (
    <div>
      <PageHeader
        title="Offline Exams"
        subtitle="Manage offline / written examinations"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Exam</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search exams..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>
        <Table headers={['Sl No.', 'Exam Name', 'Class', 'Session Year', 'Active', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((ex, i) => (
            <tr key={ex.exam_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{ex.exam_name}</td>
              <td className="table-td">{ex.class_code || className(ex.class_id)}</td>
              <td className="table-td">{ex.session_yr || '—'}</td>
              <td className="table-td">
                {ex.is_active !== false
                  ? <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                  : <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
              </td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(ex)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(ex)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
        title={editing ? 'Edit Exam' : 'Add Offline Exam'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Exam Name" required>
          <input
            className={`input ${errors.exam_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.exam_name}
            onChange={e => { setForm(p => ({ ...p, exam_name: e.target.value })); if (errors.exam_name) setErrors(p => ({ ...p, exam_name: '' })) }}
            placeholder="e.g. Mid-Term 2025"
          />
          {errors.exam_name && <p className="text-xs text-red-500 mt-1">{errors.exam_name}</p>}
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Class" required>
            <select
              className={`input ${errors.class_id ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.class_id}
              onChange={e => { setForm(p => ({ ...p, class_id: e.target.value })); if (errors.class_id) setErrors(p => ({ ...p, class_id: '' })) }}
            >
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
            </select>
            {errors.class_id && <p className="text-xs text-red-500 mt-1">{errors.class_id}</p>}
          </FormField>
          <FormField label="Session Year" required>
            <input
              className={`input ${errors.session_yr ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.session_yr}
              onChange={e => { setForm(p => ({ ...p, session_yr: e.target.value })); if (errors.session_yr) setErrors(p => ({ ...p, session_yr: '' })) }}
              placeholder="e.g. 2024-25"
            />
            {errors.session_yr && <p className="text-xs text-red-500 mt-1">{errors.session_yr}</p>}
          </FormField>
        </div>
        <FormField label="Description" required>
          <textarea
            className={`input ${errors.exam_description ? 'border-red-400 focus:ring-red-400' : ''}`}
            rows={2}
            value={form.exam_description}
            onChange={e => { setForm(p => ({ ...p, exam_description: e.target.value })); if (errors.exam_description) setErrors(p => ({ ...p, exam_description: '' })) }}
            placeholder="Description"
          />
          {errors.exam_description && <p className="text-xs text-red-500 mt-1">{errors.exam_description}</p>}
        </FormField>
        <FormField label="Active">
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Mark as active</span>
          </label>
        </FormField>
      </Modal>
    </div>
  )
}
