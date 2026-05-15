'use client'
import { usePathname } from 'next/navigation'
import { Menu, ChevronDown } from 'lucide-react'

const LABELS = {
  '/admin/dashboard': ['Dashboard'],
  '/admin/admin-management/admins': ['Admin Management', 'Admins'],
  '/admin/admin-management/roles': ['Admin Management', 'Roles'],
  '/admin/students': ['Students'],
  '/admin/students/add': ['Students', 'Add Student'],
  '/admin/teachers': ['Teachers'],
  '/admin/teachers/add': ['Teachers', 'Add Teacher'],
  '/admin/staff': ['Staff Management'],
  '/admin/staff/add': ['Staff Management', 'Add Staff'],
  '/admin/attendance': ['Attendance'],
  '/admin/attendance/report': ['Attendance', 'Report'],
  '/admin/timetable': ['Timetable'],
  '/admin/exam-semester': ['Exam / Semester'],
  '/admin/exam-semester/offline': ['Exam / Semester', 'Offline Exam'],
  '/admin/exam-semester/online': ['Exam / Semester', 'Online Exam'],
  '/admin/exam-semester/timetable': ['Exam / Semester', 'Exam Timetable'],
  '/admin/exam-semester/grade': ['Exam / Semester', 'Grades'],
  '/admin/exam-semester/marks': ['Exam / Semester', 'Marks Entry'],
  '/admin/exam-semester/results': ['Exam / Semester', 'Results'],
  '/admin/fees': ['Fees'],
  '/admin/fees/student': ['Fees', 'Student Fee'],
  '/admin/fees/report': ['Fees', 'Fee Report'],
  '/admin/image-library/gallery': ['Image Library', 'Gallery'],
  '/admin/image-library/slider': ['Image Library', 'Slider'],
  '/admin/communication/notice': ['Communication', 'Notice'],
  '/admin/communication/event': ['Communication', 'Event'],
  '/admin/communication/notification': ['Communication', 'Notification'],
  '/admin/communication/announcement': ['Communication', 'Announcement'],
  '/admin/transport/vehicle': ['Transport', 'Vehicle'],
  '/admin/transport/route': ['Transport', 'Route'],
  '/admin/transport/map': ['Transport', 'Vehicle Route Map'],
  '/admin/transport/students': ['Transport', 'Transport Students'],
  '/admin/transport/expense': ['Transport', 'Vehicle Expense'],
  '/admin/system/contact': ['System', 'Contact Info'],
  '/admin/system/backup': ['System', 'Data Backup'],
}

export default function Header({ setMobileOpen }) {
  const pathname = usePathname()
  const crumbs = LABELS[pathname] || ['Dashboard']

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-gray-400">🏠</span>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-gray-300">/</span>
              <span className={i === crumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}>{c}</span>
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700">
          {(() => { const now = new Date(); const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; return `${y}–${y + 1}` })()}
          {/* <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> */}
        </div>
<div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer">A</div>
      </div>
    </header>
  )
}
