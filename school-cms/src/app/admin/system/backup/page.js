'use client'
import { useState } from 'react'
import { Database, Download, RefreshCw, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui'

export default function BackupPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleBackup = () => {
    setLoading(true); setDone(false)
    setTimeout(() => { setLoading(false); setDone(true) }, 2000)
  }

  return (
    <div>
      <PageHeader title="Data Backup" subtitle="Download or trigger system data backup" />
      {done && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Backup completed successfully!</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div className="card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1" style={{fontFamily:'Outfit'}}>Full Database Backup</h3>
            <p className="text-sm text-gray-500">Create a complete backup of all school data including students, teachers, fees, and records.</p>
          </div>
          <button onClick={handleBackup} disabled={loading} className="btn-primary mt-auto justify-center">
            {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating Backup...</> : <><Download className="w-4 h-4" /> Start Backup</>}
          </button>
        </div>
        <div className="card p-6 flex flex-col gap-4 opacity-60">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1" style={{fontFamily:'Outfit'}}>Scheduled Backup</h3>
            <p className="text-sm text-gray-500">Configure automatic scheduled backups. Connect your backend to enable.</p>
          </div>
          <button disabled className="btn-secondary mt-auto cursor-not-allowed">Coming Soon</button>
        </div>
      </div>
    </div>
  )
}
