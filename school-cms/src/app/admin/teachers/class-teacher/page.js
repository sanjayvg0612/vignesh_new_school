'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { classSectionTeacherApi, classTeacherApi, employeeApi, classApi, sectionApi, groupApi, roleApi } from '@/lib/api'

const PER_PAGE = 10

export default function ClassTeacherPage() {
  const [rows, setRows]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)

  const [teachers, setTeachers] = useState([])
  const [groups, setGroups]     = useState([])
  const [classes, setClasses]   = useState([])
  const [sections, setSections] = useState([])
  const [roles, setRoles]       = useState([])
  const [teacherLoading, setTeacherLoading] = useState(false)

  const [classLoading, setClassLoading]     = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)

  const [form, setForm]   = useState({ group_id: '', class_id: '', section_id: '', role_id: '', emp_id: '' })
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await classSectionTeacherApi.list({ page, limit: PER_PAGE, search: search || undefined, })
      const result = res.result || {}
      const groups = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : []
      const flat = []
      groups.forEach(g => {
        if (g.class_teacher?.emp_id) {
          flat.push({
            map_id:       g.class_teacher.map_id,
            emp_id:       g.class_teacher.emp_id,
            emp_name:     g.class_teacher.emp_name,
            class_id:     g.class_id,
            class_code:   g.class_code,
            section_id:   g.section_id,
            section_code: g.section_code,
            group_id:     g.school_group_id || g.group_id || '',
          })
        }
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
    setForm(item ? {
      group_id:   String(item.group_id   || ''),
      class_id:   String(item.class_id   || ''),
      section_id: String(item.section_id || ''),
      role_id:    '',
      emp_id:     String(item.emp_id     || ''),
    } : { group_id: '', class_id: '', section_id: '', role_id: '', emp_id: '' })
    setTeachers([])

    try {
      const [groupRes, roleRes, teacherRes] = await Promise.all([
        groupApi.dropdown(),
        roleApi.dropdown(),
        employeeApi.dropdown(),
      ])
      setGroups(Array.isArray(groupRes.result)     ? groupRes.result    : [])
      setRoles(Array.isArray(roleRes.result)       ? roleRes.result     : [])
      setTeachers(Array.isArray(teacherRes.result) ? teacherRes.result  : [])
    } catch { setGroups([]); setRoles([]); setTeachers([]) }

    // Edit mode: load classes and sections for existing values
    if (item?.class_id) {
      setClassLoading(true)
      setSectionLoading(true)
      try {
        const [classRes, secRes] = await Promise.all([
          classApi.dropdown({ school_group_id: item.group_id || undefined }),
          sectionApi.dropdown({ class_id: item.class_id }),
        ])
        setClasses(Array.isArray(classRes.result) ? classRes.result : [])
        setSections(Array.isArray(secRes.result)  ? secRes.result   : [])
      } catch { setClasses([]); setSections([]) }
      finally { setClassLoading(false); setSectionLoading(false) }
    }

    setModal(true)
  }

  const handleGroupChange = async (id) => {
    setForm(p => ({ ...p, group_id: id, class_id: '', section_id: '' }))
    setClasses([])
    setSections([])
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

  const handleRoleChange = (id) => {
    setForm(p => ({ ...p, role_id: id, emp_id: '' }))
    if (errors.role_id) setErrors(p => ({ ...p, role_id: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.group_id)   e.group_id   = 'Group is required'
    if (!form.class_id)   e.class_id   = 'Class is required'
    if (!form.section_id) e.section_id = 'Section is required'
    if (!form.role_id)    e.role_id    = 'Role is required'
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
        role_id:    parseInt(form.role_id,    10),
        section_id: parseInt(form.section_id, 10),
      }
      if (editing) {
        await classSectionTeacherApi.update(editing.map_id, payload)
      } else {
        await classTeacherApi.create(payload)
      }
      setModal(false)
      fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm('Remove this class teacher assignment?')) return
    try { await classSectionTeacherApi.delete(item.map_id); fetchData() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader
        title="Class Teacher"
        subtitle="Assign class teachers to classes"
        action={<button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Assign</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search by class or teacher..." />
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>
        <Table headers={['Sl No.', 'Class', 'Section', 'Class Teacher', 'Actions']} empty={!loading && rows.length === 0}>
          {loading ? (
            <tr><td colSpan={5} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : rows.map((item, i) => (
            <tr key={item.map_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td">{item.class_code   || `#${item.class_id}`}</td>
              <td className="table-td">{item.section_code || '—'}</td>
              <td className="table-td font-medium text-gray-900">{item.emp_name || `#${item.emp_id}`}</td>
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
        title={editing ? 'Edit Class Teacher' : 'Assign Class Teacher'}
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
            disabled={classLoading || classes.length === 0}
          >
            <option value="">
              {classLoading ? 'Loading...' : classes.length === 0 ? 'No classes available' : '— Select Class —'}
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

        {/* Role */}
        <FormField label="Role" required>
          <select
            className={`input ${errors.role_id ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.role_id}
            onChange={e => handleRoleChange(e.target.value)}
          >
            <option value="">— Select Role —</option>
            {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
          </select>
          {errors.role_id && <p className="text-xs text-red-500 mt-1">{errors.role_id}</p>}
        </FormField>

        {/* Teacher */}
        <FormField label="Select Teacher Name" required>
          <select
            className={`input ${errors.emp_id ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.emp_id}
            onChange={e => { setForm(p => ({ ...p, emp_id: e.target.value })); if (errors.emp_id) setErrors(p => ({ ...p, emp_id: '' })) }}
            disabled={teacherLoading || teachers.length === 0}
          >
            <option value="">
              {teacherLoading ? 'Loading...' : '— Select Teacher Name —'}
            </option>
            {teachers.map(t => <option key={t.emp_id} value={t.emp_id}>{t.name}</option>)}
          </select>
          {errors.emp_id && <p className="text-xs text-red-500 mt-1">{errors.emp_id}</p>}
        </FormField>
      </Modal>
    </div>
  )
}
