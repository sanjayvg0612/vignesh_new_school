'use client'
import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { EXAMS } from '@/lib/mockData'
import { PageHeader, Table, Modal, FormField, StatusBadge } from '@/components/ui'

export default function ExamPage() {
  const [data, setData] = useState(EXAMS)
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', class_id:'', subject:'', date:'', total_marks:'', duration_minutes:'', type:'Offline' })

  const openAdd = () => { setEditing(null); setForm({ name:'',class_id:'',subject:'',date:'',total_marks:'',duration_minutes:'',type:'Offline' }); setModal(true) }
  const openEdit = (ex) => { setEditing(ex); setForm({ name:ex.name,class_id:ex.class_id,subject:ex.subject,date:ex.date,total_marks:ex.total_marks,duration_minutes:ex.duration_minutes,type:ex.type }); setModal(true) }
  const handleSave = () => {
    if (!form.name) return
    if (editing) setData(p => p.map(e => e.id===editing.id ? {...e,...form} : e))
    else setData(p => [...p, {...form, id: Date.now()}])
    setModal(false)
  }

  return (
    <div>
      <PageHeader title="Exam / Semester" subtitle="Manage exams, marks and results"
        action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Exam</button>}
      />
      <div className="card">
        <Table headers={['Exam Name','Class','Subject','Date','Marks','Duration','Type','Actions']} empty={data.length===0}>
          {data.map(ex => (
            <tr key={ex.id} className="hover:bg-gray-50">
              <td className="table-td font-medium">{ex.name}</td>
              <td className="table-td">{ex.class_id}</td>
              <td className="table-td">{ex.subject}</td>
              <td className="table-td">{ex.date}</td>
              <td className="table-td">{ex.total_marks}</td>
              <td className="table-td">{ex.duration_minutes} min</td>
              <td className="table-td"><StatusBadge status={ex.type} /></td>
              <td className="table-td"><button onClick={()=>openEdit(ex)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Pencil className="w-3.5 h-3.5"/></button></td>
            </tr>
          ))}
        </Table>
      </div>
      <Modal open={modalOpen} onClose={()=>setModal(false)} title={editing?'Edit Exam':'Add Exam'}
        footer={<><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></>}>
        <div className="space-y-4">
          <FormField label="Exam Name" required><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></FormField>
          <FormField label="Class" required><input className="input" value={form.class_id} onChange={e=>setForm({...form,class_id:e.target.value})} placeholder="Class 10-A" /></FormField>
          <FormField label="Subject" required><input className="input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} /></FormField>
          <FormField label="Date"><input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Total Marks"><input className="input" type="number" value={form.total_marks} onChange={e=>setForm({...form,total_marks:e.target.value})} /></FormField>
            <FormField label="Duration (min)"><input className="input" type="number" value={form.duration_minutes} onChange={e=>setForm({...form,duration_minutes:e.target.value})} /></FormField>
          </div>
          <FormField label="Type">
            <select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Offline</option><option>Online</option></select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
