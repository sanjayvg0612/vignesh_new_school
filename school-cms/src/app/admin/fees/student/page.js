'use client'
import { useState } from 'react'
import { STUDENT_FEES } from '@/lib/mockData'
import { PageHeader, Table, SearchBar, StatusBadge } from '@/components/ui'

export default function StudentFeePage() {
  const [search, setSearch] = useState('')
  const rows = STUDENT_FEES.filter(r =>
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.roll_no.includes(search)
  )

  const totalPaid    = STUDENT_FEES.reduce((s, r) => s + r.paid, 0)
  const totalPending = STUDENT_FEES.reduce((s, r) => s + r.balance, 0)

  return (
    <div>
      <PageHeader title="Student Fee" subtitle="View individual student fee payment status" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900" style={{fontFamily:'Outfit'}}>{STUDENT_FEES.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600" style={{fontFamily:'Outfit'}}>₹{(totalPaid/1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500 mt-1">Total Collected</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-orange-600" style={{fontFamily:'Outfit'}}>₹{(totalPending/1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500 mt-1">Total Pending</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search student..." />
        </div>
        <Table headers={['#','Student','Roll No','Class','Fee Type','Amount','Paid','Balance','Status','Date']} empty={rows.length===0}>
          {rows.map((r, i) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="table-td text-gray-400">{i+1}</td>
              <td className="table-td font-medium">{r.student_name}</td>
              <td className="table-td">{r.roll_no}</td>
              <td className="table-td">{r.class_name}</td>
              <td className="table-td">{r.fee_type}</td>
              <td className="table-td">₹{r.amount.toLocaleString()}</td>
              <td className="table-td text-green-600 font-medium">₹{r.paid.toLocaleString()}</td>
              <td className="table-td text-orange-600 font-medium">₹{r.balance.toLocaleString()}</td>
              <td className="table-td"><StatusBadge status={r.status} /></td>
              <td className="table-td">{r.date || '—'}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  )
}
