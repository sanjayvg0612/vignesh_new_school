'use client'
import { useState } from 'react'
import { CONTACT_INFO } from '@/lib/mockData'
import { PageHeader, FormField } from '@/components/ui'

export default function ContactPage() {
  const [form, setForm] = useState(CONTACT_INFO)
  const [saved, setSaved] = useState(false)
  const [schoolNameError, setSchoolNameError] = useState('')

  const handleSave = () => {
    if (!form.school_name.trim()) { setSchoolNameError('School name is required'); return }
    setSchoolNameError('')
    setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <PageHeader title="Contact Info" subtitle="Update school contact information" />
      {saved && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">Contact info updated successfully!</div>}
      <div className="card p-6 max-w-2xl">
        <div className="space-y-4">
          <FormField label="School Name" required>
            <input className={`input ${schoolNameError ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.school_name} onChange={e=>{ setForm({...form,school_name:e.target.value}); if(schoolNameError) setSchoolNameError('') }} />
            {schoolNameError && <p className="text-xs text-red-500 mt-1">{schoolNameError}</p>}
          </FormField>
          <FormField label="Principal Name"><input className="input" value={form.principal_name} onChange={e=>setForm({...form,principal_name:e.target.value})} /></FormField>
          <FormField label="Address"><textarea className="input" rows={3} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone"><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></FormField>
            <FormField label="Email"><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></FormField>
          </div>
          <FormField label="Website"><input className="input" value={form.website} onChange={e=>setForm({...form,website:e.target.value})} /></FormField>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} className="btn-primary px-8">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
