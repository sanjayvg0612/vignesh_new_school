'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { studentApi, classApi } from '@/lib/api'

const SCHOOL_ID = 1

export default function PromotePage() {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')

  const [promoting, setPromoting] = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')
  const [classError, setClassError] = useState('')

  // Load classes once
  useEffect(() => {
    classApi.dropdown()
      .then(r => setClasses(Array.isArray(r.result) ? r.result : []))
      .catch(() => setClasses([]))
  }, [])

  const handlePromoteAll = async (e) => {
    e.preventDefault()
    if (!classId) { setClassError('Please select a class'); return }
    if (!confirm('Promote all students from this class to the next class? This action cannot be undone.')) return
    setPromoting(true); setSuccess(''); setError('')
    try {
      const res = await studentApi.promote(classId)
      setSuccess(typeof (res.result || res) === 'string' ? (res.result || res) : 'Promotion complete.')
      setClassId('')
    } catch (err) { setError(err.message) }
    finally { setPromoting(false) }
  }

  return (
    <div>
      <PageHeader
        title="Promote Students"
        subtitle="Promote students from one class to the next"
      />

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="card p-6 max-w-lg">
        <form onSubmit={handlePromoteAll} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              From Class <span className="text-red-500">*</span>
            </label>
            <select
              className={`input w-56 ${classError ? 'border-red-400' : ''}`}
              value={classId}
              onChange={e => { setClassId(e.target.value); setClassError('') }}
            >
              <option value="">— Select a class —</option>
              {classes.map(c => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_code}
                </option>
              ))}
            </select>
            {classError && <p className="text-xs text-red-500 mt-1">{classError}</p>}
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
            This will promote <strong>all active students</strong> from the selected class to the next class and same sections. Please ensure the next class exists before proceeding.
          </div>
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={promoting || !classId}
          >
            <TrendingUp className="w-4 h-4" />
            {promoting ? 'Promoting...' : 'Promote All Students'}
          </button>
        </form>
      </div>
    </div>
  )
}
