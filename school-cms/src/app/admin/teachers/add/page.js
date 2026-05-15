'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { PageHeader, FormField } from '@/components/ui'
import { employeeApi, roleApi } from '@/lib/api'

const GENDER_OPTIONS = ['male', 'female', 'other']
const STATUS_OPTIONS = ['teaching', 'non teaching']
const toLabel        = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

export default function AddTeacherPage() {
  const router = useRouter()
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [errors, setErrors]   = useState({})
  const [roles, setRoles]     = useState([])
  const [form, setForm]       = useState({
    first_name: '', last_name: '', email: '', mobile: '',
    gender: 'male', DOB: '', qualification: '', address: '',
    salary: '', joining_dt: '', session_yr: '',
    role_id: '', status: 'teaching', is_active: true,
  })

  useEffect(() => {
    roleApi.list().then(r => setRoles(r.result?.data || r.result || [])).catch(() => setRoles([]))
  }, [])

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if(errors[k]) setErrors(p=>({...p,[k]:''})) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ve = {}
    if (!form.first_name.trim()) ve.first_name = 'First name is required'
    if (!form.last_name.trim()) ve.last_name = 'Last name is required'
    if (Object.keys(ve).length) { setErrors(ve); return }
    setSaving(true); setError('')
    try {
      const payload = {
        first_name:    form.first_name,
        last_name:     form.last_name,
        email:         form.email         || undefined,
        mobile:        form.mobile        || undefined,
        gender:        form.gender        || undefined,
        DOB:           form.DOB           || undefined,
        qualification: form.qualification || undefined,
        address:       form.address       || undefined,
        salary:        form.salary        ? parseFloat(form.salary) : undefined,
        joining_dt:    form.joining_dt    || undefined,
        session_yr:    form.session_yr    || undefined,
        role_id:       form.role_id       ? parseInt(form.role_id, 10) : undefined,
        status:        form.status        || undefined,
        is_active:     form.is_active,
      }
      await employeeApi.create(payload)
      setSuccess(true)
      setTimeout(() => router.push('/admin/teachers'), 1200)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="Add Teacher" subtitle="Register a new teacher or staff member" />

      {success && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 shrink-0" /> Teacher added successfully! Redirecting...
        </div>
      )}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input className={`input ${errors.first_name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.first_name} onChange={f('first_name')} />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
            </FormField>
            <FormField label="Last Name" required>
              <input className={`input ${errors.last_name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.last_name} onChange={f('last_name')} />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mobile">
              <input className="input" value={form.mobile} onChange={f('mobile')} placeholder="e.g. 9876543210" />
            </FormField>
            <FormField label="Email">
              <input className="input" type="email" value={form.email} onChange={f('email')} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Gender">
              <select className="input" value={form.gender} onChange={f('gender')}>
                {GENDER_OPTIONS.map(g => <option key={g} value={g}>{toLabel(g)}</option>)}
              </select>
            </FormField>
            <FormField label="Date of Birth">
              <input className="input" type="date" value={form.DOB} onChange={f('DOB')} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role">
              <select className="input" value={form.role_id} onChange={f('role_id')}>
                <option value="">— Select Role —</option>
                {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select className="input" value={form.status} onChange={f('status')}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{toLabel(s)}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Qualification">
              <input className="input" value={form.qualification} onChange={f('qualification')} placeholder="e.g. B.Ed, M.Sc" />
            </FormField>
            <FormField label="Salary">
              <input className="input" type="number" value={form.salary} onChange={f('salary')} placeholder="e.g. 25000" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Joining Date">
              <input className="input" type="date" value={form.joining_dt} onChange={f('joining_dt')} />
            </FormField>
            <FormField label="Session Year">
              <input className="input" value={form.session_yr} onChange={f('session_yr')} placeholder="e.g. 2024-25" />
            </FormField>
          </div>
          <FormField label="Address">
            <textarea className="input" rows={2} value={form.address} onChange={f('address')} />
          </FormField>
          <FormField label="Active">
            <label className="flex items-center gap-2 mt-1 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Mark as active</span>
            </label>
          </FormField>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => router.push('/admin/teachers')} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Teacher'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
