'use client'
import { useEffect, useState, useCallback } from 'react'
import { Users, GraduationCap, School, Bus, ArrowRight, Cake, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from 'recharts'
import { dashboardApi, groupApi } from '@/lib/api'
import { StatCard } from '@/components/ui'

const QUICK_ACTIONS = [
  { title: 'Manage Students', desc: 'Add, edit, or remove student records',        href: '/admin/students',       icon: Users,         color: 'purple' },
  { title: 'Manage Classes',  desc: 'Create and manage class schedules',            href: '/admin/timetable',      icon: School,        color: 'green'  },
  { title: 'System Settings', desc: 'Configure school policies and settings',       href: '/admin/system/contact', icon: GraduationCap, color: 'blue'   },
]

const BAR_COLORS = {
  present: '#3b82f6',
  absent:  '#ef4444',
  late:    '#f59e0b',
  leave:   '#6366f1',
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.fill }} className="text-xs">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// Convert API count response to bar chart data
function parseCountResponse(res) {
  const raw = res?.result || res || {}
  // Could be { present: 10, absent: 3, ... } or { data: [...] }
  if (typeof raw.present === 'number' || typeof raw.absent === 'number') {
    // Flat object — single bar group "Today"
    return [{
      label:   'Today',
      Present: raw.present || raw.Present || 0,
      Absent:  raw.absent  || raw.Absent  || 0,
      ...(raw.late  ? { Late:  raw.late  } : {}),
      ...(raw.leave ? { Leave: raw.leave } : {}),
    }]
  }
  if (Array.isArray(raw)) {
    return raw.map(r => ({
      label:   r.class_code || r.class_name || r.section_code || r.name || 'Unknown',
      Present: r.present || r.Present || 0,
      Absent:  r.absent  || r.Absent  || 0,
      ...(r.late  ? { Late:  r.late  } : {}),
      ...(r.leave ? { Leave: r.leave } : {}),
    }))
  }
  if (Array.isArray(raw.data)) {
    return raw.data.map(r => ({
      label:   r.class_code || r.class_name || r.section_code || r.name || 'Unknown',
      Present: r.present || r.Present || 0,
      Absent:  r.absent  || r.Absent  || 0,
      ...(r.late  ? { Late:  r.late  } : {}),
      ...(r.leave ? { Leave: r.leave } : {}),
    }))
  }
  return []
}

