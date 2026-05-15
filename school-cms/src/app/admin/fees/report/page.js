'use client'
import { FEES, STUDENT_FEES } from '@/lib/mockData'
import { PageHeader, Table } from '@/components/ui'

export default function FeeReportPage() {
  const totalCollected = FEES.reduce((s, f) => s + f.collected, 0)
  const totalPending   = FEES.reduce((s, f) => s + f.pending, 0)
  const totalAmount    = totalCollected + totalPending

  const paidCount    = STUDENT_FEES.filter(r => r.status === 'Paid').length
  const partialCount = STUDENT_FEES.filter(r => r.status === 'Partial').length
  const pendingCount = STUDENT_FEES.filter(r => r.status === 'Pending').length

  const fmt = (n) => '₹' + (n >= 100000 ? (n/100000).toFixed(1) + 'L' : n.toLocaleString())

  return (
    <div>
      <PageHeader title="Fee Report" subtitle="Summary of fee collection across all categories" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { l:'Total Billed',    v: fmt(totalAmount),    c:'text-gray-900'     },
          { l:'Collected',       v: fmt(totalCollected), c:'text-green-600'    },
          { l:'Pending',         v: fmt(totalPending),   c:'text-orange-600'   },
          { l:'Collection %',    v: Math.round((totalCollected/totalAmount)*100)+'%', c:'text-primary-700' },
        ].map(i => (
          <div key={i.l} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${i.c}`} style={{fontFamily:'Outfit'}}>{i.v}</p>
            <p className="text-xs text-gray-500 mt-1">{i.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { l:'Fully Paid',  v: paidCount,    c:'text-green-600'  },
          { l:'Partial',     v: partialCount, c:'text-yellow-600' },
          { l:'Not Paid',    v: pendingCount, c:'text-red-600'    },
        ].map(i => (
          <div key={i.l} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${i.c}`} style={{fontFamily:'Outfit'}}>{i.v}</p>
            <p className="text-xs text-gray-500 mt-1">{i.l} students</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900" style={{fontFamily:'Outfit'}}>Fee-wise Collection Summary</p>
        </div>
        <Table headers={['Fee Name','Class','Amount','Collected','Pending','Collection %']} empty={FEES.length===0}>
          {FEES.map(f => {
            const total = f.collected + f.pending
            const pct = total ? Math.round((f.collected / total) * 100) : 0
            return (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{f.name}</td>
                <td className="table-td">{f.class_id}</td>
                <td className="table-td">₹{f.amount.toLocaleString()}</td>
                <td className="table-td text-green-600 font-medium">{fmt(f.collected)}</td>
                <td className="table-td text-orange-600 font-medium">{fmt(f.pending)}</td>
                <td className="table-td">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{width:`${pct}%`}} />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8">{pct}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </Table>
      </div>
    </div>
  )
}
