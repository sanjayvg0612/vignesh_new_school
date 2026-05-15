'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'
import { diaryApi, studentApi, classApi, sectionApi, subjectApi } from '@/lib/api'

const PER_PAGE = 10
const DIARY_STATUSES = ['pending', 'completed', 'reviewed']

export default function StudentDiaryPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Filters
  const [filterClass, setFilterClass]     = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterDate, setFilterDate]       = useState('')
  const [filterStatus, setFilterStatus]   = useState('')

  const [filterClasses, setFilterClasses]   = useState([])
  const [filterSections, setFilterSections] = useState([])
  const [filterSubjects, setFilterSubjects] = useState([])
  const [filterSectionLoading, setFilterSectionLoading] = useState(false)
  const [filterSubjectLoading, setFilterSubjectLoading] = useState(false)

  // Modal state
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm]       = useState({
    student_id: '', class_id: '', section_id: '', subject_id: '',
    task_title: '', dairy_date: '', status: 'pending',
  })

  // Form dropdowns
  const [formClasses, setFormClasses]   = useState([])
  const [formSections, setFormSections] = useState([])
  const [formSubjects, setFormSubjects] = useState([])
  const [formSectionLoading, setFormSectionLoading] = useState(false)
  const [formSubjectLoading, setFormSubjectLoading] = useState(false)

  // Student search in form
  const [studentSearch, setStudentSearch]     = useState('')
  const [studentResults, setStudentResults]   = useState([])
  const [studentSearching, setStudentSearching] = useState(false)
  const [showStudentResults, setShowStudentResults] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const studentSearchRef = useRef(null)
  const studentDebounceRef = useRef(null)

  // Delete
  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  // Load filter classes on mount
  useEffect(() => {
    classApi.dropdown().then(r => setFilterClasses(Array.isArray(r.result) ? r.result : [])).catch(() => setFilterClasses([]))
  }, [])

  const handleFilterClassChange = async (id) => {
    setFilterClass(id)
    setFilterSection('')
    setFilterSubject('')
    setFilterSections([])
    setFilterSubjects([])
    setPage(1)
    if (!id) return
    setFilterSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: id })
      setFilterSections(Array.isArray(res.result) ? res.result : [])
    } catch { setFilterSections([]) } finally { setFilterSectionLoading(false) }
    setFilterSubjectLoading(true)
    try {
      const res = await subjectApi.dropdown({ class_id: id })
      setFilterSubjects(Array.isArray(res.result) ? res.result : [])
    } catch { setFilterSubjects([]) } finally { setFilterSubjectLoading(false) }
  }

  const fetchDiaries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await diaryApi.list({
        page,
        limit:      PER_PAGE,
        class_id:   filterClass   || undefined,
        section_id: filterSection || undefined,
        subject_id: filterSubject || undefined,
        dairy_date: filterDate    || undefined,
        status:     filterStatus  || undefined,
      })
      const result = res.result || {}
      setData(result.data   || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, filterClass, filterSection, filterSubject, filterDate, filterStatus])

  useEffect(() => { fetchDiaries() }, [fetchDiaries])

  // Close student dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (studentSearchRef.current && !studentSearchRef.current.contains(e.target)) setShowStudentResults(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleStudentSearch = (val) => {
    setStudentSearch(val)
    setShowStudentResults(true)
    if (!val.trim()) { setStudentResults([]); return }
    clearTimeout(studentDebounceRef.current)
    studentDebounceRef.current = setTimeout(async () => {
      setStudentSearching(true)
      try {
        const res = await studentApi.list({ search: val.trim(), limit: 10 })
        setStudentResults(res.result?.data || [])
      } catch { setStudentResults([]) } finally { setStudentSearching(false) }
    }, 400)
  }

  const selectStudent = async (s) => {
    setSelectedStudent(s)
    setStudentSearch('')
    setStudentResults([])
    setShowStudentResults(false)
    if (formErrors.student_id) setFormErrors(p => ({ ...p, student_id: '' }))

    const classId   = s.class_id
    const sectionId = s.section_id

    setForm(f => ({
      ...f,
      student_id: s.student_id,
      class_id:   classId   ? String(classId)   : f.class_id,
      section_id: sectionId ? String(sectionId) : '',
      subject_id: '',
    }))

    if (classId) {
      setFormSectionLoading(true)
      setFormSubjectLoading(true)
      setFormSections([])
      setFormSubjects([])
      try {
        const [secRes, subRes] = await Promise.all([
          sectionApi.dropdown({ class_id: classId }),
          subjectApi.dropdown({ class_id: classId }),
        ])
        setFormSections(Array.isArray(secRes.result) ? secRes.result : [])
        setFormSubjects(Array.isArray(subRes.result) ? subRes.result : [])
      } catch {
        setFormSections([])
        setFormSubjects([])
      } finally {
        setFormSectionLoading(false)
        setFormSubjectLoading(false)
      }
    }
  }

  const clearStudent = () => {
    setSelectedStudent(null)
    setStudentSearch('')
    setStudentResults([])
    setForm(f => ({ ...f, student_id: '', class_id: '', section_id: '', subject_id: '' }))
    setFormSections([])
    setFormSubjects([])
  }

  // Form class → section/subject cascade
  const handleFormClassChange = async (id) => {
    setForm(f => ({ ...f, class_id: id, section_id: '', subject_id: '' }))
    setFormSections([])
    setFormSubjects([])
    if (!id) return
    setFormSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: id })
      setFormSections(Array.isArray(res.result) ? res.result : [])
    } catch { setFormSections([]) } finally { setFormSectionLoading(false) }
    setFormSubjectLoading(true)
    try {
      const res = await subjectApi.dropdown({ class_id: id })
      setFormSubjects(Array.isArray(res.result) ? res.result : [])
    } catch { setFormSubjects([]) } finally { setFormSubjectLoading(false) }
  }

  const openAdd = () => {
    setEditing(null)
    setFormErrors({})
    setSelectedStudent(null)
    setStudentSearch('')
    setFormSections([])
    setFormSubjects([])
    setForm({ student_id: '', class_id: '', section_id: '', subject_id: '', task_title: '', dairy_date: '', status: 'pending' })
    // Load classes for form
    classApi.dropdown().then(r => setFormClasses(Array.isArray(r.result) ? r.result : [])).catch(() => setFormClasses([]))
    setModal(true)
  }

  const openEdit = async (d) => {
    setEditing(d)
    setFormErrors({})
    setSelectedStudent(null)
    setStudentSearch('')
    setFormSections([])
    setFormSubjects([])
    setForm({ student_id: '', class_id: '', section_id: '', subject_id: '', task_title: '', dairy_date: '', status: 'pending' })
    setModal(true)

    // Fetch full record to get all IDs
    let full = d
    try {
      const res = await diaryApi.getById(d.id)
      full = res.result || d
    } catch { /* fall back to list row */ }

    const classId   = full.class_id   || d.class_id
    const sectionId = full.section_id || d.section_id
    const subjectId = full.subject_id || d.subject_id

    setSelectedStudent(full.student_id ? {
      student_id:      full.student_id,
      first_name:      full.student_name || full.first_name || d.student_name || '',
      last_name:       full.last_name    || d.last_name     || '',
      student_roll_id: full.student_roll_id || d.student_roll_id,
    } : null)

    setForm({
      student_id: full.student_id  || d.student_id  || '',
      class_id:   classId   ? String(classId)   : '',
      section_id: sectionId ? String(sectionId) : '',
      subject_id: subjectId ? String(subjectId) : '',
      task_title: full.task_title  || d.task_title  || '',
      dairy_date: (full.dairy_date || d.dairy_date) ? (full.dairy_date || d.dairy_date).split('T')[0] : '',
      status:     full.status      || d.status      || 'pending',
    })

    // Load classes and cascading dropdowns
    classApi.dropdown().then(r => setFormClasses(Array.isArray(r.result) ? r.result : [])).catch(() => setFormClasses([]))
    if (classId) {
      setFormSectionLoading(true)
      setFormSubjectLoading(true)
      try {
        const [secRes, subRes] = await Promise.all([
          sectionApi.dropdown({ class_id: classId }),
          subjectApi.dropdown({ class_id: classId }),
        ])
        setFormSections(Array.isArray(secRes.result) ? secRes.result : [])
        setFormSubjects(Array.isArray(subRes.result) ? subRes.result : [])
      } catch {
        setFormSections([])
        setFormSubjects([])
      } finally {
        setFormSectionLoading(false)
        setFormSubjectLoading(false)
      }
    }
  }

  const validate = () => {
    const ve = {}
    if (!form.student_id) ve.student_id = 'Please select a student'
    if (!form.class_id)   ve.class_id   = 'Class is required'
    if (!form.task_title.trim()) ve.task_title = 'Task title is required'
    if (!form.dairy_date) ve.dairy_date = 'Diary date is required'
    return ve
  }

  const handleSave = async () => {
    const ve = validate()
    if (Object.keys(ve).length) { setFormErrors(ve); return }
    setSaving(true)
    try {
      const payload = {
        student_id: parseInt(form.student_id, 10),
        class_id:   parseInt(form.class_id,   10),
        section_id: form.section_id ? parseInt(form.section_id, 10) : undefined,
        subject_id: form.subject_id ? parseInt(form.subject_id, 10) : undefined,
        task_title: form.task_title,
        dairy_date: form.dairy_date,
        status:     form.status,
      }
      if (editing) {
        await diaryApi.update(editing.id, payload)
      } else {
        await diaryApi.create(payload)
      }
      setModal(false)
      fetchDiaries()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (id) => {
    setDeleteId(id)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await diaryApi.delete(deleteId)
      setConfirmOpen(false)
      fetchDiaries()
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const statusColor = (s) => {
    if (s === 'completed') return 'bg-green-100 text-green-700'
    if (s === 'reviewed')  return 'bg-blue-100 text-blue-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div>
      <PageHeader
        title="Student Diary"
        subtitle="Manage student diary entries"
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        }
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <select className="input w-36" value={filterClass} onChange={e => handleFilterClassChange(e.target.value)}>
            <option value="">All Classes</option>
            {filterClasses.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
          </select>
          <select className="input w-36" value={filterSection} onChange={e => { setFilterSection(e.target.value); setPage(1) }}
            disabled={filterSectionLoading || !filterClass || filterSections.length === 0}>
            <option value="">
              {filterSectionLoading ? 'Loading...' : !filterClass ? 'All Sections' : filterSections.length === 0 ? 'No Sections' : 'All Sections'}
            </option>
            {filterSections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
          </select>
          <select className="input w-36" value={filterSubject} onChange={e => { setFilterSubject(e.target.value); setPage(1) }}
            disabled={filterSubjectLoading || !filterClass || filterSubjects.length === 0}>
            <option value="">
              {filterSubjectLoading ? 'Loading...' : !filterClass ? 'All Subjects' : filterSubjects.length === 0 ? 'No Subjects' : 'All Subjects'}
            </option>
            {filterSubjects.map(s => <option key={s.id ?? s.subject_id} value={s.id ?? s.subject_id}>{s.name || s.subject_name || s.subject_code}</option>)}
          </select>
          <input type="date" className="input w-40" value={filterDate} onChange={e => { setFilterDate(e.target.value); setPage(1) }} />
          <select className="input w-36" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            {DIARY_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button
            onClick={() => { setFilterClass(''); setFilterSection(''); setFilterSubject(''); setFilterDate(''); setFilterStatus(''); setFilterSections([]); setFilterSubjects([]); setPage(1) }}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            Clear Filters
          </button>
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>

        <Table
          headers={['Sl No.', 'Student', 'Class', 'Section', 'Subject', 'Task Title', 'Date', 'Status', 'Actions']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr>
              <td colSpan={9} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((d, i) => (
            <tr key={d.id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{d.student_name || [d.first_name, d.last_name].filter(Boolean).join(' ') || '—'}</td>
              <td className="table-td text-gray-600">{d.class_code   || '—'}</td>
              <td className="table-td text-gray-600">{d.section_code || '—'}</td>
              <td className="table-td text-gray-600">{d.subject_name || d.subject_code || '—'}</td>
              <td className="table-td font-medium text-gray-800 max-w-[180px] truncate">{d.task_title || '—'}</td>
              <td className="table-td whitespace-nowrap text-gray-600">{formatDate(d.dairy_date)}</td>
              <td className="table-td">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(d.status)}`}>
                  {d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : '—'}
                </span>
              </td>
              <td className="table-td">
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => confirmDelete(d.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModal(false); setFormErrors({}) }}
        title={editing ? 'Edit Diary Entry' : 'Add Diary Entry'}
        footer={
          <>
            <button onClick={() => { setModal(false); setFormErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        {/* Student Search */}
        <FormField label="Student" required>
          {selectedStudent ? (
            <div className="flex items-center justify-between rounded-lg border px-3 py-2 bg-primary-50 border-primary-200">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {[selectedStudent.first_name, selectedStudent.last_name].filter(Boolean).join(' ') || selectedStudent.student_name || `Student #${selectedStudent.student_id}`}
                </p>
                {selectedStudent.student_roll_id && (
                  <p className="text-xs text-gray-500">Roll: {selectedStudent.student_roll_id}</p>
                )}
              </div>
              <button type="button" onClick={clearStudent} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative" ref={studentSearchRef}>
              <div className={`flex items-center gap-2 input ${formErrors.student_id ? 'border-red-400 focus-within:ring-red-400' : ''}`}>
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  className="flex-1 outline-none bg-transparent text-sm"
                  placeholder="Search by name or student ID..."
                  value={studentSearch}
                  onChange={e => handleStudentSearch(e.target.value)}
                  onFocus={() => studentSearch && setShowStudentResults(true)}
                />
                {studentSearching && <span className="text-xs text-gray-400">Searching...</span>}
              </div>
              {showStudentResults && (studentResults.length > 0 || (!studentSearching && studentSearch)) && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {studentResults.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-400">No students found</p>
                  ) : studentResults.map(s => (
                    <button
                      key={s.student_id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => selectStudent(s)}
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {[s.first_name, s.last_name].filter(Boolean).join(' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.student_roll_id ? `Roll: ${s.student_roll_id}` : ''}
                        {s.class_code ? `  •  Class: ${s.class_code}` : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {formErrors.student_id && <p className="text-xs text-red-500 mt-1">{formErrors.student_id}</p>}
        </FormField>

        {/* Class → Section → Subject */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Class" required>
            <select
              className={`input ${formErrors.class_id ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.class_id}
              onChange={e => { handleFormClassChange(e.target.value); if (formErrors.class_id) setFormErrors(p => ({ ...p, class_id: '' })) }}
            >
              <option value="">— Select Class —</option>
              {formClasses.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
            </select>
            {formErrors.class_id && <p className="text-xs text-red-500 mt-1">{formErrors.class_id}</p>}
          </FormField>
          <FormField label="Section">
            <select
              className="input"
              value={form.section_id}
              onChange={e => setForm(f => ({ ...f, section_id: e.target.value }))}
              disabled={formSectionLoading || !form.class_id || formSections.length === 0}
            >
              <option value="">
                {formSectionLoading ? 'Loading...' : !form.class_id ? '— Select Class first —' : formSections.length === 0 ? 'No sections' : '— Select Section —'}
              </option>
              {formSections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Subject">
          <select
            className="input"
            value={form.subject_id}
            onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
            disabled={formSubjectLoading || !form.class_id || formSubjects.length === 0}
          >
            <option value="">
              {formSubjectLoading ? 'Loading...' : !form.class_id ? '— Select Class first —' : formSubjects.length === 0 ? 'No subjects' : '— Select Subject —'}
            </option>
            {formSubjects.map(s => <option key={s.id ?? s.subject_id} value={s.id ?? s.subject_id}>{s.name || s.subject_name || s.subject_code}</option>)}
          </select>
        </FormField>

        <FormField label="Task Title" required>
          <input
            className={`input ${formErrors.task_title ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Enter task title..."
            value={form.task_title}
            onChange={e => { setForm(f => ({ ...f, task_title: e.target.value })); if (formErrors.task_title) setFormErrors(p => ({ ...p, task_title: '' })) }}
          />
          {formErrors.task_title && <p className="text-xs text-red-500 mt-1">{formErrors.task_title}</p>}
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Diary Date" required>
            <input
              type="date"
              className={`input ${formErrors.dairy_date ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.dairy_date}
              onChange={e => { setForm(f => ({ ...f, dairy_date: e.target.value })); if (formErrors.dairy_date) setFormErrors(p => ({ ...p, dairy_date: '' })) }}
            />
            {formErrors.dairy_date && <p className="text-xs text-red-500 mt-1">{formErrors.dairy_date}</p>}
          </FormField>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {DIARY_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Diary Entry"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this diary entry? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
