'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import {
  LayoutDashboard, Users, GraduationCap, Briefcase, ClipboardList,
  Calendar, BookOpen, DollarSign, Image, MessageSquare, Bus, Settings,
  ChevronDown, ChevronRight, LogOut, MapPin, FileText, Bell, Megaphone,
  Truck, Route, Receipt, LayoutGrid, UserCheck, Map, Wallet, BookMarked,
  Award, ClipboardCheck, BarChart2, Contact, Database, Layers,
  Users2, School, ImageIcon, LayoutList, Upload, ArrowRightLeft, TrendingUp, ClipboardEdit,
  UserPlus, List, HeartHandshake, Link2, ShieldCheck
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Admin Management', icon: UserCheck, children: [
    { label: 'Admin',   href: '/admin/admin-management/admins',   icon: UserCheck },
    { label: 'Group',   href: '/admin/admin-management/group',    icon: Users2 },
{ label: 'Class',   href: '/admin/admin-management/class',    icon: School },
    { label: 'Section', href: '/admin/admin-management/section',  icon: LayoutList },
    { label: 'Subject', href: '/admin/admin-management/subject',  icon: BookOpen },
  ]},
  { label: 'Students', icon: Users, children: [
    { label: 'Enquiry Student', href: '/admin/students/enquiry',     icon: ClipboardEdit },
    { label: 'Add Student',     href: '/admin/students/add',         icon: UserPlus },
    { label: 'All Students',    href: '/admin/students',             icon: Users },
    { label: 'Bulk Upload',     href: '/admin/students/bulk-upload', icon: Upload },
    { label: 'Guardian List',   href: '/admin/students/guardian',    icon: HeartHandshake },
    { label: 'Transfer Student',        href: '/admin/students/transfer',    icon: ArrowRightLeft },
    { label: 'Promote',         href: '/admin/students/promote',     icon: TrendingUp },
  ]},
  { label: 'Staff Management', icon: Briefcase, children: [
    { label: 'Roles',           href: '/admin/staff/roles',           icon: ShieldCheck },
    { label: 'Add Staff',       href: '/admin/staff/add',             icon: UserPlus },
    { label: 'Bulk Upload',     href: '/admin/staff/bulk-upload',     icon: Upload },
    { label: 'Employee Leave',  href: '/admin/staff/employee-leave',  icon: ClipboardList },
  ]},
  { label: 'Teachers', icon: GraduationCap, children: [
    { label: 'All Teachers',          href: '/admin/teachers',                  icon: GraduationCap },
    { label: 'Class Teacher',         href: '/admin/teachers/class-teacher',    icon: ClipboardCheck },
    { label: 'Subject Teacher',       href: '/admin/teachers/subject-teacher',  icon: BookOpen },
    { label: 'Class Section & Teacher View',  href: '/admin/teachers/section-class',    icon: LayoutList },
  ]},
  { label: 'Attendance', icon: ClipboardList, children: [
    { label: 'Student Attendance', href: '/admin/attendance/student', icon: Users },
    { label: 'Teacher Attendance', href: '/admin/attendance/teacher', icon: GraduationCap },
    { label: 'View Attendance',    href: '/admin/attendance/view',    icon: BarChart2 },
  ]},
  { label: 'Timetable', icon: Calendar, children: [
    { label: 'Timetable', href: '/admin/timetable', icon: Calendar },
  ]},
  { label: 'Exam / Semester', icon: BookOpen, children: [
    { label: 'Offline Exam',    href: '/admin/exam-semester/offline', icon: BookMarked },
    { label: 'Online Exam',     href: '/admin/exam-semester/online',  icon: LayoutGrid },
    { label: 'Exam Timetable',  href: '/admin/exam-semester/timetable', icon: Calendar },
    { label: 'Exam Grade',      href: '/admin/exam-semester/grade',   icon: Award },
    { label: 'Marks Entry',     href: '/admin/exam-semester/marks',   icon: ClipboardCheck },
    { label: 'Results',         href: '/admin/exam-semester/results', icon: BarChart2 },
  ]},
  { label: 'Fees', icon: DollarSign, children: [
    { label: 'Fee',         href: '/admin/fees',         icon: DollarSign },
    { label: 'Student Fee', href: '/admin/fees/student', icon: Receipt },
    { label: 'Fee Report',  href: '/admin/fees/report',  icon: FileText },
  ]},
  { label: 'Image Library', icon: Image, children: [
    { label: 'Slider',  href: '/admin/image-library/slider',  icon: LayoutGrid },
    { label: 'Gallery', href: '/admin/image-library/gallery', icon: Image },
  ]},
  { label: 'Announcement', icon: Megaphone, children: [
    { label: 'Announcements', href: '/admin/announcement', icon: Megaphone },
  ]},
  { label: 'Notification', icon: Bell, children: [
    { label: 'Notifications', href: '/admin/notification', icon: Bell },
  ]},
  { label: 'Transport', icon: Bus, children: [
    { label: 'Vehicle',           href: '/admin/transport/vehicle',  icon: Truck },
    { label: 'Route',             href: '/admin/transport/route',    icon: Route },
    { label: 'Vehicle Route Map', href: '/admin/transport/map',      icon: Map },
    { label: 'Transport Student', href: '/admin/transport/students', icon: Users },
    { label: 'Vehicle Expense',   href: '/admin/transport/expense',  icon: Wallet },
  ]},
  { label: 'Holiday', icon: Calendar, children: [
    { label: 'Holidays', href: '/admin/holiday', icon: Calendar },
  ]},
  { label: 'Student Diary', icon: BookOpen, children: [
    { label: 'Diary', href: '/admin/student-diary', icon: BookMarked },
  ]},
  { label: 'System', icon: Settings, children: [
    { label: 'Contact Info', href: '/admin/system/contact', icon: Contact },
    { label: 'Data Backup',  href: '/admin/system/backup',  icon: Database },
  ]},
]

function NavItem({ item, openLabel, setOpenLabel }) {
  const pathname = usePathname()
  const isActive = item.href && pathname === item.href
  const hasChildren = !!item.children?.length
  const isGroupActive = hasChildren && item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'))
  const open = openLabel === item.label
  const Icon = item.icon

  if (!hasChildren) {
    return (
      <Link href={item.href} className={clsx('sidebar-link', isActive && 'active', 'pl-9 text-sm')}>
        <Icon className="w-3.5 h-3.5 shrink-0" />{item.label}
      </Link>
    )
  }

  const toggle = () => setOpenLabel(open ? null : item.label)

  return (
    <div>
      <button onClick={toggle} className={clsx('sidebar-link justify-between', isGroupActive && 'text-primary-700')}>
        <span className="flex items-center gap-3"><Icon className="w-4 h-4 shrink-0" />{item.label}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5"/> : <ChevronRight className="w-3.5 h-3.5"/>}
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {item.children.map(c => <NavItem key={c.href} item={c} openLabel={openLabel} setOpenLabel={setOpenLabel} />)}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('auth_user')
    router.push('/login')
  }

  // Find which menu is active on initial load
  const initialOpen = NAV.find(item =>
    item.children?.some(c => pathname === c.href || pathname.startsWith(c.href + '/'))
  )?.label ?? null

  const [openLabel, setOpenLabel] = useState(initialOpen)

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 flex flex-col',
        'transform transition-transform duration-200 md:translate-x-0 md:static md:z-auto',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight" style={{fontFamily:'Outfit'}}>School CMS</p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map((item, i) => <NavItem key={item.href || item.label + i} item={item} openLabel={openLabel} setOpenLabel={setOpenLabel} />)}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@school.com</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-link text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
    </>
  )
}
