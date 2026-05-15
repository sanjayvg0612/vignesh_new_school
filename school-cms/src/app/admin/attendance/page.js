'use client'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader, Table, StatusBadge } from '@/components/ui'
import { studentAttendanceApi, studentApi, classApi } from '@/lib/api'

const SCHOOL_ID = 1
const STATUS_CYCLE = { present: 'absent', absent: 'late', late: 'present' }
const STATUS_LABEL = { present: 'Present', absent: 'Absent', late: 'Late' }

export default function AttendancePage() {
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [classId, setClassId]   = useState('')
  const [classes, setClasses]   = useState([])
  const [students, setStudents] = useState([])
  const [statuses, setStatuses] = useState({})
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
  }, [])

  const loadStudents = useCallback(async () => {
    if (!classId) { setStudents([]); setStatuses({}); return }
    setLoading(true); setError('')
    try {
      const res  = await studentApi.list({ class_id: classId, limit: 100 })
      const list = res.result?.data || res.result || []
      setStudents(list)
      const init = {}
      list.forEach(s => { init[s.student_id ?? s.id] = 'present' })
      setStatuses(init)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [classId])

  useEffect(() => { loadStudents() }, [loadStudents])

  const toggle = (id) => {
    setSaved(false)
    setStatuses(p => ({ ...p, [id]: STATUS_CYCLE[p[id]] || 'present' }))
  }

  const handleSave = async () => {
    if (!students.length || !date) return
    setSaving(true); setError('')
    try {
      const attendances = students.map(s => ({
        school_id:     SCHOOL_ID,
        class_id:      parseInt(classId, 10),
        student_id:    s.student_id ?? s.id,
        attendance_dt: date,
        status:        statuses[s.student_id ?? s.id] || 'present',
      }))
      await studentAttendanceApi.bulkCreate({ attendances })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const present = Object.values(statuses).filter(s => s === 'present').length
  const absent  = Object.values(statuses).filter(s => s === 'absent').length
  const late    = Object.values(statuses).filter(s => s === 'late').length

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        subtitle="Mark and submit student attendance"
        action={
          <button onClick={handleSave} className="btn-primary" disabled={saving || !students.length}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        }
      />

      {saved && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">Attendance saved successfully!</div>}
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { l: 'Present', v: present, c: 'green'  },
            { l: 'Absent',  v: absent,  c: 'red'    },
            { l: 'Late',    v: late,    c: 'yellow' },
          ].map(i => (
            <div key={i.l} className={`card p-4 text-center border-l-4 ${i.c === 'green' ? 'border-green-400' : i.c === 'red' ? 'border-red-400' : 'border-yellow-400'}`}>
              <p className={`text-2xl font-bold ${i.c === 'green' ? 'text-green-600' : i.c === 'red' ? 'text-red-600' : 'text-yellow-600'}`} style={{fontFamily:'Outfit'}}>{i.v}</p>
              <p className="text-xs text-gray-500 mt-1">{i.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
          <select className="input w-48" value={classId} onChange={e => setClassId(e.target.value)}>
            <option value="">— Select Class —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {!classId && <div className="card p-8 text-center text-gray-400 text-sm">Select a class to load students</div>}

      {classId && (
        <div className="card">
          <Table headers={['Sl No.', 'Student Name', 'Roll No', 'Status', 'Action']} empty={!loading && students.length === 0}>
            {loading ? (
              <tr><td colSpan={5} className="table-td text-center text-gray-400 py-8">Loading students...</td></tr>
            ) : students.map((s, i) => {
              const sid    = s.student_id ?? s.id
              const status = statuses[sid] || 'present'
              return (
                <tr key={sid} className="hover:bg-gray-50">
                  <td className="table-td text-gray-400">{i + 1}</td>
                  <td className="table-td font-medium text-gray-900">{s.first_name} {s.last_name}</td>
                  <td className="table-td">{s.roll_no || '—'}</td>
                  <td className="table-td"><StatusBadge status={STATUS_LABEL[status]} /></td>
                  <td className="table-td">
                    <button
                      onClick={() => toggle(sid)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        status === 'present' ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                        status === 'absent'  ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' :
                        'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {status === 'present' ? 'Mark Absent' : status === 'absent' ? 'Mark Late' : 'Mark Present'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </Table>
        </div>
      )}
    </div>
  )
}
