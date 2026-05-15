'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, Table, Pagination, Modal, FormField } from '@/components/ui'
import { timetableApi, classApi, sectionApi, subjectApi, groupApi } from '@/lib/api'

const SCHOOL_ID = 1
const PER_PAGE  = 20
const DAYS      = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const AMPM      = ['AM', 'PM']
const TYPES     = [{ value: 'W', label: 'Weekly' }, { value: 'D', label: 'Daily' }]

const EMPTY_FORM = {
  class_id: '', section_id: '', school_group_id: '', subject_id: '',
  school_table_name: '', type: 'W', day: 'Mon',
  start_time: '', start_ampm: 'AM',
  end_time:   '', end_ampm:   'AM',
  duration: '',
}

export default function TimetablePage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [classes,  setClasses]  = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [groups,   setGroups]   = useState([])

  const [filterDay,     setFilterDay]     = useState('All')
  const [filterClassId, setFilterClassId] = useState('')

  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  // Load dropdowns on mount
  useEffect(() => {
    classApi.dropdown().then(r  => setClasses(r.result  || [])).catch(() => setClasses([]))
    groupApi.dropdown().then(r  => setGroups(r.result   || [])).catch(() => setGroups([]))
  }, [])

  // Cascade sections when form class changes
  useEffect(() => {
    setSections([])
    setForm(p => ({ ...p, section_id: '' }))
    if (!form.class_id) return
    sectionApi.dropdown({ class_id: form.class_id })
      .then(r => setSections(r.result || []))
      .catch(() => setSections([]))
  }, [form.class_id])

  // Cascade subjects when form class changes
  useEffect(() => {
    setSubjects([])
    setForm(p => ({ ...p, subject_id: '' }))
    if (!form.class_id) return
    subjectApi.dropdown({ class_id: form.class_id, limit: 100 })
      .then(r => setSubjects(r.result || []))
      .catch(() => setSubjects([]))
  }, [form.class_id])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await timetableApi.list({
        school_id: SCHOOL_ID,
        class_id:  filterClassId || undefined,
        search:    filterDay !== 'All' ? filterDay : undefined,
        page, limit: PER_PAGE,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [filterClassId, filterDay, page])

  useEffect(() => { fetchData() }, [fetchData])

  const closeModal = () => { setModal(false); setErrors({}) }

  const openModal = (item = null) => {
    setEditing(item)
    setForm(item ? {
      class_id:          item.class_id         != null ? String(item.class_id)         : '',
      section_id:        item.section_id        != null ? String(item.section_id)        : '',
      school_group_id:   item.school_group_id   != null ? String(item.school_group_id)   : '',
      subject_id:        item.subject_id        != null ? String(item.subject_id)        : '',
      school_table_name: item.school_table_name || '',
      type:              item.type              || 'W',
      day:               item.day               || 'Mon',
      start_time:        item.start_time        || '',
      start_ampm:        item.start_ampm        || 'AM',
      end_time:          item.end_time          || '',
      end_ampm:          item.end_ampm          || 'AM',
      duration:          item.duration          != null ? String(item.duration) : '',
    } : EMPTY_FORM)
    setErrors({})
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.school_group_id) e.school_group_id = 'Group is required'
    if (!form.class_id) e.class_id = 'Class is required'
    if (!form.section_id) e.section_id = 'Section is required'
    if (!form.subject_id) e.subject_id = 'Subject is required'
    if (!form.start_time) e.start_time = 'Start time is required'
    if (!form.end_time) e.end_time = 'End time is required'
    if (!form.duration) e.duration = 'Duration is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      const payload = {
        school_id:         SCHOOL_ID,
        class_id:          parseInt(form.class_id,        10),
        section_id:        parseInt(form.section_id,      10),
        school_group_id:   parseInt(form.school_group_id, 10),
        subject_id:        parseInt(form.subject_id,      10),
        start_time:        form.start_time,
        start_ampm:        form.start_ampm,
        end_time:          form.end_time,
        end_ampm:          form.end_ampm,
        duration:          parseInt(form.duration, 10),
        school_table_name: form.school_table_name.trim() || undefined,
        type:              form.type  || undefined,
        day:               form.day   || undefined,
        date:              null,
      }
      if (editing) {
        await timetableApi.update(editing.id, payload)
      } else {
        await timetableApi.create(payload)
      }
      setModal(false)
      fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this timetable entry?')) return
    try { await timetableApi.delete(item.id); fetchData() }
    catch (e) { alert(e.message) }
  }

  const f = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }))
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }))
  }

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle="Manage class schedules"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Entry</button>}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
          <select className="input w-40" value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setPage(1) }}>
            <option value="">— All Classes —</option>
            {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} {c.stream_name && ` - ${c.stream_name}`}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
          <div className="flex gap-1.5 flex-wrap">
            {['All', ...DAYS].map(d => (
              <button
                key={d}
                onClick={() => { setFilterDay(d); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterDay === d
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <span className="text-sm text-gray-500 self-end pb-1">{total} entries</span>
      </div>

      <div className="card">
        <Table
          headers={['Sl No.', 'Table Name', 'Class', 'Section', 'Subject', 'Day', 'Start', 'End', 'Duration', 'Actions']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr><td colSpan={10} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((item, i) => (
            <tr key={item.id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td text-gray-600">{item.school_table_name || '—'}</td>
              <td className="table-td font-medium text-gray-900">{item.class_code   || `#${item.class_id}`}</td>
              <td className="table-td">{item.section_code || `#${item.section_id}`}</td>
              <td className="table-td">{item.subject_name || `#${item.subject_id}`}</td>
              <td className="table-td">
                {item.day
                  ? <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{item.day}</span>
                  : '—'}
              </td>
              <td className="table-td">{item.start_time ? `${item.start_time} ${item.start_ampm || ''}` : '—'}</td>
              <td className="table-td">{item.end_time   ? `${item.end_time} ${item.end_ampm   || ''}` : '—'}</td>
              <td className="table-td">{item.duration != null ? `${item.duration} min` : '—'}</td>
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
        <FormField label="Table Name">
          <input className="input" value={form.school_table_name} onChange={f('school_table_name')} placeholder="e.g. 2024-25 Timetable" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Group" required>
            <select className={`input ${errors.school_group_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.school_group_id} onChange={f('school_group_id')}>
              <option value="">— Select Group —</option>
              {groups.map(g => <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>)}
            </select>
            {errors.school_group_id && <p className="text-xs text-red-500 mt-1">{errors.school_group_id}</p>}
          </FormField>
          <FormField label="Class" required>
            <select className={`input ${errors.class_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.class_id} onChange={f('class_id')}>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} {c.stream_name && ` - ${c.stream_name}`}</option>)}
            </select>
            {errors.class_id && <p className="text-xs text-red-500 mt-1">{errors.class_id}</p>}
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Section" required>
            <select className={`input ${errors.section_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.section_id} onChange={f('section_id')} disabled={!form.class_id}>
              <option value="">— Select Section —</option>
              {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
            </select>
            {errors.section_id && <p className="text-xs text-red-500 mt-1">{errors.section_id}</p>}
          </FormField>
          <FormField label="Subject" required>
            <select className={`input ${errors.subject_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.subject_id} onChange={f('subject_id')} disabled={!form.class_id}>
              <option value="">— Select Subject —</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.subject_id && <p className="text-xs text-red-500 mt-1">{errors.subject_id}</p>}
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type">
            <select className="input" value={form.type} onChange={f('type')}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </FormField>
          <FormField label="Day">
            <select className="input" value={form.day} onChange={f('day')}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Time" required>
            <div className="flex gap-2">
              <input className={`input flex-1 ${errors.start_time ? 'border-red-400 focus:ring-red-400' : ''}`} type="time" value={form.start_time} onChange={f('start_time')} />
              <select className="input w-20" value={form.start_ampm} onChange={f('start_ampm')}>
                {AMPM.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {errors.start_time && <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>}
          </FormField>
          <FormField label="End Time" required>
            <div className="flex gap-2">
              <input className={`input flex-1 ${errors.end_time ? 'border-red-400 focus:ring-red-400' : ''}`} type="time" value={form.end_time} onChange={f('end_time')} />
              <select className="input w-20" value={form.end_ampm} onChange={f('end_ampm')}>
                {AMPM.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time}</p>}
          </FormField>
        </div>
        <FormField label="Duration (minutes)" required>
          <input className={`input ${errors.duration ? 'border-red-400 focus:ring-red-400' : ''}`} type="number" min="1" value={form.duration} onChange={f('duration')} placeholder="e.g. 60" />
          {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
        </FormField>
      </Modal>
    </div>
  )
}
