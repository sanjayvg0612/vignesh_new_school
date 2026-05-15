'use client'
import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField, StatusBadge } from '@/components/ui'
import { employeeApi, roleApi } from '@/lib/api'

const PER_PAGE = 10
const toLabel  = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'
const GENDER_OPTIONS = ['male', 'female', 'other']
const STATUS_OPTIONS = ['teaching', 'non teaching']

export default function AllTeachersPage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [roles, setRoles]     = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm]       = useState({
    first_name: '', last_name: '', email: '', mobile: '',
    gender: 'male', qualification: '', address: '',
    salary: '', joining_dt: '', session_yr: '',
    role_id: '', status: 'teaching', is_active: true,
  })

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchTeachers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await employeeApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchTeachers() }, [fetchTeachers])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const openModal = async (item) => {
    setEditing(item)
    setFormErrors({})
    setForm({
      first_name:    item.first_name    || '',
      last_name:     item.last_name     || '',
      email:         item.email         || '',
      mobile:        item.mobile        || '',
      gender:        item.gender        || 'male',
      qualification: item.qualification || '',
      address:       item.address       || '',
      salary:        item.salary != null ? String(item.salary) : '',
      joining_dt:    item.joining_dt    || '',
      session_yr:    item.session_yr    || '',
      role_id:       item.role_id != null ? String(item.role_id) : '',
      status:        item.status        || 'teaching',
      is_active:     item.is_active ?? true,
    })
    try { const r = await roleApi.list(); setRoles(r.result?.data || r.result || []) }
    catch { setRoles([]) }
    setModal(true)
  }

  const handleSave = async () => {
    const fe = {}
    if (!form.first_name.trim()) fe.first_name = 'First name is required'
    if (!form.last_name.trim()) fe.last_name = 'Last name is required'
    if (Object.keys(fe).length) { setFormErrors(fe); return }
    setSaving(true)
    try {
      const payload = {
        first_name:    form.first_name,
        last_name:     form.last_name,
        email:         form.email         || undefined,
        mobile:        form.mobile        || undefined,
        gender:        form.gender        || undefined,
        qualification: form.qualification || undefined,
        address:       form.address       || undefined,
        salary:        form.salary        ? parseFloat(form.salary) : undefined,
        joining_dt:    form.joining_dt    || undefined,
        session_yr:    form.session_yr    || undefined,
        role_id:       form.role_id       ? parseInt(form.role_id, 10) : undefined,
        status:        form.status        || undefined,
        is_active:     form.is_active,
      }
      await employeeApi.update(editing.emp_db_id ?? editing.id, payload)
      setFormErrors({})
      setModal(false)
      fetchTeachers()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete ${item.first_name} ${item.last_name}?`)) return
    try { await employeeApi.delete(item.emp_db_id ?? item.id); fetchTeachers() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader
        title="All Teachers"
        subtitle="Manage teaching and non-teaching staff"
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search by name, mobile, email..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>

        <Table headers={['Sl No.', 'Name', 'Role', 'Mobile', 'Email', 'Status', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((item, i) => (
            <tr key={item.emp_db_id ?? item.id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">{item.first_name} {item.last_name}</td>
              <td className="table-td">{item.role_name || '—'}</td>
              <td className="table-td">{item.mobile    || '—'}</td>
              <td className="table-td">{item.email     || '—'}</td>
              <td className="table-td"><StatusBadge status={toLabel(item.status)} /></td>
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
        title="Edit Teacher"
        footer={
          <>
            <button onClick={() => { setModal(false); setFormErrors({}) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" required>
            <input className={`input ${formErrors.first_name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.first_name} onChange={e => { setForm(f => ({ ...f, first_name: e.target.value })); if(formErrors.first_name) setFormErrors(p=>({...p,first_name:''})) }} />
            {formErrors.first_name && <p className="text-xs text-red-500 mt-1">{formErrors.first_name}</p>}
          </FormField>
          <FormField label="Last Name" required>
            <input className={`input ${formErrors.last_name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.last_name} onChange={e => { setForm(f => ({ ...f, last_name: e.target.value })); if(formErrors.last_name) setFormErrors(p=>({...p,last_name:''})) }} />
            {formErrors.last_name && <p className="text-xs text-red-500 mt-1">{formErrors.last_name}</p>}
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Mobile">
            <input className="input" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
          </FormField>
          <FormField label="Email">
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Gender">
            <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{toLabel(g)}</option>)}
            </select>
          </FormField>
          <FormField label="Role">
            <select className="input" value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
              <option value="">— No Role —</option>
              {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Status">
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{toLabel(s)}</option>)}
            </select>
          </FormField>
          <FormField label="Salary">
            <input className="input" type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. 25000" />
          </FormField>
        </div>
        <FormField label="Qualification">
          <input className="input" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} placeholder="e.g. B.Ed, M.Sc" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Joining Date">
            <input className="input" type="date" value={form.joining_dt} onChange={e => setForm(f => ({ ...f, joining_dt: e.target.value }))} />
          </FormField>
          <FormField label="Session Year">
            <input className="input" value={form.session_yr} onChange={e => setForm(f => ({ ...f, session_yr: e.target.value }))} placeholder="e.g. 2024-25" />
          </FormField>
        </div>
        <FormField label="Address">
          <textarea className="input" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </FormField>
        <FormField label="Active">
          <label className="flex items-center gap-2 mt-1 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Mark as active</span>
          </label>
        </FormField>
      </Modal>
    </div>
  )
}
