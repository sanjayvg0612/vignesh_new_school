'use client'
import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Modal, FormField } from '@/components/ui'
import { classSectionTeacherApi, classApi, sectionApi, subjectApi, groupApi, employeeApi, roleApi } from '@/lib/api'

export default function SectionClassTeacherPage() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Filter dropdowns
  const [filterGroups, setFilterGroups]     = useState([])
  const [filterClasses, setFilterClasses]   = useState([])
  const [filterSections, setFilterSections] = useState([])
  const [groupId, setGroupId]               = useState('')
  const [classId, setClassId]               = useState('')
  const [sectionId, setSectionId]           = useState('')
  const [search, setSearch]                 = useState('')
  const [classLoading, setClassLoading]     = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)

  // Class Teacher edit modal
  const [ctModal, setCtModal]   = useState(false)
  const [ctItem, setCtItem]     = useState(null)   // { map_id, class_id, section_id, emp_id }
  const [ctRoles, setCtRoles]   = useState([])
  const [ctTeachers, setCtTeachers] = useState([])
  const [ctClasses, setCtClasses]   = useState([])
  const [ctSections, setCtSections] = useState([])
  const [ctForm, setCtForm]     = useState({ class_id: '', section_id: '', role_id: '', emp_id: '' })
  const [ctErrors, setCtErrors] = useState({})
  const [ctSaving, setCtSaving] = useState(false)
  const [ctSecLoading, setCtSecLoading] = useState(false)

  // Subject Teacher edit modal
  const [stModal, setStModal]     = useState(false)
  const [stItem, setStItem]       = useState(null)
  const [stTeachers, setStTeachers] = useState([])
  const [stClasses, setStClasses]   = useState([])
  const [stSections, setStSections] = useState([])
  const [stSubjects, setStSubjects] = useState([])
  const [stForm, setStForm]       = useState({ class_id: '', section_id: '', subject_id: '', emp_id: '' })
  const [stErrors, setStErrors]   = useState({})
  const [stSaving, setStSaving]   = useState(false)

  useEffect(() => {
    groupApi.dropdown().then(r => setFilterGroups(Array.isArray(r.result) ? r.result : [])).catch(() => setFilterGroups([]))
  }, [])

  const handleGroupChange = async (id) => {
    setGroupId(id); setClassId(''); setSectionId(''); setFilterClasses([]); setFilterSections([])
    if (!id) return
    setClassLoading(true)
    try {
      const res = await classApi.dropdown({ school_group_id: id })
      setFilterClasses(Array.isArray(res.result) ? res.result : [])
    } catch { setFilterClasses([]) } finally { setClassLoading(false) }
  }

  const handleClassChange = async (id) => {
    setClassId(id); setSectionId(''); setFilterSections([])
    if (!id) return
    setSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: id })
      setFilterSections(Array.isArray(res.result) ? res.result : [])
    } catch { setFilterSections([]) } finally { setSectionLoading(false) }
  }

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await classSectionTeacherApi.list({
        school_group_id: groupId   || undefined,
        class_id:        classId   || undefined,
        section_id:      sectionId || undefined,
        search:          search    || undefined,
        limit: 100,
      })
      const result = res.result || {}
      setData(Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [groupId, classId, sectionId, search])

  useEffect(() => { fetchData() }, [fetchData])

  const clearFilters = () => {
    setGroupId(''); setClassId(''); setSectionId(''); setSearch('')
    setFilterClasses([]); setFilterSections([])
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (mapId) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return
    try {
      await classSectionTeacherApi.delete(mapId)
      fetchData()
    } catch (e) { alert(e.message) }
  }

  // ── Class Teacher Edit ────────────────────────────────────────────────────────
  const openCtEdit = async (g) => {
    const ct = g.class_teacher || {}
    setCtItem({ map_id: ct.map_id, class_id: g.class_id, section_id: g.section_id })
    setCtForm({
      class_id:   String(g.class_id   || ''),
      section_id: String(g.section_id || ''),
      role_id:    '',
      emp_id:     String(ct.emp_id    || ''),
    })
    setCtErrors({})
    setCtModal(true)

    try {
      const [classRes, roleRes, teacherRes] = await Promise.all([
        classApi.dropdown(),
        roleApi.dropdown(),
        employeeApi.dropdown(),
      ])
      setCtClasses(Array.isArray(classRes.result)   ? classRes.result   : [])
      setCtRoles(Array.isArray(roleRes.result)      ? roleRes.result    : [])
      setCtTeachers(Array.isArray(teacherRes.result) ? teacherRes.result : [])
    } catch { setCtClasses([]); setCtRoles([]); setCtTeachers([]) }

    if (g.class_id) {
      setCtSecLoading(true)
      try {
        const res = await sectionApi.dropdown({ class_id: g.class_id })
        setCtSections(Array.isArray(res.result) ? res.result : [])
      } catch { setCtSections([]) } finally { setCtSecLoading(false) }
    }
  }

  const handleCtSave = async () => {
    const e = {}
    if (!ctForm.class_id)   e.class_id   = 'Class is required'
    if (!ctForm.section_id) e.section_id = 'Section is required'
    if (!ctForm.role_id)    e.role_id    = 'Role is required'
    if (!ctForm.emp_id)     e.emp_id     = 'Teacher is required'
    if (Object.keys(e).length) { setCtErrors(e); return }
    setCtSaving(true)
    try {
      await classSectionTeacherApi.update(ctItem.map_id, {
        class_id:   parseInt(ctForm.class_id,   10),
        section_id: parseInt(ctForm.section_id, 10),
        role_id:    parseInt(ctForm.role_id,    10),
        emp_id:     parseInt(ctForm.emp_id,     10),
      })
      setCtModal(false)
      fetchData()
    } catch (e) { alert(e.message) }
    finally { setCtSaving(false) }
  }

  // ── Subject Teacher Edit ──────────────────────────────────────────────────────
  const openStEdit = async (g, st) => {
    setStItem({ map_id: st.map_id })
    setStForm({
      class_id:   String(g.class_id    || ''),
      section_id: String(g.section_id  || ''),
      subject_id: String(st.subject_id || ''),
      emp_id:     String(st.emp_id     || ''),
    })
    setStErrors({})
    setStModal(true)

    try {
      const [classRes, teacherRes] = await Promise.all([
        classApi.dropdown(),
        employeeApi.dropdown(),
      ])
      setStClasses(Array.isArray(classRes.result)    ? classRes.result    : [])
      setStTeachers(Array.isArray(teacherRes.result) ? teacherRes.result  : [])
    } catch { setStClasses([]); setStTeachers([]) }

    if (g.class_id) {
      try {
        const [secRes, subRes] = await Promise.all([
          sectionApi.dropdown({ class_id: g.class_id }),
          subjectApi.dropdown({ class_id: g.class_id }),
        ])
        setStSections(Array.isArray(secRes.result) ? secRes.result : [])
        const subRaw = subRes.result
        setStSubjects(Array.isArray(subRaw) ? subRaw : Array.isArray(subRaw?.data) ? subRaw.data : [])
      } catch { setStSections([]); setStSubjects([]) }
    }
  }

  const handleStSave = async () => {
    const e = {}
    if (!stForm.class_id)   e.class_id   = 'Class is required'
    if (!stForm.section_id) e.section_id = 'Section is required'
    if (!stForm.subject_id) e.subject_id = 'Subject is required'
    if (!stForm.emp_id)     e.emp_id     = 'Teacher is required'
    if (Object.keys(e).length) { setStErrors(e); return }
    setStSaving(true)
    try {
      await classSectionTeacherApi.update(stItem.map_id, {
        class_id:   parseInt(stForm.class_id,   10),
        section_id: parseInt(stForm.section_id, 10),
        subject_id: parseInt(stForm.subject_id, 10),
        emp_id:     parseInt(stForm.emp_id,     10),
      })
      setStModal(false)
      fetchData()
    } catch (e) { alert(e.message) }
    finally { setStSaving(false) }
  }

  return (
    <div>
      <PageHeader
        title="Class Section & Teacher View"
        subtitle="View class sections with assigned class and subject teachers"
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Group <span className="text-red-500">*</span></label>
          <select className="input w-36" value={groupId} onChange={e => handleGroupChange(e.target.value)}>
            <option value="">— Select —</option>
            {filterGroups.map(g => <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class <span className="text-red-500">*</span></label>
          <select className="input w-36" value={classId} onChange={e => handleClassChange(e.target.value)} disabled={classLoading || !groupId || filterClasses.length === 0}>
            <option value="">{classLoading ? 'Loading...' : !groupId ? '— Select —' : filterClasses.length === 0 ? 'No classes' : '— Select —'}</option>
            {filterClasses.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Section <span className="text-red-500">*</span></label>
          <select className="input w-36" value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={sectionLoading || !classId || filterSections.length === 0}>
            <option value="">{sectionLoading ? 'Loading...' : !classId ? '— Select —' : filterSections.length === 0 ? 'No sections' : '— Select —'}</option>
            {filterSections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <input className="input w-48" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button className="btn-secondary text-xs" onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      {loading && <div className="card p-8 text-center text-gray-400 text-sm">Loading...</div>}
      {!loading && data.length === 0 && <div className="card p-8 text-center text-gray-400 text-sm">No data found</div>}

      <div className="space-y-4">
        {data.map((g, gi) => (
          <div key={gi} className="card overflow-hidden">
            {/* Card Header */}
            <div className="bg-primary-50 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary-800 text-sm">{g.class_code || `Class #${g.class_id}`}</span>
                {g.section_code && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                    Section: {g.section_code}
                  </span>
                )}
                {g.group_name && <span className="text-xs text-gray-500">{g.group_name}</span>}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Class Teacher */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Class Teacher</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openCtEdit(g)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600" title="Edit Class Teacher">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {g.class_teacher?.map_id && (
                      <button onClick={() => handleDelete(g.class_teacher.map_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Remove Class Teacher">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {g.class_teacher?.emp_id ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                      {(g.class_teacher.emp_name || 'T')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{g.class_teacher.emp_name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not assigned</span>
                )}
              </div>

              {/* Subject Teachers */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subject Teachers</p>
                {g.subject_teachers?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                          <th className="pb-2 pr-6 font-medium">Subject</th>
                          <th className="pb-2 font-medium">Teacher</th>
                          <th className="pb-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {g.subject_teachers.map((st, si) => (
                          <tr key={si}>
                            <td className="py-2 pr-6 text-gray-700">{st.subject_name || `#${st.subject_id}`}</td>
                            <td className="py-2 font-medium text-gray-900">{st.emp_name || `#${st.emp_id}`}</td>
                            <td className="py-2">
                              <div className="flex items-center gap-1">
                                <button onClick={() => openStEdit(g, st)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600" title="Edit Subject Teacher">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {st.map_id && (
                                  <button onClick={() => handleDelete(st.map_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Remove Subject Teacher">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">No subject teachers assigned</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Class Teacher Edit Modal */}
      <Modal
        open={ctModal}
        onClose={() => { setCtModal(false); setCtErrors({}) }}
        title="Edit Class Teacher"
        footer={
          <>
            <button onClick={() => { setCtModal(false); setCtErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleCtSave} className="btn-primary" disabled={ctSaving}>{ctSaving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Class" required>
          <select className={`input ${ctErrors.class_id ? 'border-red-400' : ''}`} value={ctForm.class_id}
            onChange={e => { setCtForm(p => ({ ...p, class_id: e.target.value })); if (ctErrors.class_id) setCtErrors(p => ({ ...p, class_id: '' })) }}>
            <option value="">— Select Class —</option>
            {ctClasses.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
          </select>
          {ctErrors.class_id && <p className="text-xs text-red-500 mt-1">{ctErrors.class_id}</p>}
        </FormField>
        <FormField label="Section" required>
          <select className={`input ${ctErrors.section_id ? 'border-red-400' : ''}`} value={ctForm.section_id}
            onChange={e => { setCtForm(p => ({ ...p, section_id: e.target.value })); if (ctErrors.section_id) setCtErrors(p => ({ ...p, section_id: '' })) }}
            disabled={ctSecLoading || ctSections.length === 0}>
            <option value="">{ctSecLoading ? 'Loading...' : '— Select Section —'}</option>
            {ctSections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
          </select>
          {ctErrors.section_id && <p className="text-xs text-red-500 mt-1">{ctErrors.section_id}</p>}
        </FormField>
        <FormField label="Role" required>
          <select className={`input ${ctErrors.role_id ? 'border-red-400' : ''}`} value={ctForm.role_id}
            onChange={e => { setCtForm(p => ({ ...p, role_id: e.target.value })); if (ctErrors.role_id) setCtErrors(p => ({ ...p, role_id: '' })) }}>
            <option value="">— Select Role —</option>
            {ctRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {ctErrors.role_id && <p className="text-xs text-red-500 mt-1">{ctErrors.role_id}</p>}
        </FormField>
        <FormField label="Teacher" required>
          <select className={`input ${ctErrors.emp_id ? 'border-red-400' : ''}`} value={ctForm.emp_id}
            onChange={e => { setCtForm(p => ({ ...p, emp_id: e.target.value })); if (ctErrors.emp_id) setCtErrors(p => ({ ...p, emp_id: '' })) }}>
            <option value="">— Select Teacher —</option>
            {ctTeachers.map(t => <option key={t.emp_id ?? t.id} value={t.emp_id ?? t.id}>{t.name}</option>)}
          </select>
          {ctErrors.emp_id && <p className="text-xs text-red-500 mt-1">{ctErrors.emp_id}</p>}
        </FormField>
      </Modal>

      {/* Subject Teacher Edit Modal */}
      <Modal
        open={stModal}
        onClose={() => { setStModal(false); setStErrors({}) }}
        title="Edit Subject Teacher"
        footer={
          <>
            <button onClick={() => { setStModal(false); setStErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleStSave} className="btn-primary" disabled={stSaving}>{stSaving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <FormField label="Class" required>
          <select className={`input ${stErrors.class_id ? 'border-red-400' : ''}`} value={stForm.class_id}
            onChange={e => { setStForm(p => ({ ...p, class_id: e.target.value })); if (stErrors.class_id) setStErrors(p => ({ ...p, class_id: '' })) }}>
            <option value="">— Select Class —</option>
            {stClasses.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
          </select>
          {stErrors.class_id && <p className="text-xs text-red-500 mt-1">{stErrors.class_id}</p>}
        </FormField>
        <FormField label="Section" required>
          <select className={`input ${stErrors.section_id ? 'border-red-400' : ''}`} value={stForm.section_id}
            onChange={e => { setStForm(p => ({ ...p, section_id: e.target.value })); if (stErrors.section_id) setStErrors(p => ({ ...p, section_id: '' })) }}
            disabled={stSections.length === 0}>
            <option value="">— Select Section —</option>
            {stSections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
          </select>
          {stErrors.section_id && <p className="text-xs text-red-500 mt-1">{stErrors.section_id}</p>}
        </FormField>
        <FormField label="Subject" required>
          <select className={`input ${stErrors.subject_id ? 'border-red-400' : ''}`} value={stForm.subject_id}
            onChange={e => { setStForm(p => ({ ...p, subject_id: e.target.value })); if (stErrors.subject_id) setStErrors(p => ({ ...p, subject_id: '' })) }}
            disabled={stSubjects.length === 0}>
            <option value="">— Select Subject —</option>
            {stSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {stErrors.subject_id && <p className="text-xs text-red-500 mt-1">{stErrors.subject_id}</p>}
        </FormField>
        <FormField label="Teacher" required>
          <select className={`input ${stErrors.emp_id ? 'border-red-400' : ''}`} value={stForm.emp_id}
            onChange={e => { setStForm(p => ({ ...p, emp_id: e.target.value })); if (stErrors.emp_id) setStErrors(p => ({ ...p, emp_id: '' })) }}>
            <option value="">— Select Teacher —</option>
            {stTeachers.map(t => <option key={t.emp_id ?? t.id} value={t.emp_id ?? t.id}>{t.name}</option>)}
          </select>
          {stErrors.emp_id && <p className="text-xs text-red-500 mt-1">{stErrors.emp_id}</p>}
        </FormField>
      </Modal>
    </div>
  )
}
