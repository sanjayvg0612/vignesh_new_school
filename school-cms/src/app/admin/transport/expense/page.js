'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { vehicleExpenseApi, vehicleApi } from '@/lib/api'
import { PageHeader, Table, Pagination, Modal, FormField } from '@/components/ui'

const PER_PAGE = 10
const EMPTY_FORM = { vehicle_id: '', session_yr: '', amount: '', date: '', description: '' }

export default function VehicleExpensePage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [modalOpen, setModal] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [vehicles, setVehicles] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const fileRef = useRef(null)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await vehicleExpenseApi.list({ page, limit: PER_PAGE })
      const r = res.result || {}
      setData(r.data || []); setTotal(r.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    vehicleApi.dropdown().then(r => setVehicles(Array.isArray(r.result) ? r.result : [])).catch(() => setVehicles([]))
  }, [])

  const closeModal = () => { setModal(false); setErrors({}); setImageFile(null); if (fileRef.current) fileRef.current.value = '' }
  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setErrors({}); setImageFile(null); setModal(true) }
  const openEdit = (ex) => {
    setEditing(ex)
    const dateVal = ex.date ? ex.date.split('T')[0] : ''
    setForm({ vehicle_id: ex.vehicle_id ?? '', session_yr: ex.session_yr || '', amount: ex.amount ?? '', date: dateVal, description: ex.description || '' })
    setErrors({}); setImageFile(null); setModal(true)
  }

  const f = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.amount) e.amount = 'Amount is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const payload = {
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : undefined,
        session_yr: form.session_yr || undefined,
        amount:     form.amount,
        date:       form.date ? `${form.date}T00:00:00` : undefined,
        description:form.description || undefined,
      }
      if (editing) await vehicleExpenseApi.update(editing.id, payload, imageFile || undefined)
      else await vehicleExpenseApi.create(payload, imageFile || undefined)
      setModal(false); fetchData()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try { await vehicleExpenseApi.delete(id); fetchData() }
    catch (e) { alert(e.message) }
  }

  const grandTotal = data.reduce((s, ex) => s + Number(ex.amount || 0), 0)

  return (
    <div>
      <PageHeader title="Vehicle Expense" subtitle="Track and manage vehicle running expenses"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Expense</button>}
      />
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Total Expenses: <span className="text-primary-700 font-bold">₹{grandTotal.toLocaleString()}</span></p>
          <span className="text-sm text-gray-500">{total} records</span>
        </div>
        <Table headers={['#', 'Vehicle ID', 'Amount (₹)', 'Date', 'Session Year', 'Description', 'Actions']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((ex, i) => (
            <tr key={ex.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium">{ex.vehicle_id ?? '—'}</td>
              <td className="table-td font-semibold text-gray-900">₹{Number(ex.amount || 0).toLocaleString()}</td>
              <td className="table-td">{ex.date ? ex.date.split('T')[0] : '—'}</td>
              <td className="table-td">{ex.session_yr || '—'}</td>
              <td className="table-td text-gray-500 text-xs max-w-xs truncate">{ex.description || '—'}</td>
              <td className="table-td">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(ex)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(ex.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Expense' : 'Add Vehicle Expense'}
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vehicle">
              <select className="input" value={form.vehicle_id} onChange={f('vehicle_id')}>
                <option value="">— Select Vehicle —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_name || v.vehicle_no || v.name || `Vehicle #${v.id}`}</option>)}
              </select>
            </FormField>
            <FormField label="Session Year">
              <input className="input" value={form.session_yr} onChange={f('session_yr')} placeholder="2024-25" />
            </FormField>
          </div>
          <FormField label="Amount (₹)" required>
            <input className={`input ${errors.amount ? 'border-red-400' : ''}`} type="number" value={form.amount} onChange={f('amount')} placeholder="1500" />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </FormField>
          <FormField label="Date">
            <input className="input" type="date" value={form.date} onChange={f('date')} />
          </FormField>
          <FormField label="Description">
            <input className="input" value={form.description} onChange={f('description')} placeholder="Fuel expense, tyre replacement..." />
          </FormField>
          <FormField label="Receipt Image (optional)">
            <input ref={fileRef} className="input pt-1.5" type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0] || null)} />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
