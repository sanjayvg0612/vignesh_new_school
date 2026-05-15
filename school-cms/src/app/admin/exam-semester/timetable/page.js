'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField } from '@/components/ui'
import { examTimetableApi, examApi, subjectApi } from '@/lib/api'

const PER_PAGE = 10
const AMPM = ['AM', 'PM']

const EMPTY_FORM = {
  exam_id: '', subject_id: '',
  total_marks: '', pass_mark: '',
  exam_start_date: '', exam_end_date: '',
  start_time: '', start_ampm: 'AM',
  end_time:   '', end_ampm:   'PM',
  is_active: true,
}

export default function ExamTimetablePage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [exams, setExams]      = useState([])
  const [subjects, setSubjects] = useState([])

  const [filterExamId, setFilterExamId] = useState('')

  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  // Load dropdowns once
  useEffect(() => {
    examApi.list({ limit: 100 }).then(r => setExams(r.result?.data || [])).catch(() => setExams([]))
    subjectApi.dropdown({ limit: 500 }).then(r => setSubjects(r.result || [])).catch(() => setSubjects([]))
  }, [])

  const fetchTimetable = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await examTimetableApi.list({
        exam_id: filterExamId || undefined,
        page, limit: PER_PAGE,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [filterExamId, page])

  useEffect(() => { fetchTimetable() }, [fetchTimetable])

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = (item = null) => {
    setEditing(item)
    setForm(item ? {
      exam_id:         item.exam_id         != null ? String(item.exam_id)         : '',
      subject_id:      item.subject_id      != null ? String(item.subject_id)      : '',
      total_marks:     item.total_marks     != null ? String(item.total_marks)     : '',
      pass_mark:       item.pass_mark       != null ? String(item.pass_mark)       : '',
      exam_start_date: item.exam_start_date ? item.exam_start_date.slice(0, 16)   : '',
      exam_end_date:   item.exam_end_date   ? item.exam_end_date.slice(0, 16)     : '',
      start_time:      item.start_time      || '',
      start_ampm:      item.start_ampm      || 'AM',
      end_time:        item.end_time        || '',
      end_ampm:        item.end_ampm        || 'PM',
      is_active:       item.is_active !== false,
    } : EMPTY_FORM)
    setErrors({})
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.exam_id)         e.exam_id         = 'Exam is required'
    if (!form.subject_id)      e.subject_id      = 'Subject is required'
    if (!form.total_marks)     e.total_marks      = 'Total marks is required'
    if (!form.pass_mark)       e.pass_mark        = 'Pass mark is required'
    if (!form.exam_start_date) e.exam_start_date  = 'Start date is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      const payload = {
        exam_id:         parseInt(form.exam_id,     10),
        subject_id:      parseInt(form.subject_id,  10),
        total_marks:     parseFloat(form.total_marks),
        pass_mark:       parseFloat(form.pass_mark),
        exam_start_date: form.exam_start_date,
        exam_end_date:   form.exam_end_date   || undefined,
        start_time:      form.start_time      || undefined,
        start_ampm:      form.start_ampm,
        end_time:        form.end_time        || undefined,
        end_ampm:        form.end_ampm,
        is_active:       form.is_active,
      }
      if (editing) {
        await examTimetableApi.update(editing.timetable_id ?? editing.id, payload)
      } else {
        await examTimetableApi.create(payload)
      }
      setModal(false)
      fetchTimetable()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this timetable entry?')) return
    try { await examTimetableApi.delete(item.timetable_id ?? item.id); fetchTimetable() }
    catch (e) { alert(e.message) }
  }

  const f = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }))
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }))
  }
  const examName    = (id) => exams.find(e => e.exam_id === id)?.exam_name || (id ? `#${id}` : '—')
  const subjectName = (id) => subjects.find(s => (s.id ?? s.subject_id) === id)?.name || (id ? `#${id}` : '—')

  return (
    <div>
      <PageHeader
        title="Exam Timetable"
        subtitle="Schedule subject-wise exam dates and times"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Entry</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filter */}
      <div className="card p-4 mb-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Exam</label>
          <select className="input w-52" value={filterExamId} onChange={e => { setFilterExamId(e.target.value); setPage(1) }}>
            <option value="">— All Exams —</option>
            {exams.map(e => <option key={e.exam_id} value={e.exam_id}>{e.exam_name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <Table
          headers={['Sl No.', 'Exam', 'Subject', 'Start Date', 'Start Time', 'End Time', 'Total', 'Pass', 'Actions']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr><td colSpan={9} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((item, i) => (
            <tr key={item.timetable_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{item.exam_name    || examName(item.exam_id)}</td>
              <td className="table-td">{item.subject_name || subjectName(item.subject_id)}</td>
              <td className="table-td">{item.exam_start_date ? item.exam_start_date.slice(0, 10) : '—'}</td>
              <td className="table-td">{item.start_time ? `${item.start_time} ${item.start_ampm || ''}` : '—'}</td>
              <td className="table-td">{item.end_time   ? `${item.end_time} ${item.end_ampm   || ''}` : '—'}</td>
              <td className="table-td">{item.total_marks ?? '—'}</td>
              <td className="table-td">{item.pass_mark  ?? '—'}</td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(item)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
        title={editing ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Exam" required>
          <select className={`input ${errors.exam_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.exam_id} onChange={f('exam_id')}>
            <option value="">— Select Exam —</option>
            {exams.map(e => <option key={e.exam_id} value={e.exam_id}>{e.exam_name}</option>)}
          </select>
          {errors.exam_id && <p className="text-xs text-red-500 mt-1">{errors.exam_id}</p>}
        </FormField>
        <FormField label="Subject" required>
          <select className={`input ${errors.subject_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.subject_id} onChange={f('subject_id')}>
            <option value="">— Select Subject —</option>
            {subjects.map(s => <option key={s.id ?? s.subject_id} value={s.id ?? s.subject_id}>{s.name}</option>)}
          </select>
          {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Total Marks" required>
            <input className={`input ${errors.total_marks ? 'border-red-400 focus:ring-red-400' : ''}`} type="number" value={form.total_marks} onChange={f('total_marks')} placeholder="e.g. 100" />
            {errors.total_marks && <p className="text-xs text-red-500 mt-1">{errors.total_marks}</p>}
          </FormField>
          <FormField label="Pass Mark" required>
            <input className={`input ${errors.pass_mark ? 'border-red-400 focus:ring-red-400' : ''}`} type="number" value={form.pass_mark} onChange={f('pass_mark')} placeholder="e.g. 35" />
            {errors.pass_mark && <p className="text-xs text-red-500 mt-1">{errors.pass_mark}</p>}
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Exam Start Date/Time" required>
            <input className={`input ${errors.exam_start_date ? 'border-red-400 focus:ring-red-400' : ''}`} type="datetime-local" value={form.exam_start_date} onChange={f('exam_start_date')} />
            {errors.exam_start_date && <p className="text-xs text-red-500 mt-1">{errors.exam_start_date}</p>}
          </FormField>
          <FormField label="Exam End Date/Time">
            <input className="input" type="datetime-local" value={form.exam_end_date} onChange={f('exam_end_date')} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Time">
            <div className="flex gap-2">
              <input className="input flex-1" type="time" value={form.start_time} onChange={f('start_time')} />
              <select className="input w-20" value={form.start_ampm} onChange={f('start_ampm')}>
                {AMPM.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </FormField>
          <FormField label="End Time">
            <div className="flex gap-2">
              <input className="input flex-1" type="time" value={form.end_time} onChange={f('end_time')} />
              <select className="input w-20" value={form.end_ampm} onChange={f('end_ampm')}>
                {AMPM.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </FormField>
        </div>
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
