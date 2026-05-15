'use client'
import { useState, useEffect, useCallback } from 'react'
import { Pencil } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { studentApi, classApi, sectionApi } from '@/lib/api'

const PER_PAGE = 10

export default function GuardianListPage() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [classId, setClassId]   = useState('')
  const [sectionId, setSectionId] = useState('')
  const [classes, setClasses]               = useState([])
  const [sections, setSections]             = useState([])
  const [sectionLoading, setSectionLoading] = useState(false)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm]       = useState({
    guardian_first_name: '', guardian_last_name: '', guardian_phone: '', guardian_email: '', guardian_gender: 'male',
  })

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(Array.isArray(r.result) ? r.result : [])).catch(() => setClasses([]))
  }, [])

  const handleClassFilter = async (id) => {
    setClassId(id)
    setSectionId('')
    setSections([])
    setPage(1)
    if (!id) return
    setSectionLoading(true)
    try {
      const res = await sectionApi.dropdown({ class_id: id })
      setSections(Array.isArray(res.result) ? res.result : [])
    } catch { setSections([]) } finally { setSectionLoading(false) }
  }

  const fetchGuardians = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await studentApi.guardianList({
        page, limit: PER_PAGE,
        search:     search     || undefined,
        class_id:   classId    || undefined,
        section_id: sectionId  || undefined,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, classId, sectionId])

  useEffect(() => { fetchGuardians() }, [fetchGuardians])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const openEdit = (g) => {
    setEditing(g)
    setFormErrors({})
    setForm({
      guardian_first_name: g.guardian_first_name || '',
      guardian_last_name:  g.guardian_last_name  || '',
      guardian_phone:      g.guardian_phone      || '',
      guardian_email:      g.guardian_email      || '',
      guardian_gender:     g.guardian_gender     || 'male',
    })
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.guardian_phone.trim()) { setFormErrors({ guardian_phone: 'Guardian phone is required' }); return }
    setSaving(true)
    try {
      await studentApi.update(editing.student_id, {
        guardian_first_name: form.guardian_first_name || undefined,
        guardian_last_name:  form.guardian_last_name  || undefined,
        guardian_phone:      form.guardian_phone,
        guardian_email:      form.guardian_email      || undefined,
        guardian_gender:     form.guardian_gender,
      })
      setModal(false)
      fetchGuardians()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Guardian List"
        subtitle="View guardians linked to students"
      />

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <select
            className="input w-40"
            value={classId}
            onChange={e => handleClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
          </select>
          <select
            className="input w-40"
            value={sectionId}
            onChange={e => { setSectionId(e.target.value); setPage(1) }}
            disabled={sectionLoading || !classId || sections.length === 0}
          >
            <option value="">
              {sectionLoading ? 'Loading...' : !classId ? 'All Sections' : sections.length === 0 ? 'No Sections' : 'All Sections'}
            </option>
            {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.section_code}</option>)}
          </select>
          <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or phone..." />
          <span className="text-sm text-gray-500 ml-auto">{total} records</span>
        </div>

        <Table
          headers={['Sl No.', 'Student Name', 'Guardian Name', 'Phone', 'Email', 'Gender', 'Actions']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr>
              <td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td>
            </tr>
          ) : data.map((g, i) => (
            <tr key={g.student_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">
                {g.student_name || [g.first_name, g.last_name].filter(Boolean).join(' ') || '—'}
              </td>
              <td className="table-td">{g.guardian_first_name || '—'}</td>
              <td className="table-td">{g.guardian_phone || '—'}</td>
              <td className="table-td">{g.guardian_email || '—'}</td>
              <td className="table-td">{g.guardian_gender || '—'}</td>
              <td className="table-td">
                <button onClick={() => openEdit(g)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModal(false); setFormErrors({}) }}
        title="Edit Guardian"
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
          <FormField label="Guardian First Name">
            <input className="input" value={form.guardian_first_name}
              onChange={e => setForm(f => ({ ...f, guardian_first_name: e.target.value }))} />
          </FormField>
          <FormField label="Guardian Last Name">
            <input className="input" value={form.guardian_last_name}
              onChange={e => setForm(f => ({ ...f, guardian_last_name: e.target.value }))} />
          </FormField>
        </div>
        <FormField label="Guardian Phone" required>
          <input
            className={`input ${formErrors.guardian_phone ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={form.guardian_phone}
            onChange={e => { setForm(f => ({ ...f, guardian_phone: e.target.value })); if (formErrors.guardian_phone) setFormErrors({}) }}
          />
          {formErrors.guardian_phone && <p className="text-xs text-red-500 mt-1">{formErrors.guardian_phone}</p>}
        </FormField>
        <FormField label="Guardian Email">
          <input className="input" type="email" value={form.guardian_email}
            onChange={e => setForm(f => ({ ...f, guardian_email: e.target.value }))} />
        </FormField>
        <FormField label="Guardian Gender">
          <select className="input" value={form.guardian_gender}
            onChange={e => setForm(f => ({ ...f, guardian_gender: e.target.value }))}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FormField>
      </Modal>
    </div>
  )
}
