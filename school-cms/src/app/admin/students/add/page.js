'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader, FormField } from '@/components/ui'
import { studentApi, classApi, sectionApi, getSchoolId } from '@/lib/api'

const EMPTY = {
  first_name: '', last_name: '', gender: 'male', dob: '', age: '',
  email: '', phone: '', blood_group: '', emergency_contact: '',
  student_roll_id: '', enroll_date: '', status: 'active',
  class_id: '', section_id: '',
  address_line1: '', address_line2: '', city: '', state: '', country: '', postal_code: '',
  guardian_first_name: '', guardian_last_name: '', guardian_phone: '',
  guardian_email: '', guardian_gender: 'male',
}

export default function AddStudentPage() {
  const router  = useRouter()
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [errors, setErrors]   = useState({})
  const [classes, setClasses]           = useState([])
  const [sections, setSections]         = useState([])
  const [sectionLoading, setSectionLoading] = useState(false)

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(Array.isArray(r.result) ? r.result : [])).catch(() => setClasses([]))
  }, [])

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if(errors[k]) setErrors(p=>({...p,[k]:''})) }

  const handleClassChange = async (classId) => {
    setForm(p => ({ ...p, class_id: classId, section_id: '' }))
    if (errors.class_id) setErrors(p => ({ ...p, class_id: '' }))
    setSections([])
    if (!classId) return
    setSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: classId })
      setSections(Array.isArray(res.result) ? res.result : [])
    } catch { setSections([]) } finally { setSectionLoading(false) }
  }

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required'
    if (!form.class_id) e.class_id = 'Class ID is required'
    if (!form.section_id) e.section_id = 'Section ID is required'
    if (!form.guardian_phone.trim()) e.guardian_phone = 'Guardian phone is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }
    setError('')
    setSaving(true)
    try {
      await studentApi.create({
        school_id:          getSchoolId(),
        class_id:           parseInt(form.class_id, 10),
        section_id:         parseInt(form.section_id, 10),
        first_name:         form.first_name,
        last_name:          form.last_name          || undefined,
        gender:             form.gender,
        dob:                form.dob                || undefined,
        age:                form.age ? parseInt(form.age, 10) : undefined,
        email:              form.email              || undefined,
        phone:              form.phone              || undefined,
        blood_group:        form.blood_group        || undefined,
        emergency_contact:  form.emergency_contact  || undefined,
        student_roll_id:    form.student_roll_id    || undefined,
        enroll_date:        form.enroll_date        || undefined,
        status:             form.status,
        address_line1:      form.address_line1      || undefined,
        address_line2:      form.address_line2      || undefined,
        city:               form.city               || undefined,
        state:              form.state              || undefined,
        country:            form.country            || undefined,
        postal_code:        form.postal_code        || undefined,
        guardian_first_name: form.guardian_first_name || undefined,
        guardian_last_name:  form.guardian_last_name  || undefined,
        guardian_phone:      form.guardian_phone,
        guardian_email:      form.guardian_email    || undefined,
        guardian_gender:     form.guardian_gender,
      })
      setSuccess(true)
      setTimeout(() => router.push('/admin/students'), 1200)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Add Student" subtitle="Register a new student record" />

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          Student added successfully! Redirecting...
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

        {/* Basic Info */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input className={`input ${errors.first_name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.first_name} onChange={f('first_name')} />
              {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
            </FormField>
            <FormField label="Last Name">
              <input className="input" value={form.last_name} onChange={f('last_name')} />
            </FormField>
            <FormField label="Roll ID">
              <input className="input" value={form.student_roll_id} onChange={f('student_roll_id')} placeholder="e.g. 2026001" />
            </FormField>
            <FormField label="Gender">
              <select className="input" value={form.gender} onChange={f('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Date of Birth">
              <input className="input" type="date" value={form.dob} onChange={f('dob')} />
            </FormField>
            <FormField label="Age">
              <input className="input" type="number" value={form.age} onChange={f('age')} placeholder="e.g. 14" />
            </FormField>
            <FormField label="Blood Group">
              <input className="input" value={form.blood_group} onChange={f('blood_group')} placeholder="e.g. B+" />
            </FormField>
            <FormField label="Status">
              <select className="input" value={form.status} onChange={f('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Class & Enroll */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Class & Enrollment</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Class" required>
              <select className={`input ${errors.class_id ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.class_id} onChange={e => handleClassChange(e.target.value)}>
                <option value="">— Select Class —</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>
                ))}
              </select>
              {errors.class_id && <p className="text-xs text-red-500 mt-1">{errors.class_id}</p>}
            </FormField>
            <FormField label="Section" required>
              <select
                className={`input ${errors.section_id ? 'border-red-400 focus:ring-red-400' : ''}`}
                value={form.section_id}
                onChange={e => { setForm(p => ({ ...p, section_id: e.target.value })); if (errors.section_id) setErrors(p => ({ ...p, section_id: '' })) }}
                disabled={sectionLoading || !form.class_id || sections.length === 0}
              >
                <option value="">
                  {sectionLoading ? 'Loading...' : !form.class_id ? '— Select Class first —' : sections.length === 0 ? 'No sections available' : '— Select Section —'}
                </option>
                {sections.map(s => (
                  <option key={s.section_id} value={s.section_id}>{s.section_code}</option>
                ))}
              </select>
              {errors.section_id && <p className="text-xs text-red-500 mt-1">{errors.section_id}</p>}
            </FormField>
            <FormField label="Enroll Date">
              <input className="input" type="date" value={form.enroll_date} onChange={f('enroll_date')} />
            </FormField>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email">
              <input className="input" type="email" value={form.email} onChange={f('email')} />
            </FormField>
            <FormField label="Phone">
              <input className="input" value={form.phone} onChange={f('phone')} />
            </FormField>
            <FormField label="Emergency Contact">
              <input className="input" value={form.emergency_contact} onChange={f('emergency_contact')} />
            </FormField>
          </div>
        </div>

        {/* Address */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Address Line 1">
              <input className="input" value={form.address_line1} onChange={f('address_line1')} />
            </FormField>
            <FormField label="Address Line 2">
              <input className="input" value={form.address_line2} onChange={f('address_line2')} />
            </FormField>
            <FormField label="City">
              <input className="input" value={form.city} onChange={f('city')} />
            </FormField>
            <FormField label="State">
              <input className="input" value={form.state} onChange={f('state')} />
            </FormField>
            <FormField label="Country">
              <input className="input" value={form.country} onChange={f('country')} />
            </FormField>
            <FormField label="Postal Code">
              <input className="input" value={form.postal_code} onChange={f('postal_code')} />
            </FormField>
          </div>
        </div>

        {/* Guardian */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Guardian Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Guardian First Name">
              <input className="input" value={form.guardian_first_name} onChange={f('guardian_first_name')} />
            </FormField>
            <FormField label="Guardian Last Name">
              <input className="input" value={form.guardian_last_name} onChange={f('guardian_last_name')} />
            </FormField>
            <FormField label="Guardian Phone" required>
              <input className={`input ${errors.guardian_phone ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.guardian_phone} onChange={f('guardian_phone')} />
              {errors.guardian_phone && <p className="text-xs text-red-500 mt-1">{errors.guardian_phone}</p>}
            </FormField>
            <FormField label="Guardian Email">
              <input className="input" type="email" value={form.guardian_email} onChange={f('guardian_email')} />
            </FormField>
            <FormField label="Guardian Gender">
              <select className="input" value={form.guardian_gender} onChange={f('guardian_gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push('/admin/students')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  )
}
