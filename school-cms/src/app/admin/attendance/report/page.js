'use client'
import { useState, useCallback } from 'react'
import { PageHeader, Table, Pagination, StatusBadge } from '@/components/ui'
import { studentAttendanceApi, classApi } from '@/lib/api'
import { useEffect } from 'react'

const PER_PAGE = 20
const STATUS_LABEL = { present: 'Present', absent: 'Absent', late: 'Late' }

export default function AttendanceReportPage() {
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [classId, setClassId]   = useState('')
  const [classes, setClasses]   = useState([])
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
  }, [])

  const fetchReport = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await studentAttendanceApi.list({
        attendance_dt: date || undefined,
        class_id:      classId || undefined,
        page,
        limit: PER_PAGE,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [date, classId, page])

  useEffect(() => { fetchReport() }, [fetchReport])

  const present    = data.filter(r => r.status === 'present').length
  const absent     = data.filter(r => r.status === 'absent').length
  const pct        = total ? Math.round((present / data.length) * 100) : 0

  return (
    <div>
      <PageHeader title="Attendance Report" subtitle="View student attendance records by date and class" />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" className="input w-auto" value={date} onChange={e => { setDate(e.target.value); setPage(1) }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
          <select className="input w-48" value={classId} onChange={e => { setClassId(e.target.value); setPage(1) }}>
            <option value="">— All Classes —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { l: 'Total Records', v: total,           c: 'text-gray-900'    },
            { l: 'Present',       v: present,          c: 'text-green-600'   },
            { l: 'Absent',        v: absent,            c: 'text-red-600'     },
            { l: 'Attendance %',  v: `${pct}%`,         c: 'text-primary-700' },
          ].map(i => (
            <div key={i.l} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${i.c}`} style={{fontFamily:'Outfit'}}>{i.v}</p>
              <p className="text-xs text-gray-500 mt-1">{i.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <Table headers={['Sl No.', 'Student', 'Class', 'Section', 'Date', 'Status']} empty={!loading && data.length === 0}>
          {loading ? (
            <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((r, i) => (
            <tr key={r.attendance_id ?? i} className="hover:bg-gray-50 transition-colors">
              <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
              <td className="table-td font-medium text-gray-900">
                {r.student_name || `Student #${r.student_id}`}
              </td>
              <td className="table-td">{r.class_name   || (r.class_id   ? `#${r.class_id}`   : '—')}</td>
              <td className="table-td">{r.section_name || (r.section_id ? `#${r.section_id}` : '—')}</td>
              <td className="table-td">{r.attendance_dt || '—'}</td>
              <td className="table-td">
                <StatusBadge status={STATUS_LABEL[r.status] || r.status} />
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
