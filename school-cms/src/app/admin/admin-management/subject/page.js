'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, ImageIcon, X, ZoomIn } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'
import { subjectApi, classApi, getSchoolId } from '@/lib/api'

const PER_PAGE = 10

const toApiStatus = (s) => s.toLowerCase()
const toUiStatus  = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export default function SubjectPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({
    subject_name: '', description: '', class_id: '', status: 'Active',
  })
  const [imageFile, setImageFile]     = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [classes, setClasses]         = useState([])
  const [errors, setErrors]           = useState({})
  const [lightbox, setLightbox]       = useState(null)   // URL to show in popup
  const fileRef = useRef()

  const getImg = (s) => s.image_link || s.image_url || null

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await subjectApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchSubjects() }, [fetchSubjects])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const closeModal = () => {
    setModal(false)
    setErrors({})
    setImageFile(null)
    setImagePreview(null)
  }

  const openModal = async (subject = null) => {
    setEditing(subject)
    setImageFile(null)
    setImagePreview(subject ? getImg(subject) : null)
    setForm(subject ? {
      subject_name: subject.subject_name,
      description:  subject.description || '',
      class_id:     String(subject.class_id),
      status:       toUiStatus(subject.status),
    } : { subject_name: '', description: '', class_id: '', status: 'Active' })
    setErrors({})
    try {
      const res = await classApi.dropdown()
      setClasses(res.result || [])
    } catch { setClasses([]) }
    setModal(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const validate = () => {
    const e = {}
    if (!editing && !form.class_id) e.class_id = 'Class is required'
    if (!form.subject_name.trim()) e.subject_name = 'Subject name is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      if (editing) {
        await subjectApi.update(editing.subject_id, {
          subject_name: form.subject_name,
          description:  form.description  || undefined,
          class_id:     parseInt(form.class_id, 10) || undefined,
          status:       toApiStatus(form.status),
          image:        imageFile || undefined,
        })
      } else {
        await subjectApi.create({
          school_id:    getSchoolId(),
          class_id:     parseInt(form.class_id, 10),
          subject_name: form.subject_name,
          description:  form.description  || undefined,
          status:       toApiStatus(form.status),
          image:        imageFile || undefined,
        })
      }
      setModal(false)
      fetchSubjects()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return
    try {
      await subjectApi.delete(id)
      fetchSubjects()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Subject"
        subtitle="Manage school subjects"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Subject</button>}
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search subjects..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>

        <Table headers={['Sl No.', 'Image', 'Class', 'Stream', 'Subject Name', 'Description', 'Status', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr>
              <td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((s, i) => (
            <tr key={s.subject_id} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td">
                {getImg(s) ? (
                  <button onClick={() => setLightbox(getImg(s))} className="relative group">
                    <img src={getImg(s)} alt={s.subject_name} className="w-10 h-10 rounded object-cover border border-gray-200" />
                    <div className="absolute inset-0 bg-black/40 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </td>
              <td className="table-td">{s.class_code  || s.class_id}</td>
              <td className="table-td">{s.stream_name || '—'}</td>
              <td className="table-td font-medium text-gray-900">{s.subject_name}</td>
              <td className="table-td text-gray-500 max-w-[160px] truncate">{s.description || '—'}</td>
              <td className="table-td"><StatusBadge status={toUiStatus(s.status)} /></td>
              <td className="table-td">
                <div className="flex items-center gap-2">
                  <button onClick={() => openModal(s)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.subject_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Image Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt="Subject"
            className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Subject' : 'Add Subject'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <FormField label="Class" required>
          <select
            className={`input ${errors.class_id ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.class_id}
            onChange={e => { setForm(f => ({ ...f, class_id: e.target.value })); if (errors.class_id) setErrors(p => ({ ...p, class_id: '' })) }}
          >
            <option value="">— Select Class —</option>
            {classes.map(c => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}
              </option>
            ))}
          </select>
          {errors.class_id && <p className="text-xs text-red-500 mt-1">{errors.class_id}</p>}
        </FormField>

        <FormField label="Subject Name" required>
          <input
            className={`input ${errors.subject_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.subject_name}
            onChange={e => { setForm(f => ({ ...f, subject_name: e.target.value })); if (errors.subject_name) setErrors(p => ({ ...p, subject_name: '' })) }}
            placeholder="e.g. Mathematics"
          />
          {errors.subject_name && <p className="text-xs text-red-500 mt-1">{errors.subject_name}</p>}
        </FormField>

        <FormField label="Description">
          <input
            className="input"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description (optional)"
          />
        </FormField>

        <FormField label="Image">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="preview" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Upload Image
            </button>
          )}
          {imageFile && (
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 text-xs text-primary-600 hover:underline">
              Change image
            </button>
          )}
        </FormField>

        <FormField label="Status">
          <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormField>
      </Modal>
    </div>
  )
}
