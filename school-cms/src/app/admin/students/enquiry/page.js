'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { inquiryApi, classApi } from '@/lib/api'

const PER_PAGE = 10

const GENDER_OPTIONS = ['male', 'female', 'other']
const toLabel = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'

export default function EnquiryPage() {
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
    student_name: '', gender: 'male', age: '', class_id: '',
    guardian_name: '', guardian_phone: '', guardian_occupation: '', guardian_gender: 'male',
  })
  const [classes, setClasses] = useState([])
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await inquiryApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const validate = () => {
    const e = {}
    if (!form.student_name.trim())   e.student_name   = 'Student name is required'
    if (!form.guardian_phone.trim()) e.guardian_phone = 'Guardian phone is required'
    else if (!/^\d{10}$/.test(form.guardian_phone.trim())) e.guardian_phone = 'Enter a valid 10-digit phone number'
    if (form.age && (isNaN(form.age) || parseInt(form.age, 10) < 1)) e.age = 'Enter a valid age'
    return e
  }

  const openModal = async (item = null) => {
    setEditing(item)
    setForm(item ? {
      student_name:         item.student_name        || '',
      gender:               item.gender              || 'male',
      age:                  item.age != null ? String(item.age) : '',
      class_id:             item.class_id != null ? String(item.class_id) : '',
      guardian_name:        item.guardian_name       || '',
      guardian_phone:       item.guardian_phone      || '',
      guardian_occupation:  item.guardian_occupation || '',
      guardian_gender:      item.guardian_gender     || 'male',
    } : {
      student_name: '', gender: 'male', age: '', class_id: '',
      guardian_name: '', guardian_phone: '', guardian_occupation: '', guardian_gender: 'male',
    })
    setErrors({})
    try {
      const res = await classApi.dropdown()
      setClasses(res.result || [])
    } catch { setClasses([]) }
    setModal(true)
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = {
        student_name:        form.student_name,
        gender:              form.gender              || undefined,
        age:                 form.age ? parseInt(form.age, 10) : undefined,
        class_id:            form.class_id ? parseInt(form.class_id, 10) : undefined,
        guardian_name:       form.guardian_name       || undefined,
        guardian_phone:      form.guardian_phone      || undefined,
        guardian_occupation: form.guardian_occupation || undefined,
        guardian_gender:     form.guardian_gender     || undefined,
      }
      if (editing) {
        await inquiryApi.update(editing.student_inq_id, payload)
      } else {
        await inquiryApi.create(payload)
      }
      setModal(false)
      fetchInquiries()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm('Delete this enquiry?')) return
    try {
      await inquiryApi.delete(item.student_inq_id)
      fetchInquiries()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Enquiry Students"
        subtitle="Manage student enquiries"
        action={<button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Enquiry</button>}
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search enquiries..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>

        <Table headers={['Sl No.','Class', 'Student Name', 'Gender', 'Age', 'Guardian', 'Phone', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr>
              <td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((item, i) => (
            <tr key={item.student_inq_id} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{item.student_name}</td>
              <td className="table-td">{item.class_code || item.class_id || '—'}</td>
              <td className="table-td">{toLabel(item.gender)}</td>
              <td className="table-td">{item.age ?? '—'}</td>
              <td className="table-td">{item.guardian_name || '—'}</td>
              <td className="table-td">{item.guardian_phone || '—'}</td>
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
        onClose={() => { setModal(false); setErrors({}) }}
        title={editing ? 'Edit Enquiry' : 'Add Enquiry'}
        footer={
          <>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <FormField label="Student Name" required>
          <input
            className={`input ${errors.student_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.student_name}
            onChange={e => { setForm(f => ({ ...f, student_name: e.target.value })); if (errors.student_name) setErrors(p => ({ ...p, student_name: '' })) }}
            placeholder="Full name"
          />
          {errors.student_name && <p className="text-xs text-red-500 mt-1">{errors.student_name}</p>}
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Gender">
            <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{toLabel(g)}</option>)}
            </select>
          </FormField>
          <FormField label="Age">
            <input
              className={`input ${errors.age ? 'border-red-400 focus:ring-red-400' : ''}`}
              type="number"
              min="1"
              value={form.age}
              onChange={e => { setForm(f => ({ ...f, age: e.target.value })); if (errors.age) setErrors(p => ({ ...p, age: '' })) }}
              placeholder="e.g. 12"
            />
            {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
          </FormField>
        </div>
        <FormField label="Class">
          <select className="input" value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}>
            <option value="">— Select Class (optional) —</option>
            {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
          </select>
        </FormField>
        <FormField label="Guardian Name">
          <input
            className="input"
            value={form.guardian_name}
            onChange={e => setForm(f => ({ ...f, guardian_name: e.target.value }))}
            placeholder="Guardian's name"
          />
        </FormField>
        <FormField label="Guardian Phone" required>
          <input
            className={`input ${errors.guardian_phone ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.guardian_phone}
            onChange={e => { setForm(f => ({ ...f, guardian_phone: e.target.value })); if (errors.guardian_phone) setErrors(p => ({ ...p, guardian_phone: '' })) }}
            placeholder="e.g. 9876543210"
          />
          {errors.guardian_phone && <p className="text-xs text-red-500 mt-1">{errors.guardian_phone}</p>}
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Guardian Occupation">
            <input
              className="input"
              value={form.guardian_occupation}
              onChange={e => setForm(f => ({ ...f, guardian_occupation: e.target.value }))}
              placeholder="Occupation"
            />
          </FormField>
          <FormField label="Guardian Gender">
            <select className="input" value={form.guardian_gender} onChange={e => setForm(f => ({ ...f, guardian_gender: e.target.value }))}>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{toLabel(g)}</option>)}
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
