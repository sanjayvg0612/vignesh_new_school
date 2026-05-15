'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField } from '@/components/ui'
import { gradeApi } from '@/lib/api'

const PER_PAGE = 20

export default function GradePage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ grade: '', start_range: '', end_range: '' })
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchGrades = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await gradeApi.list({ page, limit: PER_PAGE })
      const result = res.result || {}
      setData(result.data  || result || [])
      setTotal(result.total || (Array.isArray(result) ? result.length : 0))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchGrades() }, [fetchGrades])

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = () => {
    setForm({ grade: '', start_range: '', end_range: '' })
    setErrors({})
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.start_range) e.start_range = 'Start range is required'
    if (!form.end_range) e.end_range = 'End range is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      await gradeApi.create({
        grade:       form.grade.trim() || undefined,
        start_range: parseFloat(form.start_range),
        end_range:   parseFloat(form.end_range),
      })
      setModal(false)
      fetchGrades()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete grade "${item.grade || `${item.start_range}–${item.end_range}`}"?`)) return
    try { await gradeApi.delete(item.grade_id ?? item.id); fetchGrades() }
    catch (e) { alert(e.message) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <PageHeader
        title="Exam Grades"
        subtitle="Configure grade boundaries for the grading scale"
        action={<button onClick={openModal} className="btn-primary"><Plus className="w-4 h-4" /> Add Grade</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <Table headers={['Sl No.', 'Grade', 'Start Range', 'End Range', 'Active', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((g, i) => (
            <tr key={g.grade_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td">
                <span className="font-bold text-primary-700 text-base">{g.grade || '—'}</span>
              </td>
              <td className="table-td">{g.start_range ?? '—'}</td>
              <td className="table-td">{g.end_range   ?? '—'}</td>
              <td className="table-td">
                {g.is_active !== false
                  ? <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                  : <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
              </td>
              <td className="table-td">
                <button onClick={() => handleDelete(g)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Add Grade"
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Grade Label">
          <input className="input" value={form.grade} onChange={f('grade')} placeholder="e.g. A+, B, C" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Range (%)" required>
            <input
              className={`input ${errors.start_range ? 'border-red-400 focus:ring-red-400' : ''}`}
              type="number" step="0.01" min="0" max="100"
              value={form.start_range}
              onChange={e => { setForm(p => ({ ...p, start_range: e.target.value })); if (errors.start_range) setErrors(p => ({ ...p, start_range: '' })) }}
              placeholder="e.g. 90"
            />
            {errors.start_range && <p className="text-xs text-red-500 mt-1">{errors.start_range}</p>}
          </FormField>
          <FormField label="End Range (%)" required>
            <input
              className={`input ${errors.end_range ? 'border-red-400 focus:ring-red-400' : ''}`}
              type="number" step="0.01" min="0" max="100"
              value={form.end_range}
              onChange={e => { setForm(p => ({ ...p, end_range: e.target.value })); if (errors.end_range) setErrors(p => ({ ...p, end_range: '' })) }}
              placeholder="e.g. 100"
            />
            {errors.end_range && <p className="text-xs text-red-500 mt-1">{errors.end_range}</p>}
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
