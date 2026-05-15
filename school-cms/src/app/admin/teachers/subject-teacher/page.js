'use client'
import { useState, useCallback, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { classSectionTeacherApi, subjectTeacherApi, employeeApi, classApi, sectionApi, subjectApi, groupApi } from '@/lib/api'

const PER_PAGE = 10

export default function SubjectTeacherPage() {
  const [rows, setRows]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)

  const [groups, setGroups]     = useState([])
  const [classes, setClasses]   = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])

  const [classLoading, setClassLoading]     = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)
  const [subjectLoading, setSubjectLoading] = useState(false)

  const [form, setForm]     = useState({ group_id: '', class_id: '', section_id: '', subject_id: '', emp_id: '' })
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await classSectionTeacherApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      const list   = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : []
      const flat   = []
      list.forEach(g => {
        ;(g.subject_teachers || []).forEach(st => {
          flat.push({
            map_id:       st.map_id,
            emp_id:       st.emp_id,
            emp_name:     st.emp_name,
            subject_id:   st.subject_id,
            subject_name: st.subject_name,
            class_id:     g.class_id,
            class_code:   g.class_code,
            section_id:   g.section_id,
            section_code: g.section_code,
            group_id:     g.school_group_id || g.group_id || '',
          })
        })
      })
      setRows(flat)
      setTotal(result.total || flat.length)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = async (item = null) => {
    setEditing(item)
    setErrors({})
    setClasses([])
    setSections([])
    setSubjects([])
    setForm(item ? {
      group_id:   String(item.group_id   || ''),
      class_id:   String(item.class_id   || ''),
      section_id: String(item.section_id || ''),
      subject_id: String(item.subject_id || ''),
      emp_id:     String(item.emp_id     || ''),
    } : { group_id: '', class_id: '', section_id: '', subject_id: '', emp_id: '' })

    try {
      const [groupRes, teacherRes] = await Promise.all([
        groupApi.dropdown(),
        employeeApi.dropdown(),
      ])
      setGroups(Array.isArray(groupRes.result)     ? groupRes.result    : [])
      setTeachers(Array.isArray(teacherRes.result) ? teacherRes.result  : [])
    } catch { setGroups([]); setTeachers([]) }

    // Edit mode: load classes, sections and subjects for existing values
    if (item?.class_id) {
      setClassLoading(true)
      setSectionLoading(true)
      setSubjectLoading(true)
      try {
        const [classRes, secRes, subRes] = await Promise.all([
          classApi.dropdown({ school_group_id: item.group_id || undefined }),
          sectionApi.dropdown({ class_id: item.class_id }),
          subjectApi.dropdown({ class_id: item.class_id }),
        ])
        setClasses(Array.isArray(classRes.result) ? classRes.result : [])
        setSections(Array.isArray(secRes.result)  ? secRes.result   : [])
        const subRaw = subRes.result
        setSubjects(Array.isArray(subRaw) ? subRaw : Array.isArray(subRaw?.data) ? subRaw.data : [])
      } catch { setClasses([]); setSections([]); setSubjects([]) }
      finally { setClassLoading(false); setSectionLoading(false); setSubjectLoading(false) }
    }

    setModal(true)
  }

  const handleGroupChange = async (id) => {
    setForm(p => ({ ...p, group_id: id, class_id: '', section_id: '', subject_id: '' }))
    setClasses([]); setSections([]); setSubjects([])
    if (errors.group_id) setErrors(p => ({ ...p, group_id: '' }))
    if (!id) return
    setClassLoading(true)
    try {
      const res = await classApi.dropdown({ school_group_id: id })
      setClasses(Array.isArray(res.result) ? res.result : [])
    } catch { setClasses([]) } finally { setClassLoading(false) }
  }

  const handleClassChange = async (id) => {
    setForm(p => ({ ...p, class_id: id, section_id: '', subject_id: '' }))
    setSections([]); setSubjects([])
    if (errors.class_id) setErrors(p => ({ ...p, class_id: '' }))
    if (!id) return
    setSectionLoading(true)
    setSubjectLoading(true)
    try {
      const [secRes, subRes] = await Promise.all([
        sectionApi.dropdown({ class_id: id }),
        subjectApi.dropdown({ class_id: id }),
      ])
      setSections(Array.isArray(secRes.result) ? secRes.result : [])
      const subRaw = subRes.result
      setSubjects(Array.isArray(subRaw) ? subRaw : Array.isArray(subRaw?.data) ? subRaw.data : [])
    } catch { setSections([]); setSubjects([]) }
    finally { setSectionLoading(false); setSubjectLoading(false) }
  }

  const validate = () => {
    const e = {}
    if (!form.group_id) e.group_id = 'Group is required'
    if (!form.class_id)   e.class_id   = 'Class is required'
    if (!form.section_id) e.section_id = 'Section is required'
    if (!form.subject_id) e.subject_id = 'Subject is required'
    if (!form.emp_id)     e.emp_id     = 'Teacher is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      const payload = {
        class_id:   parseInt(form.class_id,   10),
        emp_id:     parseInt(form.emp_id,     10),
        section_id: parseInt(form.section_id, 10),
        subject_id: parseInt(form.subject_id, 10),
      }
      if (editing) {
        await classSectionTeacherApi.update(editing.map_id, payload)
      } else {
        await subjectTeacherApi.create(payload)
      }
      setModal(false)
      fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm('Remove this subject teacher assignment?')) return
    try { await classSectionTeacherApi.delete(item.map_id); fetchData() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader
        title="Subject Teacher"
        subtitle="Assign subject teachers to classes and sections"
        action={<button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Assign</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search by class, subject or teacher..." />
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>
        <Table headers={['Sl No.', 'Class', 'Section', 'Teacher', 'Subject', 'Actions']} empty={!loading && rows.length === 0}>
          {loading ? (
            <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : rows.map((item, i) => (
            <tr key={item.map_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td">{item.class_code   || `#${item.class_id}`}</td>
              <td className="table-td">{item.section_code || '—'}</td>
              <td className="table-td font-medium text-gray-900">{item.emp_name || `#${item.emp_id}`}</td>
              <td className="table-td">{item.subject_name || `#${item.subject_id}`}</td>
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
        title={editing ? 'Edit Subject Teacher' : 'Assign Subject Teacher'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
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
            disabled={sectionLoading || sections.length === 0}
          >
            <option value="">
              {sectionLoading ? 'Loading...' : sections.length === 0 ? 'No sections available' : '— Select Section —'}
            </option>
            {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
          </select>
          {errors.section_id && <p className="text-xs text-red-500 mt-1">{errors.section_id}</p>}
        </FormField>

        {/* Subject */}
        <FormField label="Subject" required>
          <select
            className={`input ${errors.subject_id ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.subject_id}
            onChange={e => { setForm(p => ({ ...p, subject_id: e.target.value })); if (errors.subject_id) setErrors(p => ({ ...p, subject_id: '' })) }}
            disabled={subjectLoading || subjects.length === 0}
          >
            <option value="">
              {subjectLoading ? 'Loading...' : subjects.length === 0 ? 'No subjects available' : '— Select Subject —'}
            </option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
        </FormField>

        {/* Teacher */}
        <FormField label="Teacher" required>
          <select
            className={`input ${errors.emp_id ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.emp_id}
            onChange={e => { setForm(p => ({ ...p, emp_id: e.target.value })); if (errors.emp_id) setErrors(p => ({ ...p, emp_id: '' })) }}
            disabled={teachers.length === 0}
          >
            <option value="">— Select Teacher —</option>
            {teachers.map(t => <option key={t.emp_id} value={t.emp_id}>{t.name}</option>)}
          </select>
          {errors.emp_id && <p className="text-xs text-red-500 mt-1">{errors.emp_id}</p>}
        </FormField>
      </Modal>
    </div>
  )
}
