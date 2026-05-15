'use client'
import { useState, useEffect, useRef } from 'react'
import { Pencil, X } from 'lucide-react'
import { PageHeader, Table } from '@/components/ui'
import { employeeAttendanceApi, employeeApi, groupApi } from '@/lib/api'

const STATUS_LABEL = { P: 'Present', A: 'Absent', L: 'Leave' }
const STATUS_COLOR = {
  P: 'bg-green-100 text-green-700 border-green-300',
  A: 'bg-red-100 text-red-600 border-red-300',
  L: 'bg-yellow-100 text-yellow-700 border-yellow-300',
}

export default function TeacherAttendancePage() {
  const [groups, setGroups]       = useState([])
  const [employees, setEmployees] = useState([])
  const [statuses, setStatuses]   = useState({})

  const [groupId, setGroupId] = useState('')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [search, setSearch]   = useState('')

  const [empLoading, setEmpLoading] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')

  // Edit modal
  const [editEmp, setEditEmp]       = useState(null)
  const [editStatus, setEditStatus] = useState('P')
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    groupApi.dropdown()
      .then(r => setGroups(Array.isArray(r.result) ? r.result : []))
      .catch(() => setGroups([]))
  }, [])

  // Load employees filtered by group
  useEffect(() => {
    if (!groupId) { setEmployees([]); setStatuses({}); return }
    setEmpLoading(true)
    employeeApi.list({ school_group_id: groupId, limit: 100 })
      .then(r => {
        const list = r.result?.data || r.result || []
        setEmployees(list)
        setStatuses(prev => {
          const init = {}
          list.forEach(e => {
            const id = e.emp_db_id ?? e.emp_id ?? e.id
            init[id] = prev[id] || 'P'
          })
          return init
        })
      })
      .catch(() => setEmployees([]))
      .finally(() => setEmpLoading(false))
  }, [groupId])

  const markAll = (status) => {
    setSaved(false)
    const next = {}
    employees.forEach(e => { next[e.emp_db_id ?? e.emp_id ?? e.id] = status })
    setStatuses(next)
  }

  const handleSave = async () => {
    if (!employees.length || !groupId) {
      setError('Please select a Group before saving.')
      return
    }
    setSaving(true); setError('')
    try {
      await employeeAttendanceApi.bulkCreate({
        school_group_id: parseInt(groupId, 10),
        attendance_dt:   date,
        employees: employees.map(e => ({
          emp_id: e.emp_db_id ?? e.emp_id ?? e.id,
          status: statuses[e.emp_db_id ?? e.emp_id ?? e.id] || 'P',
        })),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  // Edit modal handlers
  const openEdit = (emp) => {
    const id = emp.emp_db_id ?? emp.emp_id ?? emp.id
    setEditEmp(emp)
    setEditStatus(statuses[id] || 'P')
  }

  const handleEditSave = async () => {
    if (!editEmp) return
    const id = editEmp.emp_db_id ?? editEmp.emp_id ?? editEmp.id
    setEditSaving(true)
    try {
      await employeeAttendanceApi.update(id, { status: editStatus, attendance_dt: date })
      setStatuses(p => ({ ...p, [id]: editStatus }))
      setEditEmp(null)
    } catch (e) { alert(e.message) }
    finally { setEditSaving(false) }
  }

  const filteredEmployees = search.trim()
    ? employees.filter(e => {
        const name = (e.name || `${e.first_name ?? ''} ${e.last_name ?? ''}`).toLowerCase()
        const role = (e.role_name || '').toLowerCase()
        const q = search.trim().toLowerCase()
        return name.includes(q) || role.includes(q)
      })
    : employees

  const present = Object.values(statuses).filter(s => s === 'P').length
  const absent  = Object.values(statuses).filter(s => s === 'A').length
  const leave   = Object.values(statuses).filter(s => s === 'L').length

  return (
    <div>
      <PageHeader
        title="Teacher Attendance"
        subtitle="Mark daily attendance for teachers and staff"
        action={
          <button onClick={handleSave} className="btn-primary" disabled={saving || !employees.length}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        }
      />

      {saved && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">Attendance saved successfully!</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Group <span className="text-red-500">*</span></label>
          <select className="input w-44" value={groupId} onChange={e => setGroupId(e.target.value)}>
            <option value="">— Select Group —</option>
            {groups.map(g => <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" className="input w-40" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Search Staff</label>
          <input
            className="input w-48"
            placeholder="Name or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {groupId && (
          <button onClick={() => { setGroupId(''); setEmployees([]); setStatuses({}); setSearch('') }} className="btn-secondary text-xs px-3 py-1.5 self-end">
            Clear Filters
          </button>
        )}
      </div>

      {/* Summary + quick actions */}
      {employees.length > 0 && (
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex gap-3">
            <div className="card px-4 py-3 text-center min-w-[80px]">
              <p className="text-xl font-bold text-green-600" style={{ fontFamily: 'Outfit' }}>{present}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
            <div className="card px-4 py-3 text-center min-w-[80px]">
              <p className="text-xl font-bold text-red-500" style={{ fontFamily: 'Outfit' }}>{absent}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
            <div className="card px-4 py-3 text-center min-w-[80px]">
              <p className="text-xl font-bold text-yellow-600" style={{ fontFamily: 'Outfit' }}>{leave}</p>
              <p className="text-xs text-gray-500">Leave</p>
            </div>
            <div className="card px-4 py-3 text-center min-w-[80px]">
              <p className="text-xl font-bold text-gray-700" style={{ fontFamily: 'Outfit' }}>{employees.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => markAll('P')} className="btn-secondary text-xs">Mark All Present</button>
            <button onClick={() => markAll('A')} className="btn-secondary text-xs">Mark All Absent</button>
          </div>
        </div>
      )}

      {!groupId ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Select a Group to load employees</div>
      ) : empLoading ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Loading employees...</div>
      ) : (
        <div className="card">
          <Table headers={['Sl No.', 'Name', 'Role', 'Mobile', 'Status', 'Action']} empty={filteredEmployees.length === 0}>
            {filteredEmployees.map((emp, i) => {
              const id = emp.emp_db_id ?? emp.emp_id ?? emp.id
              const st = statuses[id] || 'P'
              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="table-td text-gray-400">{i + 1}</td>
                  <td className="table-td font-medium text-gray-900">
                    {emp.name || `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() || `Staff #${id}`}
                  </td>
                  <td className="table-td text-gray-500">{emp.role_name || '—'}</td>
                  <td className="table-td text-gray-500">{emp.mobile || '—'}</td>
                  <td className="table-td">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[st]}`}>
                      {STATUS_LABEL[st]}
                    </span>
                  </td>
                  <td className="table-td">
                    <button
                      onClick={() => openEdit(emp)}
                      className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"
                      title="Edit attendance"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </Table>
        </div>
      )}

      {/* Edit Modal */}
      {editEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditEmp(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <button onClick={() => setEditEmp(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-semibold text-gray-900 mb-4">Edit Attendance</h3>

            {/* Employee info card */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary-600">
                    {(editEmp.name || editEmp.first_name || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {editEmp.name || `${editEmp.first_name ?? ''} ${editEmp.last_name ?? ''}`.trim()}
                  </p>
                  {editEmp.role_name && <p className="text-xs text-gray-500">{editEmp.role_name}</p>}
                  {editEmp.mobile    && <p className="text-xs text-gray-400">{editEmp.mobile}</p>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>Date:</span>
                <span className="font-medium text-gray-700">{date}</span>
              </div>
            </div>

            {/* Mark buttons */}
            <p className="text-xs font-medium text-gray-500 mb-2">Mark Attendance</p>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setEditStatus('P')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  editStatus === 'P'
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-green-600 border-green-300 hover:bg-green-50'
                }`}
              >
                Mark Present
              </button>
              <button
                onClick={() => setEditStatus('A')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  editStatus === 'A'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-red-500 border-red-300 hover:bg-red-50'
                }`}
              >
                Mark Absent
              </button>
              <button
                onClick={() => setEditStatus('L')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  editStatus === 'L'
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                Mark Leave
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditEmp(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleEditSave} className="btn-primary flex-1" disabled={editSaving}>
                {editSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
