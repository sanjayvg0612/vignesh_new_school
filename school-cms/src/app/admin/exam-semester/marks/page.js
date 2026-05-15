'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField } from '@/components/ui'
import { marksApi, classApi, subjectApi, studentApi } from '@/lib/api'

const PER_PAGE = 20
const SCHOOL_ID = 1

export default function MarksPage() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const [classes, setClasses]   = useState([])
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])

  const [filterClassId, setFilterClassId]     = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')

  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  // subject rows: [{subject_id, mark}]
  const [subjectRows, setSubjectRows] = useState([{ subject_id: '', mark: '' }])
  const [formStudentId, setFormStudentId] = useState('')
  const [formClassId, setFormClassId]     = useState('')
  const [errors, setErrors]               = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
  }, [])

  // Load subjects when class changes
  useEffect(() => {
    setSubjects([])
    if (!filterClassId && !formClassId) return
    const cid = formClassId || filterClassId
    subjectApi.dropdown({ class_id: cid, limit: 100 })
      .then(r => setSubjects(r.result || []))
      .catch(() => setSubjects([]))
  }, [filterClassId, formClassId])

  // Load students when filter class changes
  useEffect(() => {
    setStudents([])
    setFilterStudentId('')
    if (!filterClassId) return
    studentApi.list({ school_id: SCHOOL_ID, class_id: filterClassId, limit: 100 })
      .then(r => setStudents(r.result?.data || []))
      .catch(() => setStudents([]))
  }, [filterClassId])

  const fetchMarks = useCallback(async () => {
    if (!filterStudentId) { setData([]); setTotal(0); return }
    setLoading(true); setError('')
    try {
      const res    = await marksApi.list({
        student_id: filterStudentId,
        class_id:   filterClassId || undefined,
        page, limit: PER_PAGE,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [filterStudentId, filterClassId, page])

  useEffect(() => { fetchMarks() }, [fetchMarks])

  const openModal = () => {
    setFormStudentId(filterStudentId || '')
    setFormClassId(filterClassId || '')
    setSubjectRows([{ subject_id: '', mark: '' }])
    setErrors({})
    setModal(true)
  }

  const closeModal = () => { setModal(false); setErrors({}) }

  const addRow = () => setSubjectRows(p => [...p, { subject_id: '', mark: '' }])
  const removeRow = (i) => setSubjectRows(p => p.filter((_, idx) => idx !== i))
  const updateRow = (i, key, val) => {
    setSubjectRows(p => p.map((r, idx) => idx === i ? { ...r, [key]: val } : r))
    if (errors.subjectRows) setErrors(p => ({ ...p, subjectRows: '' }))
  }

  const validate = () => {
    const e = {}
    if (!formClassId) e.formClassId = 'Class is required'
    if (!formStudentId) e.formStudentId = 'Student is required'
    const validRows = subjectRows.filter(r => r.subject_id && r.mark !== '')
    if (!validRows.length) e.subjectRows = 'At least one subject with a mark is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    const validRows = subjectRows.filter(r => r.subject_id && r.mark !== '')
    setSaving(true)
    try {
      await marksApi.create({
        student_id: parseInt(formStudentId, 10),
        class_id:   parseInt(formClassId,   10),
        subjects:   validRows.map(r => ({
          subject_id: parseInt(r.subject_id, 10),
          mark:       parseFloat(r.mark),
        })),
      })
      setModal(false)
      fetchMarks()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const studentName = (id) => {
    const s = students.find(st => st.student_id === id || String(st.student_id) === String(id))
    return s ? `${s.first_name} ${s.last_name}` : (id ? `#${id}` : '—')
  }

  const subjectName = (id) => subjects.find(s => (s.id ?? s.subject_id) === id || String(s.id ?? s.subject_id) === String(id))?.name || (id ? `#${id}` : '—')

  return (
    <div>
      <PageHeader
        title="Marks Entry"
        subtitle="Enter and view student exam marks"
        action={
          <button onClick={openModal} className="btn-primary" disabled={!filterStudentId || !filterClassId}>
            <Plus className="w-4 h-4" /> Add Marks
          </button>
        }
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class <span className="text-red-500">*</span></label>
          <select className="input w-40" value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setPage(1) }}>
            <option value="">— Select Class —</option>
            {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Student <span className="text-red-500">*</span></label>
          <select className="input w-52" value={filterStudentId} onChange={e => { setFilterStudentId(e.target.value); setPage(1) }} disabled={!filterClassId}>
            <option value="">— Select Student —</option>
            {students.map(s => <option key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>
      </div>

      {!filterStudentId ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Select Class and Student above to view marks</div>
      ) : (
        <div className="card">
          <Table headers={['Sl No.', 'Subject', 'Mark', 'Student']} empty={!loading && data.length === 0}>
            {loading ? (
              <tr><td colSpan={4} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
            ) : data.map((r, i) => (
              <tr key={r.mark_id ?? r.marks_id ?? i} className="hover:bg-gray-50 transition-colors">
                <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="table-td font-medium text-gray-900">{r.subject_name || subjectName(r.subject_id)}</td>
                <td className="table-td">
                  <span className={`font-semibold ${r.mark >= 50 ? 'text-green-600' : 'text-red-500'}`}>{r.mark ?? r.marks_obtained ?? '—'}</span>
                </td>
                <td className="table-td">{r.student_name || studentName(r.student_id)}</td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Add Marks"
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Marks'}</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Class" required>
            <select
              className={`input ${errors.formClassId ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={formClassId}
              onChange={e => { setFormClassId(e.target.value); if (errors.formClassId) setErrors(p => ({ ...p, formClassId: '' })) }}
            >
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.formClassId && <p className="text-xs text-red-500 mt-1">{errors.formClassId}</p>}
          </FormField>
          <FormField label="Student" required>
            {students.length > 0 ? (
              <select
                className={`input ${errors.formStudentId ? 'border-red-400 focus:ring-red-400' : ''}`}
                value={formStudentId}
                onChange={e => { setFormStudentId(e.target.value); if (errors.formStudentId) setErrors(p => ({ ...p, formStudentId: '' })) }}
              >
                <option value="">— Select Student —</option>
                {students.map(s => <option key={s.student_id} value={s.student_id}>{s.first_name} {s.last_name}</option>)}
              </select>
            ) : (
              <input
                className={`input ${errors.formStudentId ? 'border-red-400 focus:ring-red-400' : ''}`}
                type="number"
                value={formStudentId}
                onChange={e => { setFormStudentId(e.target.value); if (errors.formStudentId) setErrors(p => ({ ...p, formStudentId: '' })) }}
                placeholder="Student ID"
              />
            )}
            {errors.formStudentId && <p className="text-xs text-red-500 mt-1">{errors.formStudentId}</p>}
          </FormField>
        </div>

        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">Subjects &amp; Marks</p>
            <button type="button" onClick={addRow} className="text-xs text-primary-600 hover:underline">+ Add Subject</button>
          </div>
          {errors.subjectRows && <p className="text-xs text-red-500 mb-2">{errors.subjectRows}</p>}
          <div className="space-y-2">
            {subjectRows.map((row, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  className="input flex-1"
                  value={row.subject_id}
                  onChange={e => updateRow(idx, 'subject_id', e.target.value)}
                >
                  <option value="">— Subject —</option>
                  {subjects.map(s => <option key={s.id ?? s.subject_id} value={s.id ?? s.subject_id}>{s.name}</option>)}
                </select>
                <input
                  className="input w-24"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="Mark"
                  value={row.mark}
                  onChange={e => updateRow(idx, 'mark', e.target.value)}
                />
                {subjectRows.length > 1 && (
                  <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
