'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { holidayApi } from '@/lib/api'

const PER_PAGE = 10

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' },   { value: '4', label: 'April' },
  { value: '5', label: 'May' },     { value: '6', label: 'June' },
  { value: '7', label: 'July' },    { value: '8', label: 'August' },
  { value: '9', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i))

export default function HolidayPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [year, setYear]       = useState('')
  const [month, setMonth]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm]       = useState({ holiday_date: '', title: '', description: '' })

  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchHolidays = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await holidayApi.list({ page, limit: PER_PAGE, search: search || undefined, year: year || undefined, month: month || undefined })
      const result = res.result || {}
      setData(result.data   || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, year, month])

  useEffect(() => { fetchHolidays() }, [fetchHolidays])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const openAdd = () => {
    setEditing(null)
    setFormErrors({})
    setForm({ holiday_date: '', title: '', description: '' })
    setModal(true)
  }

  const openEdit = (h) => {
    setEditing(h)
    setFormErrors({})
    setForm({
      holiday_date: h.holiday_date ? h.holiday_date.split('T')[0] : '',
      title:        h.title        || '',
      description:  h.description  || '',
    })
    setModal(true)
  }

  const validate = () => {
    const ve = {}
    if (!form.holiday_date.trim()) ve.holiday_date = 'Holiday date is required'
    if (!form.title.trim())        ve.title        = 'Title is required'
    return ve
  }

  const handleSave = async () => {
    const ve = validate()
    if (Object.keys(ve).length) { setFormErrors(ve); return }
    setSaving(true)
    try {
      const payload = {
        holiday_date: form.holiday_date,
        title:        form.title,
        description:  form.description || undefined,
      }
      if (editing) {
        await holidayApi.update(editing.id, payload)
      } else {
        await holidayApi.create(payload)
      }
      setModal(false)
      fetchHolidays()
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
      await holidayApi.delete(deleteId)
      setConfirmOpen(false)
      fetchHolidays()
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    const dt = new Date(d)
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <PageHeader
        title="Holidays"
        subtitle="Manage school holidays"
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Holiday
          </button>
        }
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <select className="input w-32" value={year} onChange={e => { setYear(e.target.value); setPage(1) }}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="input w-36" value={month} onChange={e => { setMonth(e.target.value); setPage(1) }}>
            <option value="">All Months</option>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <SearchBar value={search} onChange={handleSearch} placeholder="Search holidays..." />
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>

        <Table
          headers={['Sl No.', 'Date', 'Title', 'Description', 'Actions']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr>
              <td colSpan={5} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((h, i) => (
            <tr key={h.id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900 whitespace-nowrap">{formatDate(h.holiday_date)}</td>
              <td className="table-td font-medium text-gray-800">{h.title || '—'}</td>
              <td className="table-td text-gray-500 max-w-xs truncate">{h.description || '—'}</td>
              <td className="table-td">
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(h)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => confirmDelete(h.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
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
        title={editing ? 'Edit Holiday' : 'Add Holiday'}
        footer={
          <>
            <button onClick={() => { setModal(false); setFormErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <FormField label="Holiday Date" required>
          <input
            type="date"
            className={`input ${formErrors.holiday_date ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.holiday_date}
            onChange={e => { setForm(f => ({ ...f, holiday_date: e.target.value })); if (formErrors.holiday_date) setFormErrors(p => ({ ...p, holiday_date: '' })) }}
          />
          {formErrors.holiday_date && <p className="text-xs text-red-500 mt-1">{formErrors.holiday_date}</p>}
        </FormField>
        <FormField label="Title" required>
          <input
            className={`input ${formErrors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="e.g. Republic Day"
            value={form.title}
            onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (formErrors.title) setFormErrors(p => ({ ...p, title: '' })) }}
          />
          {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
        </FormField>
        <FormField label="Description">
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Optional description..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </FormField>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Holiday"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this holiday? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
