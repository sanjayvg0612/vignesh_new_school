'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ImageIcon } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { notificationApi, roleApi } from '@/lib/api'

const PER_PAGE = 10

export default function NotificationPage() {
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
  const [form, setForm]       = useState({ title: '', message: '', role_id: '' })
  const [image, setImage]     = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [roles, setRoles]     = useState([])

  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchNotifications = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await notificationApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data   || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // Load roles once
  useEffect(() => {
    roleApi.dropdown()
      .then(r => setRoles(Array.isArray(r.result) ? r.result : []))
      .catch(() => setRoles([]))
  }, [])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const openAdd = () => {
    setEditing(null); setFormErrors({})
    setImage(null); setImagePreview('')
    setForm({ title: '', message: '', role_id: '' })
    setModal(true)
  }

  const openEdit = async (n) => {
    setEditing(n); setFormErrors({})
    setImage(null); setImagePreview('')
    setModal(true)

    let full = n
    try {
      const res = await notificationApi.getById(n.id ?? n.notification_id)
      full = res.result || n
    } catch { /* fall back */ }

    setForm({
      title:   full.title   || n.title   || '',
      message: full.message || n.message || '',
      role_id: full.role_id ? String(full.role_id) : (n.role_id ? String(n.role_id) : ''),
    })
  }

  const validate = () => {
    const ve = {}
    if (!form.title.trim()) ve.title = 'Title is required'
    return ve
  }

  const handleSave = async () => {
    const ve = validate()
    if (Object.keys(ve).length) { setFormErrors(ve); return }
    setSaving(true)
    try {
      const payload = {
        title:   form.title,
        message: form.message || undefined,
        role_id: form.role_id ? Number(form.role_id) : undefined,
      }
      if (editing) {
        await notificationApi.update(editing.id ?? editing.notification_id, payload, image || undefined)
      } else {
        await notificationApi.create(payload, image || undefined)
      }
      setModal(false); fetchNotifications()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const confirmDelete = (id) => { setDeleteId(id); setConfirmOpen(true) }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await notificationApi.delete(deleteId)
      setConfirmOpen(false); fetchNotifications()
    } catch (e) { alert(e.message) }
    finally { setDeleting(false) }
  }

  const handleImageChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setImage(f)
    setImagePreview(URL.createObjectURL(f))
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Send push notifications to staff and roles"
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Notification
          </button>
        }
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search notifications..." />
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>

        <Table headers={['Sl No.', 'Title', 'Message', 'Role', 'Image', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((n, i) => (
            <tr key={n.id ?? n.notification_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-semibold text-gray-900">{n.title || '—'}</td>
              <td className="table-td text-gray-500 max-w-xs truncate">{n.message || '—'}</td>
              <td className="table-td text-gray-600">{n.role_name || '—'}</td>
              <td className="table-td">
                {(n.id ?? n.notification_id) ? (
                  <a href={notificationApi.imageUrl(n.id ?? n.notification_id)} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs">
                    <ImageIcon className="w-3 h-3" /> View
                  </a>
                ) : '—'}
              </td>
              <td className="table-td">
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(n)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => confirmDelete(n.id ?? n.notification_id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
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
        title={editing ? 'Edit Notification' : 'New Notification'}
        footer={
          <>
            <button onClick={() => { setModal(false); setFormErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Send'}
            </button>
          </>
        }
      >
        <FormField label="Title" required>
          <input
            className={`input ${formErrors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Notification title..."
            value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (formErrors.title) setFormErrors(p => ({ ...p, title: '' })) }}
          />
          {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
        </FormField>

        <FormField label="Message">
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Write notification message..."
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          />
        </FormField>

        <FormField label="Role">
          <select
            className="input"
            value={form.role_id}
            onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
          >
            <option value="">— All Roles —</option>
            {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
          </select>
        </FormField>

        <FormField label="Image (optional)">
          <label className="flex flex-col gap-2 cursor-pointer">
            <div className="flex items-center gap-2 input py-2 text-sm text-gray-500 hover:border-primary-400 transition-colors">
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{image ? image.name : 'Choose image...'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="w-full max-h-40 object-cover rounded-lg border border-gray-200" />
            )}
          </label>
        </FormField>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Notification"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this notification? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
