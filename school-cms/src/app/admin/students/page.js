'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Eye } from 'lucide-react'
import Link from 'next/link'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'
import { studentApi, classApi, sectionApi, getSchoolId } from '@/lib/api'

const PER_PAGE = 10

const toUiStatus  = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'
const toApiStatus = (s) => s.toLowerCase()

export default function StudentsPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [filterClass, setFilterClass]     = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [classes, setClasses]             = useState([])
  const [sections, setSections]           = useState([])
  const [sectionLoading, setSectionLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm]       = useState({
    first_name: '', last_name: '', email: '', phone: '',
    gender: 'male', status: 'Active',
  })

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await studentApi.list({
        page, limit: PER_PAGE,
        search:     search        || undefined,
        class_id:   filterClass   || undefined,
        section_id: filterSection || undefined,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterClass, filterSection])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(Array.isArray(r.result) ? r.result : [])).catch(() => setClasses([]))
  }, [])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const handleClassFilter = async (classId) => {
    setFilterClass(classId)
    setFilterSection('')
    setSections([])
    setPage(1)
    if (!classId) return
    setSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: classId })
      setSections(Array.isArray(res.result) ? res.result : [])
    } catch { setSections([]) } finally { setSectionLoading(false) }
  }

  const openEdit = (s) => {
    setEditing(s)
    setFormErrors({})
    setForm({
      first_name: s.first_name,
      last_name:  s.last_name  || '',
      email:      s.email      || '',
      phone:      s.phone      || '',
      gender:     s.gender     || 'male',
      status:     toUiStatus(s.status),
    })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.first_name.trim()) { setFormErrors({ first_name: 'First name is required' }); return }
    setSaving(true)
    try {
      await studentApi.update(editing.student_id, {
        first_name: form.first_name,
        last_name:  form.last_name  || undefined,
        email:      form.email      || undefined,
        phone:      form.phone      || undefined,
        gender:     form.gender,
        status:     toApiStatus(form.status),
      })
      setFormErrors({})
      setModal(false)
      fetchStudents()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage all student records"
        action={
          <Link href="/admin/students/add" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Student
          </Link>
        }
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <select
              className="input w-40"
              value={filterClass}
              onChange={e => handleClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>
              ))}
            </select>
            <select
              className="input w-40"
              value={filterSection}
              onChange={e => { setFilterSection(e.target.value); setPage(1) }}
              disabled={sectionLoading || !filterClass || sections.length === 0}
            >
              <option value="">
                {sectionLoading ? 'Loading...' : !filterClass ? 'All Sections' : sections.length === 0 ? 'No Sections' : 'All Sections'}
              </option>
              {sections.map(s => (
                <option key={s.section_id} value={s.section_id}>{s.section_code}</option>
              ))}
            </select>
            <SearchBar value={search} onChange={handleSearch} placeholder="Search by name, roll, phone, class..." />
          </div>
          <span className="text-sm text-gray-500">{total} records</span>
        </div>

        <Table
          headers={['Sl No.', 'Roll ID', 'Name', 'Class', 'Section', 'Phone', 'Status', 'Actions']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr>
              <td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((s, i) => (
            <tr key={s.student_id} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-mono text-xs text-gray-600">{s.student_roll_id || '—'}</td>
              <td className="table-td font-medium text-gray-900">
                {s.first_name} {s.last_name || ''}
              </td>
              <td className="table-td">{s.class_code   || '—'}</td>
              <td className="table-td">{s.section_name || s.section_code || '—'}</td>
              <td className="table-td">{s.phone        || '—'}</td>
              <td className="table-td"><StatusBadge status={toUiStatus(s.status)} /></td>
              <td className="table-td">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded hover:bg-primary-50 text-primary-600"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Edit Modal — basic fields only */}
      <Modal
        open={modalOpen}
        onClose={() => { setModal(false); setFormErrors({}) }}
        title="Edit Student"
        footer={
          <>
            <button onClick={() => { setModal(false); setFormErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" required>
            <input className={`input ${formErrors.first_name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.first_name}
              onChange={e => { setForm(f => ({ ...f, first_name: e.target.value })); if(formErrors.first_name) setFormErrors({}) }} />
            {formErrors.first_name && <p className="text-xs text-red-500 mt-1">{formErrors.first_name}</p>}
          </FormField>
          <FormField label="Last Name">
            <input className="input" value={form.last_name}
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email">
            <input className="input" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </FormField>
          <FormField label="Phone">
            <input className="input" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Gender">
            <select className="input" value={form.gender}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select className="input" value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
