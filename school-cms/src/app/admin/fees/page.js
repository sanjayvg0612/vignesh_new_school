'use client'
import { useState } from 'react'
import { Plus, Pencil, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { FEES } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField, StatCard } from '@/components/ui'

export default function FeesPage() {
  const [data, setData] = useState(FEES)
  const [modalOpen, setModal] = useState(false)
  const [form, setForm] = useState({ name:'', amount:'', class_id:'', due_date:'', description:'' })
  const [errors, setErrors] = useState({})

  const totalCollected = data.reduce((s,f) => s + f.collected, 0)
  const totalPending   = data.reduce((s,f) => s + f.pending, 0)

  const closeModal = () => { setModal(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Fee name is required'
    if (!form.amount) e.amount = 'Amount is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setData(p => [...p, { ...form, id: Date.now(), amount: Number(form.amount), collected: 0, pending: Number(form.amount) }])
    setModal(false)
  }

  const fmt = (n) => '₹' + (n >= 100000 ? (n/100000).toFixed(1) + 'L' : n.toLocaleString())

  return (
    <div>
      <PageHeader title="Fees" subtitle="Manage school fees and payments"
        action={<button onClick={() => { setForm({ name:'',amount:'',class_id:'',due_date:'',description:'' }); setErrors({}); setModal(true) }} className="btn-primary"><Plus className="w-4 h-4" /> Add Fee</button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Fee Types"       value={data.length}           subtitle="Configured"       icon={DollarSign} color="purple" />
        <StatCard title="Total Collected" value={fmt(totalCollected)}   subtitle="Received"         icon={TrendingUp}  color="green"  />
        <StatCard title="Total Pending"   value={fmt(totalPending)}     subtitle="Outstanding"      icon={Clock}       color="orange" />
      </div>
      <div className="card">
        <Table headers={['Fee Name','Amount','Class','Due Date','Collected','Pending','Actions']} empty={data.length===0}>
          {data.map(f => (
            <tr key={f.id} className="hover:bg-gray-50">
              <td className="table-td font-medium">{f.name}</td>
              <td className="table-td">₹{f.amount.toLocaleString()}</td>
              <td className="table-td">{f.class_id}</td>
              <td className="table-td">{f.due_date || '—'}</td>
              <td className="table-td text-green-600 font-medium">{fmt(f.collected)}</td>
              <td className="table-td text-orange-600 font-medium">{fmt(f.pending)}</td>
              <td className="table-td"><button className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5"/></button></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={closeModal} title="Add Fee"
        footer={<><button onClick={closeModal} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Fee Name" required>
            <input className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`} value={form.name} onChange={e => { setForm({...form,name:e.target.value}); if(errors.name) setErrors(p=>({...p,name:''})) }} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </FormField>
          <FormField label="Amount (₹)" required>
            <input className={`input ${errors.amount ? 'border-red-400 focus:ring-red-400' : ''}`} type="number" value={form.amount} onChange={e => { setForm({...form,amount:e.target.value}); if(errors.amount) setErrors(p=>({...p,amount:''})) }} />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </FormField>
          <FormField label="Class"><input className="input" placeholder="Leave blank for all" value={form.class_id} onChange={e=>setForm({...form,class_id:e.target.value})} /></FormField>
          <FormField label="Due Date"><input className="input" type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} /></FormField>
          <FormField label="Description"><textarea className="input" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></FormField>
        </div>
      </Modal>
    </div>
  )
}
