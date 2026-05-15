'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { vehicleApi } from '@/lib/api'
import { PageHeader, Table, Pagination, Modal, FormField, StatusBadge, SearchBar } from '@/components/ui'

const PER_PAGE = 10
const toApiStatus = (s) => s === 'Active' ? 'A' : 'I'
const toUiStatus  = (s) => s === 'A' ? 'Active' : s === 'I' ? 'Inactive' : (s || '—')
const EMPTY_FORM  = { vehicle_no: '', vehicle_capacity: '', vehicle_reg_no: '', status: 'Active', driver_mob_no: '', helper_mob_no: '' }

export default function VehiclePage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await vehicleApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const r = res.result || {}
      setData(r.data || []); setTotal(r.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const closeModal = () => { setModal(false); setErrors({}) }
  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true) }
  const openEdit = (v) => {
    setEditing(v)
    setForm({ vehicle_no: v.vehicle_no || '', vehicle_capacity: v.vehicle_capacity ?? '', vehicle_reg_no: v.vehicle_reg_no || '', status: toUiStatus(v.status), driver_mob_no: v.driver_mob_no || '', helper_mob_no: v.helper_mob_no || '' })
    setErrors({}); setModal(true)
  }

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.driver_mob_no.trim()) e.driver_mob_no = 'Driver mobile is required'
    if (!form.helper_mob_no.trim()) e.helper_mob_no = 'Helper mobile is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = {
        vehicle_no:       form.vehicle_no || undefined,
        vehicle_capacity: form.vehicle_capacity ? Number(form.vehicle_capacity) : undefined,
        vehicle_reg_no:   form.vehicle_reg_no || undefined,
        status:           toApiStatus(form.status),
        driver_mob_no:    form.driver_mob_no,
        helper_mob_no:    form.helper_mob_no,
      }
      if (editing) await vehicleApi.update(editing.id, payload)
      else await vehicleApi.create(payload)
      setModal(false); fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return
    try { await vehicleApi.delete(id); fetchData() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader title="Vehicles" subtitle="Manage school transport vehicles"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Vehicle</button>}
      />
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search vehicle no / reg no..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>
        <Table headers={['#', 'Vehicle No', 'Reg No', 'Capacity', 'Driver Mobile', 'Helper Mobile', 'Status', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((v, i) => (
            <tr key={v.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium">{v.vehicle_no || '—'}</td>
              <td className="table-td">{v.vehicle_reg_no || '—'}</td>
              <td className="table-td">{v.vehicle_capacity ?? '—'}</td>
              <td className="table-td">{v.driver_mob_no}</td>
              <td className="table-td">{v.helper_mob_no}</td>
              <td className="table-td"><StatusBadge status={toUiStatus(v.status)} /></td>
              <td className="table-td">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vehicle No">
              <input className="input" value={form.vehicle_no} onChange={f('vehicle_no')} placeholder="TN01AB1234" />
            </FormField>
            <FormField label="Reg No">
              <input className="input" value={form.vehicle_reg_no} onChange={f('vehicle_reg_no')} placeholder="REG001" />
            </FormField>
          </div>
          <FormField label="Capacity">
            <input className="input" type="number" value={form.vehicle_capacity} onChange={f('vehicle_capacity')} placeholder="40" />
          </FormField>
          <FormField label="Driver Mobile" required>
            <input className={`input ${errors.driver_mob_no ? 'border-red-400' : ''}`} value={form.driver_mob_no} onChange={f('driver_mob_no')} placeholder="9876543210" />
            {errors.driver_mob_no && <p className="text-xs text-red-500 mt-1">{errors.driver_mob_no}</p>}
          </FormField>
          <FormField label="Helper Mobile" required>
            <input className={`input ${errors.helper_mob_no ? 'border-red-400' : ''}`} value={form.helper_mob_no} onChange={f('helper_mob_no')} placeholder="9876543211" />
            {errors.helper_mob_no && <p className="text-xs text-red-500 mt-1">{errors.helper_mob_no}</p>}
          </FormField>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={f('status')}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
