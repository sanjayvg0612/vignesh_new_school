'use client'
import { useState, useEffect, useCallback } from 'react'
import { PageHeader, Table, Pagination } from '@/components/ui'
import { marksApi, classApi, subjectApi } from '@/lib/api'

const PER_PAGE = 20

export default function ResultsPage() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const [classes, setClasses]   = useState([])
  const [subjects, setSubjects] = useState([])

  const [filterClassId,   setFilterClassId]   = useState('')
  const [filterSubjectId, setFilterSubjectId] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  useEffect(() => {
    classApi.dropdown().then(r => setClasses(r.result || [])).catch(() => setClasses([]))
  }, [])

  useEffect(() => {
    setSubjects([])
    if (!filterClassId) return
    subjectApi.dropdown({ class_id: filterClassId, limit: 100 })
      .then(r => setSubjects(r.result || []))
      .catch(() => setSubjects([]))
  }, [filterClassId])

  const fetchResults = useCallback(async () => {
    if (!filterStudentId) { setData([]); setTotal(0); return }
    setLoading(true); setError('')
    try {
      const res    = await marksApi.list({
        student_id: filterStudentId,
        class_id:   filterClassId   || undefined,
        subject_id: filterSubjectId || undefined,
        page, limit: PER_PAGE,
      })
      const result = res.result || {}
      setData(result.data  || [])
      setTotal(result.total || 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [filterStudentId, filterClassId, filterSubjectId, page])

  useEffect(() => { fetchResults() }, [fetchResults])

  const gradeColor = (mark, total) => {
    if (mark == null || !total) return 'text-gray-500'
    const pct = (mark / total) * 100
    if (pct >= 75) return 'text-green-600'
    if (pct >= 50) return 'text-yellow-600'
    return 'text-red-500'
  }

  return (
    <div>
      <PageHeader title="Exam Results" subtitle="View student marks and performance" />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Filters */}
      <div className="card p-4 mb-4 flex gap-4 flex-wrap items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
          <select className="input w-40" value={filterClassId} onChange={e => { setFilterClassId(e.target.value); setPage(1) }}>
            <option value="">— All Classes —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
          <select className="input w-40" value={filterSubjectId} onChange={e => { setFilterSubjectId(e.target.value); setPage(1) }} disabled={!filterClassId}>
            <option value="">— All Subjects —</option>
            {subjects.map(s => <option key={s.id ?? s.subject_id} value={s.id ?? s.subject_id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Student ID</label>
          <input
            type="number"
            className="input w-36"
            value={filterStudentId}
            onChange={e => { setFilterStudentId(e.target.value); setPage(1) }}
            placeholder="Student ID"
          />
        </div>
        <span className="text-sm text-gray-500 self-end pb-1">
          {filterStudentId ? `${total} records` : 'Enter Student ID to view results'}
        </span>
      </div>

      <div className="card">
        <Table
          headers={['Sl No.', 'Student', 'Class', 'Subject', 'Mark', 'Grade']}
          empty={!loading && data.length === 0}
        >
          {loading ? (
            <tr><td colSpan={6} className="table-td text-center text-gray-400 py-8">Loading...</td></tr>
          ) : data.map((r, i) => {
            const mark = r.mark ?? r.marks_obtained
            return (
              <tr key={r.mark_id ?? r.marks_id ?? i} className="hover:bg-gray-50 transition-colors">
                <td className="table-td text-gray-400">{(page - 1) * PER_PAGE + i + 1}</td>
                <td className="table-td font-medium text-gray-900">
                  {r.student_name || (r.student_id ? `Student #${r.student_id}` : '—')}
                </td>
                <td className="table-td">{r.class_name   || (r.class_id   ? `#${r.class_id}`   : '—')}</td>
                <td className="table-td">{r.subject_name || (r.subject_id ? `#${r.subject_id}` : '—')}</td>
                <td className="table-td">
                  <span className={`font-semibold ${gradeColor(mark, r.total_marks)}`}>
                    {mark ?? '—'}{r.total_marks != null ? ` / ${r.total_marks}` : ''}
                  </span>
                </td>
                <td className="table-td">
                  {r.grade
                    ? <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full text-xs">{r.grade}</span>
                    : '—'}
                </td>
              </tr>
            )
          })}
        </Table>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