export default function DashboardPage() {
  const [overview, setOverview]   = useState(null)
  const [birthdays, setBirthdays] = useState([])
  const [loading, setLoading]     = useState(true)

  const [activeTab, setActiveTab]           = useState('student')
  const [studentData, setStudentData]       = useState(null)
  const [teacherData, setTeacherData]       = useState(null)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [groups, setGroups]                 = useState([])
  const [selectedGroup, setSelectedGroup]   = useState('')

  useEffect(() => {
    Promise.all([
      dashboardApi.overview().catch(() => null),
      dashboardApi.birthdays().catch(() => null),
    ]).then(([ov, bd]) => {
      if (ov) {
        const result = ov.result || {}
        setOverview({ ...(result.stats || {}), ...(result.summary || {}) })
      }
      if (bd) {
        const raw = bd.result || bd
        setBirthdays(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
      }
    }).finally(() => setLoading(false))

    groupApi.dropdown().then(r => {
      const raw = r.result
      setGroups(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
    }).catch(() => setGroups([]))
  }, [])

  const loadTab = useCallback(async (tab, groupId) => {
    setAttendanceLoading(true)
    try {
      const params = groupId ? { school_group_id: groupId } : {}
      if (tab === 'student') {
        const res = await dashboardApi.studentAttendanceToday(params)
        setStudentData(parseCountResponse(res))
      } else {
        const res = await dashboardApi.employeeAttendanceToday(params)
        setTeacherData(parseCountResponse(res))
      }
    } catch {
      if (tab === 'student') setStudentData([])
      else setTeacherData([])
    } finally {
      setAttendanceLoading(false)
    }
  }, [])

  // Load student tab on mount
  useEffect(() => { loadTab('student', '') }, [loadTab])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'student') loadTab('student', selectedGroup)
    if (tab === 'teacher') loadTab('teacher', selectedGroup)
  }

  const handleGroupChange = (id) => {
    setSelectedGroup(id)
    setStudentData(null)
    setTeacherData(null)
    loadTab(activeTab, id)
  }

  const stat = (key, fallback = 0) => {
    if (!overview) return loading ? '—' : fallback
    return (overview[key] ?? fallback).toLocaleString()
  }

  const chartData  = activeTab === 'student' ? (studentData || []) : (teacherData || [])
  const hasLate    = chartData.some(d => d.Late  !== undefined)
  const hasLeave   = chartData.some(d => d.Leave !== undefined)
  const allVals    = chartData.flatMap(d => [d.Present, d.Absent, d.Late, d.Leave].filter(v => v != null && v > 0))
  const maxVal     = allVals.length ? Math.ceil(Math.max(...allVals) / 10) * 10 + 10 : 10

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="page-sub">Welcome back! Here&apos;s what&apos;s happening at your school today.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Students" value={stat('total_students')} subtitle={`${stat('active_students')} active`}  icon={Users}         color="purple" />
        <StatCard title="Total Teachers" value={stat('total_teachers')} subtitle={`${stat('active_teachers')} active`}  icon={GraduationCap} color="blue"   />
        <StatCard title="Total Classes"  value={stat('total_classes')}  subtitle={`${stat('active_classes')} active`}   icon={School}        color="green"  />
        <StatCard title="Total Buses"    value={stat('total_buses')}    subtitle={`${stat('active_buses')} active`}     icon={Bus}           color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Attendance Bar Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'Outfit' }}>Attendance</h2>
            {/* Tabs — centered */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
                {[
                  { key: 'student', label: 'Student' },
                  { key: 'teacher', label: 'Teacher' },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => handleTabChange(t.key)}
                    className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === t.key
                        ? 'bg-white text-primary-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Group filter — right */}
            <select
              className="input w-32 text-sm py-1.5"
              value={selectedGroup}
              onChange={e => handleGroupChange(e.target.value)}
            >
              <option value="">All Groups</option>
              {groups.map(g => <option key={g.school_group_id} value={g.school_group_id}>{g.name}</option>)}
            </select>
          </div>

          {attendanceLoading ? (
            <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Loading...</div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-gray-400 text-sm">No attendance records found</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, maxVal]}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="Present" fill={BAR_COLORS.present} radius={[4, 4, 0, 0]} maxBarSize={48}>
                    <LabelList dataKey="Present" position="top" style={{ fontSize: 11, fontWeight: 600, fill: BAR_COLORS.present }} />
                  </Bar>
                  <Bar dataKey="Absent" fill={BAR_COLORS.absent} radius={[4, 4, 0, 0]} maxBarSize={48}>
                    <LabelList dataKey="Absent" position="top" style={{ fontSize: 11, fontWeight: 600, fill: BAR_COLORS.absent }} />
                  </Bar>
                  {hasLate && (
                    <Bar dataKey="Late" fill={BAR_COLORS.late} radius={[4, 4, 0, 0]} maxBarSize={48}>
                      <LabelList dataKey="Late" position="top" style={{ fontSize: 11, fontWeight: 600, fill: BAR_COLORS.late }} />
                    </Bar>
                  )}
                  {hasLeave && (
                    <Bar dataKey="Leave" fill={BAR_COLORS.leave} radius={[4, 4, 0, 0]} maxBarSize={48}>
                      <LabelList dataKey="Leave" position="top" style={{ fontSize: 11, fontWeight: 600, fill: BAR_COLORS.leave }} />
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex items-center gap-5 justify-center mt-3 flex-wrap">
                {[
                  { label: 'Present', color: BAR_COLORS.present },
                  { label: 'Absent',  color: BAR_COLORS.absent  },
                  ...(hasLate  ? [{ label: 'Late',  color: BAR_COLORS.late  }] : []),
                  ...(hasLeave ? [{ label: 'Leave', color: BAR_COLORS.leave }] : []),
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: l.color }} />
                    <span className="text-xs text-gray-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Today's Birthdays */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cake className="w-4 h-4 text-pink-500" />
            <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'Outfit' }}>Today&apos;s Birthdays</h2>
            {birthdays.length > 0 && (
              <span className="ml-auto text-xs bg-pink-100 text-pink-600 font-semibold px-2 py-0.5 rounded-full">{birthdays.length}</span>
            )}
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
          ) : birthdays.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No birthdays today</p>
          ) : (
            <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {birthdays.map((b, i) => (
                <li key={b.student_id ?? i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-pink-50 border border-transparent hover:border-pink-100 transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-pink-600">
                      {(b.first_name || b.student_name || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Name */}
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {[b.first_name, b.last_name].filter(Boolean).join(' ') || b.student_name || `Student #${b.student_id}`}
                    </p>
                    {/* Class + Age */}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {b.class_code && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">Class {b.class_code}</span>
                      )}
                      {b.age && (
                        <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded font-medium">{b.age} yrs</span>
                      )}
                      {b.gender && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">{b.gender}</span>
                      )}
                    </div>
                    {/* DOB + Phone */}
                    <div className="flex items-center gap-3 mt-1">
                      {b.dob && (
                        <p className="text-xs text-gray-400">🎂 {new Date(b.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      )}
                      {b.phone && (
                        <p className="text-xs text-gray-400">📞 {b.phone}</p>
                      )}
                    </div>
                  </div>
                  <Cake className="w-4 h-4 text-pink-400 shrink-0 mt-1" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* School Summary */}
      <div className="card p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-gray-900" style={{ fontFamily: 'Outfit' }}>School Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          {[
            { l: 'Total Streams',    v: stat('total_streams')    },
            { l: 'Male Students',    v: stat('male_students')    },
            { l: 'Female Students',  v: stat('female_students')  },
            { l: 'Exams This Month', v: stat('exams_this_month') },
            { l: 'Notices Posted',   v: stat('notices_posted')   },
            { l: 'Active Teachers',  v: stat('active_teachers')  },
          ].map(i => (
            <div key={i.l} className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-primary-700" style={{ fontFamily: 'Outfit' }}>{i.v}</p>
              <p className="text-xs text-gray-500 mt-1">{i.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Outfit' }}>Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon
          return (
            <div key={action.href} className="card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${action.color === 'purple' ? 'primary' : action.color}-50`}>
                  <Icon className={`w-5 h-5 text-${action.color === 'purple' ? 'primary' : action.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Outfit' }}>{action.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{action.desc}</p>
              <Link href={action.href} className="btn-secondary flex items-center justify-center gap-2 mt-auto">
                Go to {action.title.split(' ')[1]} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
