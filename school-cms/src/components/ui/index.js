'use client'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import clsx from 'clsx'

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'purple' }) {
  const colors = {
    purple: 'text-primary-600 bg-primary-50',
    blue:   'text-blue-600 bg-blue-50',
    green:  'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
  }
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900" style={{fontFamily:'Outfit'}}>{value}</p>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-1.5">
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && <span className={clsx('text-xs font-medium', trend.startsWith('+') ? 'text-green-600' : 'text-gray-500')}>↑ {trend}</span>}
        </div>
      )}
    </div>
  )
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input type="text" className="input pl-9 w-60" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export function Table({ headers, children, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead><tr className="border-b border-gray-100">{headers.map(h => <th key={h} className="table-th">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-gray-50">
          {empty ? (
            <tr><td colSpan={headers.length} className="py-16 text-center text-sm text-gray-400">No records found</td></tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900" style={{fontFamily:'Outfit'}}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="p-5 border-t border-gray-100 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}

export function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div><h1 className="page-title">{title}</h1>{subtitle && <p className="page-sub">{subtitle}</p>}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    Active:   'badge-green',
    active:   'badge-green',
    Present:  'badge-green',
    Inactive: 'badge-red',
    inactive: 'badge-red',
    Absent:   'badge-red',
    Late:     'badge-yellow',
    Transfer: 'badge-blue',
    Leave:    'badge-yellow',
    Upcoming: 'badge-blue',
    Completed:'badge-green',
    Maintenance: 'badge-yellow',
    Online:   'badge-blue',
    Offline:  'badge-purple',
  }
  return <span className={clsx('badge', map[status] || 'badge-gray')}>{status}</span>
}
