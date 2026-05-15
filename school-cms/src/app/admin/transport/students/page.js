'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import { transportStudentApi, groupApi, classApi, sectionApi, studentApi, vehicleApi } from '@/lib/api'
import { PageHeader, Table, Pagination, Modal, FormField } from '@/components/ui'

const PER_PAGE = 10
const EMPTY_FORM = { group_id: '', class_id: '', section_id: '', student_id: '', vehicle_id: '', session_yr: '' }

export default function TransportStudentsPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})

  const [groups, setGroups]     = useState([])
  const [classes, setClasses]   = useState([])
  const [sections, setSections] = useState([])
  const [vehicles, setVehicles] = useState([])

  const [classLoading, setClassLoading]     = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)

  // Student search
  const [studentSearch, setStudentSearch]       = useState('')
  const [studentResults, setStudentResults]     = useState([])
  const [studentSearching, setStudentSearching] = useState(false)
  const [selectedStudent, setSelectedStudent]   = useState(null)
  const [showStudentResults, setShowStudentResults] = useState(false)
  const studentSearchRef = useRef(null)
  const debounceRef      = useRef(null)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await transportStudentApi.list({ page, limit: PER_PAGE })
      const r = res.result || {}
      setData(r.data || []); setTotal(r.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    groupApi.dropdown().then(r => setGroups(Array.isArray(r.result) ? r.result : [])).catch(() => setGroups([]))
    vehicleApi.dropdown().then(r => setVehicles(Array.isArray(r.result) ? r.result : [])).catch(() => setVehicles([]))
  }, [])

  // Close student dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (studentSearchRef.current && !studentSearchRef.current.contains(e.target)) {
        setShowStudentResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleStudentSearch = (val) => {
    setStudentSearch(val)
    setShowStudentResults(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setStudentResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setStudentSearching(true)
      try {
        const res = await studentApi.list({ search: val, limit: 10 })
        const r = res.result || {}
        setStudentResults(Array.isArray(r.data) ? r.data : Array.isArray(r) ? r : [])
      } catch { setStudentResults([]) }
      finally { setStudentSearching(false) }
    }, 350)
  }

  const selectStudent = async (s) => {
    setShowStudentResults(false)
    setSelectedStudent(s)
    setForm(p => ({ ...p, student_id: s.student_id }))
    if (errors.student_id) setErrors(p => ({ ...p, student_id: '' }))

    // Auto-fill Group, Class, Section from student data
    const classId = s.class_id
    const sectionId = s.section_id
    const groupId = s.group_id || s.school_group_id

    const newForm = { ...EMPTY_FORM, student_id: s.student_id, vehicle_id: form.vehicle_id, session_yr: form.session_yr }

    if (groupId) {
      newForm.group_id = String(groupId)
      setClassLoading(true)
      try {
        const res = await classApi.dropdown({ school_group_id: groupId })
        setClasses(Array.isArray(res.result) ? res.result : [])
      } catch { setClasses([]) } finally { setClassLoading(false) }
    }

    if (classId) {
      newForm.class_id = String(classId)
      setSectionLoading(true)
      try {
        const res = await sectionApi.dropdown({ class_id: classId })
        setSections(Array.isArray(res.result) ? res.result : [])
      } catch { setSections([]) } finally { setSectionLoading(false) }
    }

    if (sectionId) newForm.section_id = String(sectionId)

    setForm(newForm)
  }

  const clearStudent = () => {
    setSelectedStudent(null)
    setStudentSearch('')
    setStudentResults([])
    setForm(p => ({ ...p, student_id: '', group_id: '', class_id: '', section_id: '' }))
    setClasses([]); setSections([])
  }

  const handleGroupChange = async (id) => {
    setForm(p => ({ ...p, group_id: id, class_id: '', section_id: '' }))
    setClasses([]); setSections([])
    if (errors.group_id) setErrors(p => ({ ...p, group_id: '' }))
    if (!id) return
    setClassLoading(true)
    try {
      const res = await classApi.dropdown({ school_group_id: id })
      setClasses(Array.isArray(res.result) ? res.result : [])
    } catch { setClasses([]) } finally { setClassLoading(false) }
  }

  const handleClassChange = async (id) => {
    setForm(p => ({ ...p, class_id: id, section_id: '' }))
    setSections([])
    if (errors.class_id) setErrors(p => ({ ...p, class_id: '' }))
    if (!id) return
    setSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: id })
      setSections(Array.isArray(res.result) ? res.result : [])
    } catch { setSections([]) } finally { setSectionLoading(false) }
  }

  const closeModal = () => {
    setModal(false); setErrors({})
    setClasses([]); setSections([])
    setStudentSearch(''); setStudentResults([]); setSelectedStudent(null); setShowStudentResults(false)
  }

  const openAdd = () => {
    setEditing(null); setForm(EMPTY_FORM); setErrors({})
    setClasses([]); setSections([])
    setStudentSearch(''); setStudentResults([]); setSelectedStudent(null); setShowStudentResults(false)
    setModal(true)
  }

  const openEdit = async (s) => {
    setEditing(s)
    setForm({ group_id: s.group_id ?? '', class_id: s.class_id ?? '', section_id: s.section_id ?? '', student_id: s.student_id ?? '', vehicle_id: s.vehicle_id ?? '', session_yr: s.session_yr || '' })
    setErrors({})
    setSelectedStudent({ student_id: s.student_id, first_name: s.student_name, last_name: '', student_roll_id: s.roll_no })
    setStudentSearch(''); setStudentResults([]); setShowStudentResults(false)

    // Load classes and sections for existing values
    if (s.group_id) {
      setClassLoading(true)
      try {
        const res = await classApi.dropdown({ school_group_id: s.group_id })
        setClasses(Array.isArray(res.result) ? res.result : [])
      } catch { setClasses([]) } finally { setClassLoading(false) }
    }
    if (s.class_id) {
      setSectionLoading(true)
      try {
        const res = await sectionApi.dropdown({ class_id: s.class_id })
        setSections(Array.isArray(res.result) ? res.result : [])
      } catch { setSections([]) } finally { setSectionLoading(false) }
    }

    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.group_id)   e.group_id   = 'Group is required'
    if (!form.class_id)   e.class_id   = 'Class is required'
    if (!form.section_id) e.section_id = 'Section is required'
    if (!form.student_id) e.student_id = 'Student is required'
    if (!form.vehicle_id) e.vehicle_id = 'Vehicle is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = {
        group_id:   Number(form.group_id),
        class_id:   Number(form.class_id),
        section_id: Number(form.section_id),
        student_id: Number(form.student_id),
        vehicle_id: Number(form.vehicle_id),
        session_yr: form.session_yr || undefined,
      }
      if (editing) await transportStudentApi.update(editing.id, payload)
      else await transportStudentApi.create(payload)
      setModal(false); fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove student from transport?')) return
    try { await transportStudentApi.delete(id); fetchData() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader title="Transport Students" subtitle="Manage students assigned to school transport"
        action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Assign Student</button>}
      />
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Transportation Assignments</span>
          <span className="text-sm text-gray-500">{total} records</span>
        </div>
        <Table headers={['#', 'Student', 'Vehicle', 'Class', 'Section', 'Group', 'Session Year', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((s, i) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium">{s.student_name || s.student_id || '—'}</td>
              <td className="table-td">{s.vehicle_name || s.vehicle_id || '—'}</td>
              <td className="table-td">{s.class_code || s.class_id || '—'}</td>
              <td className="table-td">{s.section_code || s.section_id || '—'}</td>
              <td className="table-td">{s.group_name || s.group_id || '—'}</td>
              <td className="table-td">{s.session_yr || '—'}</td>
              <td className="table-td">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Assignment' : 'Assign Student to Transport'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="space-y-4">

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
                <div className={`flex items-center gap-2 input ${errors.student_id ? 'border-red-400 focus-within:ring-red-400' : ''}`}>
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
            {errors.student_id && <p className="text-xs text-red-500 mt-1">{errors.student_id}</p>}
          </FormField>

          {/* Group */}
          <FormField label="Group" required>
            <select
              className={`input ${errors.group_id ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.group_id}
              onChange={e => handleGroupChange(e.target.value)}
            >
              <option value="">— Select Group —</option>
              {groups.map(g => <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>)}
            </select>
            {errors.group_id && <p className="text-xs text-red-500 mt-1">{errors.group_id}</p>}
          </FormField>

          {/* Class */}
          <FormField label="Class" required>
            <select
              className={`input ${errors.class_id ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.class_id}
              onChange={e => handleClassChange(e.target.value)}
              disabled={classLoading || !form.group_id || classes.length === 0}
            >
              <option value="">
                {classLoading ? 'Loading...' : !form.group_id ? '— Select Group first —' : classes.length === 0 ? 'No classes available' : '— Select Class —'}
              </option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
            </select>
            {errors.class_id && <p className="text-xs text-red-500 mt-1">{errors.class_id}</p>}
          </FormField>

          {/* Section */}
          <FormField label="Section" required>
            <select
              className={`input ${errors.section_id ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.section_id}
              onChange={e => { setForm(p => ({ ...p, section_id: e.target.value })); if (errors.section_id) setErrors(p => ({ ...p, section_id: '' })) }}
              disabled={sectionLoading || !form.class_id || sections.length === 0}
            >
              <option value="">
                {sectionLoading ? 'Loading...' : !form.class_id ? '— Select Class first —' : sections.length === 0 ? 'No sections available' : '— Select Section —'}
              </option>
              {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
            </select>
            {errors.section_id && <p className="text-xs text-red-500 mt-1">{errors.section_id}</p>}
          </FormField>

          {/* Vehicle */}
          <FormField label="Vehicle" required>
            <select
              className={`input ${errors.vehicle_id ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.vehicle_id}
              onChange={e => { setForm(p => ({ ...p, vehicle_id: e.target.value })); if (errors.vehicle_id) setErrors(p => ({ ...p, vehicle_id: '' })) }}
            >
              <option value="">— Select Vehicle —</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_name || v.vehicle_no || v.name || `Vehicle #${v.id}`}</option>)}
            </select>
            {errors.vehicle_id && <p className="text-xs text-red-500 mt-1">{errors.vehicle_id}</p>}
          </FormField>

          {/* Session Year */}
          <FormField label="Session Year">
            <input className="input" value={form.session_yr} onChange={e => setForm(p => ({ ...p, session_yr: e.target.value }))} placeholder="2024-25" />
          </FormField>

        </div>
      </Modal>
    </div>
  )
}
