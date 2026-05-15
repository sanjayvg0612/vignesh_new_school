'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { routeApi } from '@/lib/api'
import { PageHeader, Table, Pagination, Modal, FormField, StatusBadge, SearchBar } from '@/components/ui'

const PER_PAGE = 10
const toApiStatus = (s) => s === 'Active' ? 'A' : 'I'
const toUiStatus  = (s) => s === 'A' ? 'Active' : s === 'I' ? 'Inactive' : (s || '—')
const EMPTY_FORM  = { name: '', vehicle_no: '', distance: '', status: 'Active', pick_start_time: '', pick_end_time: '', drop_start_time: '', drop_end_time: '' }

export default function RoutePage() {
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
      const res = await routeApi.list({ page, limit: PER_PAGE, search: search || undefined })
      const r = res.result || {}
      setData(r.data || []); setTotal(r.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const closeModal = () => { setModal(false); setErrors({}) }
  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setModal(true) }
  const openEdit = (r) => {
    setEditing(r)
    setForm({ name: r.name || '', vehicle_no: r.vehicle_no || '', distance: r.distance ?? '', status: toUiStatus(r.status), pick_start_time: r.pick_start_time || '', pick_end_time: r.pick_end_time || '', drop_start_time: r.drop_start_time || '', drop_end_time: r.drop_end_time || '' })
    setErrors({}); setModal(true)
  }

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())     e.name            = 'Route name is required'
    if (!form.pick_start_time) e.pick_start_time = 'Required'
    if (!form.pick_end_time)   e.pick_end_time   = 'Required'
    if (!form.drop_start_time) e.drop_start_time = 'Required'
    if (!form.drop_end_time)   e.drop_end_time   = 'Required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = { name: form.name, vehicle_no: form.vehicle_no || undefined, distance: form.distance ? Number(form.distance) : undefined, status: toApiStatus(form.status), pick_start_time: form.pick_start_time, pick_end_time: form.pick_end_time, drop_start_time: form.drop_start_time, drop_end_time: form.drop_end_time }
      if (editing) await routeApi.update(editing.id, payload)
      else await routeApi.create(payload)
      setModal(false); fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this route?')) return
    try { await routeApi.delete(id); fetchData() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <PageHeader title="Routes" subtitle="Manage vehicle routes and timing"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Route</button>}
      />
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search route name..." />
          <span className="text-sm text-gray-500">{total} records</span>
        </div>
        <Table headers={['#', 'Route Name', 'Vehicle No', 'Distance (km)', 'Pick Time', 'Drop Time', 'Status', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={8} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((r, i) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium">{r.name}</td>
              <td className="table-td">{r.vehicle_no || '—'}</td>
              <td className="table-td">{r.distance ?? '—'}</td>
              <td className="table-td text-xs">{r.pick_start_time} – {r.pick_end_time}</td>
              <td className="table-td text-xs">{r.drop_start_time} – {r.drop_end_time}</td>
              <td className="table-td"><StatusBadge status={toUiStatus(r.status)} /></td>
              <td className="table-td">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Route' : 'Add Route'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="space-y-4">
          <FormField label="Route Name" required>
            <input className={`input ${errors.name ? 'border-red-400' : ''}`} value={form.name} onChange={f('name')} placeholder="Route A - North" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vehicle No">
              <input className="input" value={form.vehicle_no} onChange={f('vehicle_no')} placeholder="TN01AB1234" />
            </FormField>
            <FormField label="Distance (km)">
              <input className="input" type="number" value={form.distance} onChange={f('distance')} placeholder="15" />
            </FormField>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Pick-up Timing</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Time" required>
              <input className={`input ${errors.pick_start_time ? 'border-red-400' : ''}`} type="time" value={form.pick_start_time} onChange={f('pick_start_time')} />
              {errors.pick_start_time && <p className="text-xs text-red-500 mt-1">{errors.pick_start_time}</p>}
            </FormField>
            <FormField label="End Time" required>
              <input className={`input ${errors.pick_end_time ? 'border-red-400' : ''}`} type="time" value={form.pick_end_time} onChange={f('pick_end_time')} />
              {errors.pick_end_time && <p className="text-xs text-red-500 mt-1">{errors.pick_end_time}</p>}
            </FormField>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Drop-off Timing</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Time" required>
              <input className={`input ${errors.drop_start_time ? 'border-red-400' : ''}`} type="time" value={form.drop_start_time} onChange={f('drop_start_time')} />
              {errors.drop_start_time && <p className="text-xs text-red-500 mt-1">{errors.drop_start_time}</p>}
            </FormField>
            <FormField label="End Time" required>
              <input className={`input ${errors.drop_end_time ? 'border-red-400' : ''}`} type="time" value={form.drop_end_time} onChange={f('drop_end_time')} />
              {errors.drop_end_time && <p className="text-xs text-red-500 mt-1">{errors.drop_end_time}</p>}
            </FormField>
          </div>
          <FormField label="Status">
            <select className="input" value={form.status} onChange={f('status')}><option>Active</option><option>Inactive</option></select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
