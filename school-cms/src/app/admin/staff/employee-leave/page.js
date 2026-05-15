'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Paperclip, CheckCircle, XCircle } from 'lucide-react'
import { PageHeader, SearchBar, Table, Pagination, Modal, FormField } from '@/components/ui'
import { empLeaveApi, employeeApi } from '@/lib/api'

const PER_PAGE = 10

const LEAVE_TYPES = ['Sick', 'Casual', 'Annual', 'Maternity', 'Paternity', 'Unpaid', 'Other']

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const EMPTY_FORM = {
  emp_id: '', leave_type: '', from_dt: '', to_date: '', reason: '',
}

export default function EmployeeLeavePage() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Filters
  const [filterStatus, setFilterStatus]       = useState('')
  const [filterLeaveType, setFilterLeaveType] = useState('')

  // Modal
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [file, setFile]       = useState(null)
  const [fileName, setFileName] = useState('')

  // Employees dropdown
  const [employees, setEmployees] = useState([])

  // Action states
  const [actionId, setActionId]     = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { type: 'approve'|'reject'|'delete', id }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchLeaves = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await empLeaveApi.list({
        page, limit: PER_PAGE,
        search:     search     || undefined,
        status:     filterStatus     || undefined,
        leave_type: filterLeaveType  || undefined,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page, search, filterStatus, filterLeaveType])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  // Load employees for dropdown once
  useEffect(() => {
    employeeApi.dropdown()
      .then(r => setEmployees(Array.isArray(r.result) ? r.result : []))
      .catch(() => setEmployees([]))
  }, [])

  const handleSearch = (v) => { setSearch(v); setPage(1) }

  const closeModal = () => { setModal(false); setFormErrors({}); setFile(null); setFileName('') }

  const openAdd = () => {
    setEditing(null); setFormErrors({})
    setFile(null); setFileName('')
    setForm(EMPTY_FORM)
    setModal(true)
  }

  const openEdit = async (item) => {
    setEditing(item); setFormErrors({})
    setFile(null); setFileName('')
    let full = item
    try {
      const res = await empLeaveApi.getById(item.leave_id ?? item.id)
      full = res.result || item
    } catch { /* fall back */ }
    setForm({
      emp_id:     full.emp_id     ? String(full.emp_id)  : '',
      leave_type: full.leave_type || '',
      from_dt:    full.from_dt    ? full.from_dt.slice(0, 10) : '',
      to_date:    full.to_date    ? full.to_date.slice(0, 10) : '',
      reason:     full.reason     || '',
    })
    setModal(true)
  }

  const validate = () => {
    const e = {}
    if (!form.emp_id)     e.emp_id     = 'Employee is required'
    if (!form.leave_type) e.leave_type = 'Leave type is required'
    if (!form.from_dt)    e.from_dt    = 'From date is required'
    if (!form.to_date)    e.to_date    = 'To date is required'
    return e
  }

  const handleSave = async () => {
    const ve = validate()
    if (Object.keys(ve).length) { setFormErrors(ve); return }
    setSaving(true)
    try {
      const payload = {
        emp_id:     Number(form.emp_id),
        leave_type: form.leave_type,
        from_dt:    form.from_dt,
        to_date:    form.to_date,
        reason:     form.reason || undefined,
      }
      if (editing) {
        await empLeaveApi.update(editing.leave_id ?? editing.id, payload, file || undefined)
      } else {
        await empLeaveApi.create(payload, file || undefined)
      }
      closeModal(); fetchLeaves()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleAction = async () => {
    if (!confirmAction) return
    setActionId(confirmAction.id)
    try {
      if (confirmAction.type === 'approve') await empLeaveApi.approve(confirmAction.id)
      else if (confirmAction.type === 'reject') await empLeaveApi.reject(confirmAction.id)
      else if (confirmAction.type === 'delete') await empLeaveApi.delete(confirmAction.id)
      setConfirmAction(null); fetchLeaves()
    } catch (e) { alert(e.message) }
    finally { setActionId(null) }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const empName = (item) => {
    if (item.emp_name) return item.emp_name
    if (item.first_name || item.last_name) return [item.first_name, item.last_name].filter(Boolean).join(' ')
    const emp = employees.find(e => e.emp_id === item.emp_id)
    return emp ? [emp.first_name, emp.last_name].filter(Boolean).join(' ') || `Emp #${item.emp_id}` : `Emp #${item.emp_id}`
  }

  return (
    <div>
      <PageHeader
        title="Employee Leave Requests"
        subtitle="Manage and approve employee leave applications"
        action={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Leave Request
          </button>
        }
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search employee..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select className="input w-36" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Leave Type</label>
          <select className="input w-36" value={filterLeaveType} onChange={e => { setFilterLeaveType(e.target.value); setPage(1) }}>
            <option value="">All Types</option>
            {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <span className="text-sm text-gray-500 self-end pb-2">{total} records</span>
      </div>

      <div className="card">
        <Table
          headers={['Sl No.', 'Employee', 'Leave Type', 'From', 'To', 'Reason', 'Status', 'Attachment', 'Actions']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr><td colSpan={9} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((item, i) => {
            const id = item.leave_id ?? item.id
            const status = (item.status || 'pending').toLowerCase()
            return (
              <tr key={id ?? i} className="hover:bg-gray-50 transition-colors">
                <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="table-td font-medium text-gray-900">{empName(item)}</td>
                <td className="table-td">{item.leave_type || '—'}</td>
                <td className="table-td whitespace-nowrap">{formatDate(item.from_dt)}</td>
                <td className="table-td whitespace-nowrap">{formatDate(item.to_date)}</td>
                <td className="table-td text-gray-500 max-w-xs truncate">{item.reason || '—'}</td>
                <td className="table-td">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
                    {status}
                  </span>
                </td>
                <td className="table-td">
                  {id ? (
                    <a href={empLeaveApi.attachmentUrl(id)} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs">
                      <Paperclip className="w-3 h-3" /> View
                    </a>
                  ) : '—'}
                </td>
                <td className="table-td">
                  <div className="flex items-center gap-1">
                    {status === 'pending' && (
                      <>
                        <button
                          title="Approve"
                          onClick={() => setConfirmAction({ type: 'approve', id })}
                          className="p-1.5 rounded hover:bg-green-50 text-green-600"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Reject"
                          onClick={() => setConfirmAction({ type: 'reject', id })}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-primary-50 text-primary-600">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmAction({ type: 'delete', id })} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Leave Request' : 'Add Leave Request'}
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Employee" required>
            <select
              className={`input ${formErrors.emp_id ? 'border-red-400' : ''}`}
              value={form.emp_id}
              onChange={e => { setForm(f => ({ ...f, emp_id: e.target.value })); if (formErrors.emp_id) setFormErrors(p => ({ ...p, emp_id: '' })) }}
            >
              <option value="">— Select Employee —</option>
              {employees.map(e => (
                <option key={e.emp_id} value={e.emp_id}>
                  {[e.first_name, e.last_name].filter(Boolean).join(' ') || `Emp #${e.emp_id}`}
                </option>
              ))}
            </select>
            {formErrors.emp_id && <p className="text-xs text-red-500 mt-1">{formErrors.emp_id}</p>}
          </FormField>

          <FormField label="Leave Type" required>
            <select
              className={`input ${formErrors.leave_type ? 'border-red-400' : ''}`}
              value={form.leave_type}
              onChange={e => { setForm(f => ({ ...f, leave_type: e.target.value })); if (formErrors.leave_type) setFormErrors(p => ({ ...p, leave_type: '' })) }}
            >
              <option value="">— Select Leave Type —</option>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {formErrors.leave_type && <p className="text-xs text-red-500 mt-1">{formErrors.leave_type}</p>}
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="From Date" required>
              <input
                className={`input ${formErrors.from_dt ? 'border-red-400' : ''}`}
                type="date"
                value={form.from_dt}
                onChange={e => { setForm(f => ({ ...f, from_dt: e.target.value })); if (formErrors.from_dt) setFormErrors(p => ({ ...p, from_dt: '' })) }}
              />
              {formErrors.from_dt && <p className="text-xs text-red-500 mt-1">{formErrors.from_dt}</p>}
            </FormField>
            <FormField label="To Date" required>
              <input
                className={`input ${formErrors.to_date ? 'border-red-400' : ''}`}
                type="date"
                value={form.to_date}
                onChange={e => { setForm(f => ({ ...f, to_date: e.target.value })); if (formErrors.to_date) setFormErrors(p => ({ ...p, to_date: '' })) }}
              />
              {formErrors.to_date && <p className="text-xs text-red-500 mt-1">{formErrors.to_date}</p>}
            </FormField>
          </div>

          <FormField label="Reason">
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Reason for leave..."
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            />
          </FormField>

          <FormField label="Attachment (optional)">
            <label className="flex items-center gap-2 cursor-pointer input py-2 text-sm text-gray-500 hover:border-primary-400 transition-colors">
              <Paperclip className="w-4 h-4 shrink-0" />
              <span className="truncate">{fileName || 'Choose file...'}</span>
              <input
                type="file"
                className="hidden"
                onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setFileName(f.name) } }}
              />
            </label>
          </FormField>
        </div>
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === 'approve' ? 'Approve Leave Request' :
          confirmAction?.type === 'reject'  ? 'Reject Leave Request'  : 'Delete Leave Request'
        }
        footer={
          <>
            <button onClick={() => setConfirmAction(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleAction}
              disabled={!!actionId}
              className={`btn-primary ${confirmAction?.type === 'delete' || confirmAction?.type === 'reject' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
            >
              {actionId
                ? 'Processing...'
                : confirmAction?.type === 'approve' ? 'Approve'
                : confirmAction?.type === 'reject'  ? 'Reject'
                : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          {confirmAction?.type === 'approve' && 'Are you sure you want to approve this leave request?'}
          {confirmAction?.type === 'reject'  && 'Are you sure you want to reject this leave request?'}
          {confirmAction?.type === 'delete'  && 'Are you sure you want to delete this leave request? This action cannot be undone.'}
        </p>
      </Modal>
    </div>
  )
}
