'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Paperclip } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { announcementApi, groupApi, classApi, sectionApi } from '@/lib/api'

const PER_PAGE = 10
const CATEGORIES = ['EXAMS', 'EVENTS', 'CAMPUS', 'GENERAL']

const EMPTY_FORM = {
  title: '', description: '', url: '', category: '',
  school_group_id: '', class_id: '', section_id: '',
}

export default function AnnouncementPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm]       = useState(EMPTY_FORM)
  const [file, setFile]       = useState(null)
  const [fileName, setFileName] = useState('')

  // Cascade dropdowns
  const [groups, setGroups]     = useState([])
  const [classes, setClasses]   = useState([])
  const [sections, setSections] = useState([])
  const [classLoading, setClassLoading]     = useState(false)
  const [sectionLoading, setSectionLoading] = useState(false)

  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await announcementApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data || []); setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  // Load groups once
  useEffect(() => {
    groupApi.dropdown().then(r => setGroups(Array.isArray(r.result) ? r.result : [])).catch(() => setGroups([]))
  }, [])

  const handleGroupChange = async (id) => {
    setForm(f => ({ ...f, school_group_id: id, class_id: '', section_id: '' }))
    setClasses([]); setSections([])
    if (formErrors.school_group_id) setFormErrors(p => ({ ...p, school_group_id: '' }))
    if (!id) return
    setClassLoading(true)
    try {
      const classRes = await classApi.dropdown({ school_group_id: id })
      setClasses(Array.isArray(classRes.result) ? classRes.result : [])
    } catch { setClasses([]) }
    finally { setClassLoading(false) }
  }

  const handleClassChange = async (id) => {
    setForm(f => ({ ...f, class_id: id, section_id: '' }))
    setSections([])
    if (formErrors.class_id) setFormErrors(p => ({ ...p, class_id: '' }))
    if (!id) return
    setSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: id })
      setSections(Array.isArray(res.result) ? res.result : [])
    } catch { setSections([]) } finally { setSectionLoading(false) }
  }

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const resetDropdowns = () => { setClasses([]); setSections([]) }

  const openAdd = () => {
    setEditing(null); setFormErrors({})
    setFile(null); setFileName('')
    setForm(EMPTY_FORM)
    resetDropdowns()
    setModal(true)
  }

  const openEdit = async (a) => {
    setEditing(a); setFormErrors({})
    setFile(null); setFileName('')
    resetDropdowns()
    setModal(true)

    // Fetch full record to get all IDs
    let full = a
    try {
      const res = await announcementApi.getById(a.id ?? a.announcement_id)
      full = res.result || a
    } catch { /* fall back to list row */ }

    const groupId   = full.school_group_id || full.group_id  || a.school_group_id || a.group_id
    const classId   = full.class_id   || a.class_id
    const sectionId = full.section_id || a.section_id

    setForm({
      title:           full.title       || a.title       || '',
      description:     full.description || a.description || a.content || '',
      url:             full.url         || a.url         || '',
      category:        full.category    || a.category    || '',
      school_group_id: groupId   ? String(groupId)   : '',
      class_id:        classId   ? String(classId)   : '',
      section_id:      sectionId ? String(sectionId) : '',
    })

    if (groupId) {
      setClassLoading(true)
      try {
        const classRes = await classApi.dropdown({ school_group_id: groupId })
        setClasses(Array.isArray(classRes.result) ? classRes.result : [])
      } catch { setClasses([]) }
      finally { setClassLoading(false) }
    }
    if (classId) {
      setSectionLoading(true)
      try {
        const secRes = await sectionApi.dropdown({ class_id: classId })
        setSections(Array.isArray(secRes.result) ? secRes.result : [])
      } catch { setSections([]) }
      finally { setSectionLoading(false) }
    }
  }

  const validate = () => {
    const ve = {}
    if (!form.title.trim())    ve.title           = 'Title is required'
    if (!form.school_group_id) ve.school_group_id = 'Group is required'
    if (!form.class_id)        ve.class_id        = 'Class is required'
    return ve
  }

  const handleSave = async () => {
    const ve = validate()
    if (Object.keys(ve).length) { setFormErrors(ve); return }
    setSaving(true)
    try {
      const payload = {
        title:           form.title,
        description:     form.description  || undefined,
        url:             form.url          || undefined,
        category:        form.category     || undefined,
        school_group_id: Number(form.school_group_id),
        class_id:        Number(form.class_id),
        section_id:      form.section_id ? Number(form.section_id) : undefined,
      }
      if (editing) {
        await announcementApi.update(editing.id ?? editing.announcement_id, payload, file || undefined)
      } else {
        await announcementApi.create(payload, file || undefined)
      }
      setModal(false); fetchAnnouncements()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const confirmDelete = (id) => { setDeleteId(id); setConfirmOpen(true) }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await announcementApi.delete(deleteId)
      setConfirmOpen(false); fetchAnnouncements()
    } catch (e) { alert(e.message) }
    finally { setDeleting(false) }
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f); setFileName(f.name)
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const categoryColor = {
    EXAMS:   'bg-red-100 text-red-700',
    EVENTS:  'bg-blue-100 text-blue-700',
    CAMPUS:  'bg-purple-100 text-purple-700',
    GENERAL: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Post important announcements for the school community"
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Announcement
          </button>
        }
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search announcements..." />
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>

        <Table headers={['Sl No.', 'Title', 'Category', 'Description', 'Date', 'File', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((a, i) => (
            <tr key={a.id ?? a.announcement_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-semibold text-gray-900">{a.title || '—'}</td>
              <td className="table-td">
                {a.category ? (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor[a.category] || 'bg-gray-100 text-gray-600'}`}>
                    {a.category}
                  </span>
                ) : '—'}
              </td>
              <td className="table-td text-gray-500 max-w-xs truncate">{a.description || a.content || '—'}</td>
              <td className="table-td whitespace-nowrap text-gray-600">{formatDate(a.date || a.created_at)}</td>
              <td className="table-td">
                {(a.id ?? a.announcement_id) ? (
                  <a href={announcementApi.fileUrl(a.id ?? a.announcement_id)} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs">
                    <Paperclip className="w-3 h-3" /> View
                  </a>
                ) : '—'}
              </td>
              <td className="table-td">
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => confirmDelete(a.id ?? a.announcement_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
        title={editing ? 'Edit Announcement' : 'Add Announcement'}
        footer={
          <>
            <button onClick={() => { setModal(false); setFormErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Publish'}</button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Group */}
          <FormField label="Group" required>
            <select
              className={`input ${formErrors.school_group_id ? 'border-red-400' : ''}`}
              value={form.school_group_id}
              onChange={e => handleGroupChange(e.target.value)}
            >
              <option value="">— Select Group —</option>
              {groups.map(g => <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>)}
            </select>
            {formErrors.school_group_id && <p className="text-xs text-red-500 mt-1">{formErrors.school_group_id}</p>}
          </FormField>

          {/* Class */}
          <FormField label="Class" required>
            <select
              className={`input ${formErrors.class_id ? 'border-red-400' : ''}`}
              value={form.class_id}
              onChange={e => handleClassChange(e.target.value)}
              disabled={classLoading || !form.school_group_id}
            >
              <option value="">
                {classLoading ? 'Loading...' : !form.school_group_id ? '— Select Group first —' : classes.length === 0 ? 'No classes available' : '— Select Class —'}
              </option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}</option>)}
            </select>
            {formErrors.class_id && <p className="text-xs text-red-500 mt-1">{formErrors.class_id}</p>}
          </FormField>

          {/* Section */}
          <FormField label="Section">
            <select
              className="input"
              value={form.section_id}
              onChange={e => setForm(f => ({ ...f, section_id: e.target.value }))}
              disabled={sectionLoading || !form.class_id}
            >
              <option value="">
                {sectionLoading ? 'Loading...' : !form.class_id ? '— Select Class first —' : sections.length === 0 ? 'No sections available' : '— Select Section (optional) —'}
              </option>
              {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
            </select>
          </FormField>

          <hr className="border-gray-100" />

          {/* Title */}
          <FormField label="Title" required>
            <input
              className={`input ${formErrors.title ? 'border-red-400' : ''}`}
              placeholder="Announcement title..."
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (formErrors.title) setFormErrors(p => ({ ...p, title: '' })) }}
            />
            {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
          </FormField>

          {/* Category */}
          <FormField label="Category">
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">— Select Category —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Write announcement description..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </FormField>

          {/* URL */}
          <FormField label="URL">
            <input
              className="input"
              placeholder="https://..."
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            />
          </FormField>

          {/* File */}
          <FormField label="Attachment (optional)">
            <label className="flex items-center gap-2 cursor-pointer input py-2 text-sm text-gray-500 hover:border-primary-400 transition-colors">
              <Paperclip className="w-4 h-4 shrink-0" />
              <span className="truncate">{fileName || 'Choose file...'}</span>
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Announcement"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this announcement? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
