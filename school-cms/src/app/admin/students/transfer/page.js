'use client'
import { useState, useEffect, useRef } from 'react'
import { ArrowRightLeft, CheckCircle, Search, X } from 'lucide-react'
import { PageHeader, FormField } from '@/components/ui'
import { studentApi, sectionApi } from '@/lib/api'

export default function TransferPage() {
  const [studentId, setStudentId]             = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchQuery, setSearchQuery]         = useState('')
  const [searchResults, setSearchResults]     = useState([])
  const [searching, setSearching]             = useState(false)
  const [showResults, setShowResults]         = useState(false)

  const [sectionId, setSectionId]             = useState('')
  const [sections, setSections]               = useState([])
  const [sectionLoading, setSectionLoading]   = useState(false)

  const [transferring, setTransferring] = useState(false)
  const [success, setSuccess]           = useState('')
  const [error, setError]               = useState('')
  const [errors, setErrors]             = useState({})

  const searchRef   = useRef(null)
  const debounceRef = useRef(null)

  const handleSearchChange = (val) => {
    setSearchQuery(val)
    setShowResults(true)
    if (!val.trim()) { setSearchResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await studentApi.list({ search: val.trim(), limit: 10 })
        setSearchResults(res.result?.data || [])
      } catch { setSearchResults([]) } finally { setSearching(false) }
    }, 400)
  }

  const selectStudent = async (s) => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
    setSectionId('')
    setSections([])
    if (errors.studentId) setErrors(p => ({ ...p, studentId: '' }))

    // Fetch full student record to get class_id, section_id, section_code etc.
    setSectionLoading(true)
    try {
      const res = await studentApi.getById(s.student_id)
      const full = res.result || s
      setSelectedStudent(full)
      setStudentId(full.student_id)
      const cid = full.class_id
      if (cid) {
        const secRes = await sectionApi.dropdown({ class_id: cid })
        setSections(Array.isArray(secRes.result) ? secRes.result : [])
      }
    } catch {
      // Fall back to partial data from search result
      setSelectedStudent(s)
      setStudentId(s.student_id)
      setSections([])
    } finally {
      setSectionLoading(false)
    }
  }

  const clearStudent = () => {
    setSelectedStudent(null)
    setStudentId('')
    setSearchQuery('')
    setSearchResults([])
    setSections([])
    setSectionId('')
  }

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleTransfer = async (e) => {
    e.preventDefault()
    const ve = {}
    if (!studentId) ve.studentId = 'Please select a student'
    if (!sectionId) ve.sectionId = 'Please select a section'
    else if (sectionId === String(selectedStudent?.section_id)) ve.sectionId = 'Please select a different section'
    if (Object.keys(ve).length) { setErrors(ve); return }
    setErrors({})
    setTransferring(true)
    setSuccess('')
    setError('')
    try {
      const res = await studentApi.transfer(studentId, sectionId)
      setSuccess(res.message || 'Student transferred successfully.')
      clearStudent()
    } catch (err) {
      setError(err.message)
    } finally {
      setTransferring(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Transfer Student"
        subtitle="Move a student to a different class section"
      />

      <div className="card p-6 max-w-lg">
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleTransfer} className="space-y-4">

          {/* Student Search */}
          <FormField label="Select Student" required>
            {selectedStudent ? (
              <div className="flex items-center justify-between rounded-lg border px-3 py-2 bg-primary-50 border-primary-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {[selectedStudent.first_name, selectedStudent.last_name].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedStudent.student_roll_id ? `Roll: ${selectedStudent.student_roll_id}` : ''}
                    {selectedStudent.class_code ? `  •  Class: ${selectedStudent.class_code}` : ''}
                  </p>
                </div>
                <button type="button" onClick={clearStudent} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative" ref={searchRef}>
                <div className={`flex items-center gap-2 input ${errors.studentId ? 'border-red-400 focus-within:ring-red-400' : ''}`}>
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    className="flex-1 outline-none bg-transparent text-sm"
                    placeholder="Search by name or student ID..."
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    onFocus={() => searchQuery && setShowResults(true)}
                  />
                  {searching && <span className="text-xs text-gray-400">Searching...</span>}
                </div>
                {showResults && (searchResults.length > 0 || (!searching && searchQuery)) && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">No students found</p>
                    ) : searchResults.map(s => (
                      <button
                        key={s.student_id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        onClick={() => selectStudent(s)}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {[s.first_name, s.last_name].filter(Boolean).join(' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.student_roll_id ? `Roll: ${s.student_roll_id}` : ''}
                          {s.class_code ? `  •  Class: ${s.class_code}` : ''}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
          </FormField>

          {/* Current Section & Transfer to Section — same row */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Current Section">
              <input
                className="input bg-gray-50 text-gray-500 cursor-not-allowed"
                value={ selectedStudent?.section_code || '—'}
                readOnly
              />
            </FormField>

            <FormField label="Transfer to Section" required>
              <select
                className={`input ${errors.sectionId ? 'border-red-400 focus:ring-red-400' : ''}`}
                value={sectionId}
                onChange={e => {
                  const val = e.target.value
                  setSectionId(val)
                  if (val && val === String(selectedStudent?.section_id)) setErrors(p => ({ ...p, sectionId: 'Please select a different section' }))
                  else if (errors.sectionId) setErrors(p => ({ ...p, sectionId: '' }))
                }}
                disabled={sectionLoading || !selectedStudent || sections.length === 0}
              >
                <option value="">
                  {sectionLoading ? 'Loading...' : !selectedStudent ? '— Select student first —' : sections.length === 0 ? 'No sections available' : '— Select section —'}
                </option>
                {sections.map(s => (
                  <option key={s.section_id} value={s.section_id}>{s.section_code}</option>
                ))}
              </select>
              {errors.sectionId && <p className="text-xs text-red-500 mt-1">{errors.sectionId}</p>}
            </FormField>
          </div>

          <button
            type="submit"
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={transferring || (!!sectionId && sectionId === String(selectedStudent?.section_id))}
          >
            <ArrowRightLeft className="w-4 h-4" />
            {transferring ? 'Transferring...' : 'Transfer Student'}
          </button>
        </form>
      </div>
    </div>
  )
}
