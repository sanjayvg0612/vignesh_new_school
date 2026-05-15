'use client'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader, Table, Pagination } from '@/components/ui'
import { studentAttendanceApi, employeeAttendanceApi, classApi, sectionApi, groupApi } from '@/lib/api'

const PER_PAGE = 20
const STATUS_LABEL = { P: 'Present', A: 'Absent', L: 'Leave' }
const STATUS_COLOR  = {
  P: 'bg-green-100 text-green-700 border-green-300',
  A: 'bg-red-100 text-red-600 border-red-300',
  L: 'bg-yellow-100 text-yellow-700 border-yellow-300',
}

export default function ViewAttendancePage() {
  // Tab: 'student' | 'teacher'
  const [tab, setTab] = useState('student')

  // Shared
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [date, setDate]       = useState('')
  const [status, setStatus]   = useState('')

  // Student filters
  const [classes, setClasses]   = useState([])
  const [sections, setSections] = useState([])
  const [classId, setClassId]   = useState('')
  const [sectionId, setSectionId] = useState('')

  // Teacher filters
  const [groups, setGroups]   = useState([])
  const [groupId, setGroupId] = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  // Load student class dropdown
  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
    groupApi.dropdown().then(r => setGroups(Array.isArray(r.result) ? r.result : [])).catch(() => setGroups([]))
  }, [])

  // Load sections on class change
  useEffect(() => {
    setSectionId(''); setSections([])
    if (!classId) return
    sectionApi.dropdown({ class_id: classId }).then(r => setSections(r.result || [])).catch(() => setSections([]))
  }, [classId])

  // Reset data + page when tab switches
  const switchTab = (t) => {
    if (t === tab) return
    setTab(t); setPage(1); setData([]); setTotal(0)
    setDate(''); setStatus('')
    setClassId(''); setSectionId(''); setGroupId('')
  }

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      if (tab === 'student') {
        const res    = await studentAttendanceApi.list({
          class_id:      classId   || undefined,
          section_id:    sectionId || undefined,
          attendance_dt: date      || undefined,
          status:        status    || undefined,
          page,
          limit: PER_PAGE,
        })
        const result = res.result || {}
        setData(result.data  || [])
        setTotal(result.total || 0)
      } else {
        const res    = await employeeAttendanceApi.list({
          school_group_id: groupId || undefined,
          attendance_dt:   date    || undefined,
          status:          status  || undefined,
          page,
          limit: PER_PAGE,
        })
        const result = res.result || {}
        setData(result.data  || [])
        setTotal(result.total || 0)
      }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [tab, classId, sectionId, groupId, date, status, page])

  useEffect(() => { fetchData() }, [fetchData])

  const present = data.filter(r => r.status === 'P').length
  const absent  = data.filter(r => r.status === 'A').length
  const leave   = data.filter(r => r.status === 'L').length
  const pct     = data.length ? Math.round((present / data.length) * 100) : 0

  return (
    <div>
      <PageHeader title="View Attendance" subtitle="View student and teacher attendance records" />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">

        {/* Student / Teacher checkboxes */}
        <div className="flex items-center gap-4 self-end pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={tab === 'student'}
              onChange={() => switchTab('student')}
              className="w-4 h-4 accent-primary-600 cursor-pointer"
            />
            <span className={`text-sm font-medium ${tab === 'student' ? 'text-primary-700' : 'text-gray-500'}`}>Student</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={tab === 'teacher'}
              onChange={() => switchTab('teacher')}
              className="w-4 h-4 accent-primary-600 cursor-pointer"
            />
            <span className={`text-sm font-medium ${tab === 'teacher' ? 'text-primary-700' : 'text-gray-500'}`}>Teacher</span>
          </label>
        </div>

        <div className="w-px h-8 bg-gray-200 self-end" />

        {/* Student-specific filters */}
        {tab === 'student' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
              <select className="input w-36" value={classId} onChange={e => { setClassId(e.target.value); setPage(1) }}>
                <option value="">— All Classes —</option>
                {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code}{c.stream_name ? ` - ${c.stream_name}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
              <select className="input w-36" value={sectionId} onChange={e => { setSectionId(e.target.value); setPage(1) }} disabled={!classId}>
                <option value="">— All Sections —</option>
                {sections.map(s => <option key={s.section_id ?? s.id} value={s.section_id ?? s.id}>{s.section_code || s.name}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Teacher-specific filters */}
        {tab === 'teacher' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Group</label>
            <select className="input w-44" value={groupId} onChange={e => { setGroupId(e.target.value); setPage(1) }}>
              <option value="">— All Groups —</option>
              {groups.map(g => <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>)}
            </select>
          </div>
        )}

        {/* Shared filters */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" className="input w-40" value={date} onChange={e => { setDate(e.target.value); setPage(1) }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select className="input w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">— All —</option>
            <option value="P">Present</option>
            <option value="A">Absent</option>
            <option value="L">Leave</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {[
            { l: 'Total Records', v: total,     c: 'text-gray-900'    },
            { l: 'Present',       v: present,   c: 'text-green-600'   },
            { l: 'Absent',        v: absent,    c: 'text-red-500'     },
            { l: 'Leave',         v: leave,     c: 'text-yellow-600'  },
            { l: 'Attendance %',  v: `${pct}%`, c: 'text-primary-700' },
          ].map(i => (
            <div key={i.l} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${i.c}`} style={{ fontFamily: 'Outfit' }}>{i.v}</p>
              <p className="text-xs text-gray-500 mt-1">{i.l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card">
        {tab === 'student' ? (
          <Table headers={['Sl No.', 'Student Name', 'Class', 'Section', 'Group', 'Date', 'Status']} empty={!loading && data.length === 0}>
            {loading ? (
              <tr><td colSpan={7} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
            ) : data.map((r, i) => (
              <tr key={r.att_id ?? i} className="hover:bg-gray-50 transition-colors">
                <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="table-td font-medium text-gray-900">{r.student_name || `#${r.student_id}`}</td>
                <td className="table-td">{r.class_code   || (r.class_id   ? `#${r.class_id}`   : '—')}</td>
                <td className="table-td">{r.section_code || (r.section_id ? `#${r.section_id}` : '—')}</td>
                <td className="table-td">{r.group_name   || '—'}</td>
                <td className="table-td">{r.attendance_dt || '—'}</td>
                <td className="table-td">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {STATUS_LABEL[r.status] || r.status || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <Table headers={['Sl No.', 'Staff Name', 'Role', 'Group', 'Date', 'Status']} empty={!loading && data.length === 0}>
            {loading ? (
              <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
            ) : data.map((r, i) => (
              <tr key={r.att_id ?? r.id ?? i} className="hover:bg-gray-50 transition-colors">
                <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="table-td font-medium text-gray-900">
                  {r.emp_name || r.name || [r.first_name, r.last_name].filter(Boolean).join(' ') || `#${r.emp_id}`}
                </td>
                <td className="table-td text-gray-600">{r.role_name || '—'}</td>
                <td className="table-td text-gray-600">{r.group_name || '—'}</td>
                <td className="table-td">{r.attendance_dt || '—'}</td>
                <td className="table-td">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {STATUS_LABEL[r.status] || r.status || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
