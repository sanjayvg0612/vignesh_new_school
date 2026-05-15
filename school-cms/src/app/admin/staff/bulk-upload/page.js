'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { employeeApi } from '@/lib/api'

export default function StaffBulkUploadPage() {
  const [file, setFile]         = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')
  const inputRef                = useRef(null)

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f); setResult(null); setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f); setResult(null); setError('')
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true); setResult(null); setError('')
    try {
      const res = await employeeApi.bulkUpload(file)
      if (res.status === false) throw new Error(res.message || 'Upload failed')
      setResult(res.result || res)
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setFile(null); setResult(null); setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <PageHeader
        title="Staff Bulk Upload"
        subtitle="Upload multiple staff members at once using a CSV or Excel file"
      />

      <div className="card p-6 max-w-2xl">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">
            {file ? file.name : 'Drag & drop a file here, or click to select'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Supports .csv, .xls, .xlsx</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="w-5 h-5 text-primary-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={reset} className="text-xs text-red-500 hover:underline">Remove</button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Upload complete</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {result.created != null && (
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-primary-600">{result.created}</p>
                  <p className="text-xs text-gray-500 mt-1">Staff Created</p>
                </div>
              )}
              {result.skipped != null && (
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-yellow-500">{result.skipped}</p>
                  <p className="text-xs text-gray-500 mt-1">Skipped (duplicates)</p>
                </div>
              )}
              {result.failed != null && (
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-red-500">{result.failed}</p>
                  <p className="text-xs text-gray-500 mt-1">Failed</p>
                </div>
              )}
              {result.total != null && (
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <p className="text-2xl font-bold text-gray-700">{result.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Rows</p>
                </div>
              )}
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Row Errors
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <div key={i} className="text-xs text-red-600 bg-red-50 rounded px-3 py-1.5">{err}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          {(file || result) && (
            <button onClick={reset} className="btn-secondary">Clear</button>
          )}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 font-medium mb-2">Template columns (in order):</p>
          <div className="flex flex-wrap gap-1.5">
            {['first_name', 'last_name', 'email', 'mobile', 'gender', 'DOB',
              'qualification', 'address', 'salary', 'joining_dt', 'session_yr',
              'role_id', 'status'].map(col => (
              <span key={col} className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{col}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
