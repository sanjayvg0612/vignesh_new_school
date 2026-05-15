'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField } from '@/components/ui'
import { classSectionTeacherApi, employeeApi, classApi, sectionApi } from '@/lib/api'

const PER_PAGE = 10
const TEACHER_TYPES = ['class_teacher', 'subject_teacher']
const toLabel = (s) => s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''

export default function TeacherMappingPage() {
  const [rows, setRows]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses]   = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState({
    class_id: '', section_id: '', emp_id: '',
    teacher_type: 'class_teacher', subject_id: '',
  })

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchMappings = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await classSectionTeacherApi.list({ page, limit: PER_PAGE })
      const result = res.result || {}
      // Flatten grouped response into flat rows
      const groups = result.data || result || []
      const flat = []
      ;(Array.isArray(groups) ? groups : []).forEach(g => {
        if (g.class_teacher?.emp_id) {
          flat.push({
            map_id:       g.class_teacher.map_id,
            emp_id:       g.class_teacher.emp_id,
            emp_name:     g.class_teacher.emp_name,
            class_id:     g.class_id,
            class_code:   g.class_code,
            section_id:   g.section_id,
            section_code: g.section_code,
            teacher_type: 'class_teacher',
            subject_id:   null,
            subject_name: '—',
          })
        }
        ;(g.subject_teachers || []).forEach(st => {
          flat.push({
            map_id:       st.map_id,
            emp_id:       st.emp_id,
            emp_name:     st.emp_name,
            class_id:     g.class_id,
            class_code:   g.class_code,
            section_id:   g.section_id,
            section_code: g.section_code,
            teacher_type: 'subject_teacher',
            subject_id:   st.subject_id,
            subject_name: st.subject_name,
          })
        })
      })
      setRows(flat)
      setTotal(result.total || flat.length)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchMappings() }, [fetchMappings])

  const openModal = async (item = null) => {
    setEditing(item)
    setFormErrors({})
    setForm(item ? {
      class_id:     String(item.class_id   || ''),
      section_id:   String(item.section_id || ''),
      emp_id:       String(item.emp_id     || ''),
      teacher_type: item.teacher_type || 'class_teacher',
      subject_id:   String(item.subject_id || ''),
    } : { class_id: '', section_id: '', emp_id: '', teacher_type: 'class_teacher', subject_id: '' })
    try {
      const [teacherRes, classRes] = await Promise.all([
        employeeApi.dropdown(),
        classApi.dropdown(),
      ])
      setTeachers(teacherRes.result || [])
      setClasses(classRes.result   || [])
    } catch { setTeachers([]); setClasses([]) }
    setModal(true)
  }

  const handleSave = async () => {
    const fe = {}
    if (!form.class_id) fe.class_id = 'Class is required'
    if (!form.emp_id) fe.emp_id = 'Teacher is required'
    if (Object.keys(fe).length) { setFormErrors(fe); return }
    setSaving(true)
    try {
      const payload = {
        class_id:     parseInt(form.class_id,   10),
        section_id:   form.section_id ? parseInt(form.section_id, 10) : undefined,
        emp_id:       parseInt(form.emp_id,     10),
        teacher_type: form.teacher_type,
        subject_id:   form.teacher_type === 'subject_teacher' && form.subject_id
                        ? parseInt(form.subject_id, 10) : undefined,
      }
      if (editing) {
        await classSectionTeacherApi.update(editing.map_id, payload)
      } else {
        await classSectionTeacherApi.create(payload)
      }
      setFormErrors({})
      setModal(false)
      fetchMappings()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm('Remove this teacher mapping?')) return
    try { await classSectionTeacherApi.delete(item.map_id); fetchMappings() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader
        title="Teacher Mapping"
        subtitle="Assign teachers to classes and sections"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Assign Teacher</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <Table headers={['Sl No.', 'Class', 'Section', 'Teacher', 'Type', 'Subject', 'Actions']} empty={!loading && rows.length === 0}>
          {loading ? (
            <tr><td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : rows.map((item, i) => (
            <tr key={item.map_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td">{item.class_code   || `#${item.class_id}`}</td>
              <td className="table-td">{item.section_code || '—'}</td>
              <td className="table-td font-medium text-gray-900">{item.emp_name || `#${item.emp_id}`}</td>
              <td className="table-td">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.teacher_type === 'class_teacher' ? 'bg-primary-50 text-primary-700' : 'bg-purple-50 text-purple-700'}`}>
                  {toLabel(item.teacher_type)}
                </span>
              </td>
              <td className="table-td">{item.subject_name || '—'}</td>
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
        onClose={() => { setModal(false); setFormErrors({}) }}
        title={editing ? 'Edit Mapping' : 'Assign Teacher'}
        footer={
          <>
            <button onClick={() => { setModal(false); setFormErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Class" required>
          <select className={`input ${formErrors.class_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.class_id} onChange={e => { setForm(f => ({ ...f, class_id: e.target.value })); if(formErrors.class_id) setFormErrors(p=>({...p,class_id:''})) }}>
            <option value="">— Select Class —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {formErrors.class_id && <p className="text-xs text-red-500 mt-1">{formErrors.class_id}</p>}
        </FormField>
        <FormField label="Section ID">
          <input className="input" type="number" value={form.section_id} onChange={e => setForm(f => ({ ...f, section_id: e.target.value }))} placeholder="Leave blank if not applicable" />
        </FormField>
        <FormField label="Teacher" required>
          <select className={`input ${formErrors.emp_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.emp_id} onChange={e => { setForm(f => ({ ...f, emp_id: e.target.value })); if(formErrors.emp_id) setFormErrors(p=>({...p,emp_id:''})) }}>
            <option value="">— Select Teacher —</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {formErrors.emp_id && <p className="text-xs text-red-500 mt-1">{formErrors.emp_id}</p>}
        </FormField>
        <FormField label="Teacher Type" required>
          <select className="input" value={form.teacher_type} onChange={e => setForm(f => ({ ...f, teacher_type: e.target.value, subject_id: '' }))}>
            {TEACHER_TYPES.map(t => <option key={t} value={t}>{toLabel(t)}</option>)}
          </select>
        </FormField>
        {form.teacher_type === 'subject_teacher' && (
          <FormField label="Subject ID" required>
            <input className="input" type="number" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} placeholder="Enter Subject ID" />
          </FormField>
        )}
      </Modal>
    </div>
  )
}
