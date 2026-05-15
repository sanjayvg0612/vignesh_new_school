// All API calls go through Next.js proxy (/proxy/*) → backend (69.62.77.182:8005)
// This makes cookies work as same-origin — no CORS issues
const BASE_URL   = '/proxy'
const SCHOOL_ID  = 1
const CLIENT_KEY = 'c2c350fd-a8f1-4df7-8ea6-fc4b6d8096af'

export function getSchoolId() { return SCHOOL_ID }

function handleUnauthorized() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_user')
  window.location.href = '/login'
}

async function request(method, path, body = null) {
  const isFormData = body instanceof FormData
  const headers = { 'client_key': CLIENT_KEY }
  if (!isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  // Auto-logout on invalid/expired session
  if (res.status === 401 || res.status === 403) {
    handleUnauthorized()
    throw new Error('Session expired. Please login again.')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || data?.detail || `Request failed: ${res.status}`)
  return data
}

function qs(params = {}) {
  const q = new URLSearchParams()
  if (params.page)   q.set('page',   params.page)
  if (params.limit)  q.set('limit',  params.limit)
  if (params.search) q.set('search', params.search)
  return q.toString()
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  overview:              () => request('GET', '/api/dashboard/overview'),
  birthdays:             () => request('GET', '/api/dashboard/birthdays/today'),
  studentAttendanceToday: (params = {}) => {
    const q = new URLSearchParams()
    if (params.group_id)  q.set('group_id',  params.group_id)
    if (params.class_id)  q.set('class_id',  params.class_id)
    if (params.section_id)q.set('section_id',params.section_id)
    return request('GET', `/api/attendance/student/attendance/count/today?${q}`)
  },
  employeeAttendanceToday: (params = {}) => {
    const q = new URLSearchParams()
    if (params.group_id) q.set('group_id', params.group_id)
    return request('GET', `/api/attendance/employee/attendance/count/today?${q}`)
  },
}

// ── SCHOOL GROUP ─────────────────────────────────────────────────────────────

export const groupApi = {
  list:    (params = {}) => request('GET', `/api/school_group/grouplist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_group/get_id/${id}`),
  create:  (body)        => request('POST', '/api/school_group/create_group', body),
  update:  (id, body)    => request('PUT', `/api/school_group/update_group/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/school_group/delete_group/${id}`),
  dropdown:(params = {}) => request('GET', `/api/school_group/school-groups/all?${qs(params)}`),
}

// ── SCHOOL CLASS ──────────────────────────────────────────────────────────────

export const classApi = {
  list:    (params = {}) => request('GET', `/api/school_stream_class/classlist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_stream_class/get_id/${id}`),
  create:  (body)        => request('POST', '/api/school_stream_class/create_class', body),
  update:  (id, body)    => request('PUT', `/api/school_stream_class/update_class/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/school_stream_class/delete_class/${id}`),
  dropdown:(params = {}) => {
    const q = new URLSearchParams()
    if (params.school_group_id) q.set('school_group_id', params.school_group_id)
    if (params.search)          q.set('search',          params.search)
    return request('GET', `/api/school_stream_class/classes/all?${q}`)
  },
}

// ── SCHOOL SUBJECT ────────────────────────────────────────────────────────────

export const subjectApi = {
  list:    (params = {}) => request('GET', `/api/school_stream_subject/subjectlist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_stream_subject/get_id/${id}`),
  create:  (body) => {
    const fd = new FormData()
    Object.entries(body).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
    return request('POST', '/api/school_stream_subject/create_subject', fd)
  },
  update:  (id, body) => {
    const fd = new FormData()
    Object.entries(body).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
    return request('PUT', `/api/school_stream_subject/update_subject/${id}`, fd)
  },
  delete:  (id)          => request('DELETE', `/api/school_stream_subject/delete_subject/${id}`),
  dropdown:(params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.search)     q.set('search',     params.search)
    if (params.limit)      q.set('limit',      params.limit)
    return request('GET', `/api/school_stream_subject/subjects/all?${q}`)
  },
}

// ── SCHOOL SECTION ────────────────────────────────────────────────────────────

export const sectionApi = {
  list:    (params = {}) => request('GET', `/api/school_stream_section/sectionlist?${qs(params)}`),
  getById: (id)          => request('GET', `/api/school_stream_section/get_id/${id}`),
  create:  (body)        => request('POST', '/api/school_stream_section/create_section', body),
  update:  (id, body)    => request('PUT', `/api/school_stream_section/update_section/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/school_stream_section/delete_section/${id}`),
  dropdown:(params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)        q.set('class_id',        params.class_id)
    if (params.school_stream_id)q.set('school_stream_id',params.school_stream_id)
    if (params.search)          q.set('search',          params.search)
    return request('GET', `/api/school_stream_section/sections/all?${q}`)
  },
}

// ── ROLE ──────────────────────────────────────────────────────────────────────

export const roleApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)      q.set('page',      params.page)
    if (params.limit)     q.set('limit',     params.limit)
    if (params.search)    q.set('search',    params.search)
    if (params.is_active != null) q.set('is_active', params.is_active)
    return request('GET', `/api/employee/role/list?${q}`)
  },
  create:   (body)     => request('POST', '/api/employee/role/create', body),
  update:   (id, body) => request('PUT', `/api/employee/role/update/${id}`, body),
  dropdown: ()         => request('GET', '/api/employee/role/all'),
}

// ── EMPLOYEE ──────────────────────────────────────────────────────────────────

function qsEmployee(params = {}) {
  const q = new URLSearchParams()
  if (params.page)            q.set('page',            params.page)
  if (params.limit)           q.set('limit',           params.limit)
  if (params.search)          q.set('search',          params.search)
  if (params.role_id)         q.set('role_id',         params.role_id)
  if (params.school_group_id) q.set('school_group_id', params.school_group_id)
  return q.toString()
}

export const employeeApi = {
  list:     (params = {}) => request('GET', `/api/employee/employee/list?${qsEmployee(params)}`),
  getById:  (id)          => request('GET', `/api/employee/employee/get_id/${id}`),
  create:   (body)        => request('POST', '/api/employee/employee/create', body),
  update:   (id, body)    => request('PUT', `/api/employee/employee/update/${id}`, body),
  delete:   (id)          => request('DELETE', `/api/employee/employee/delete/${id}`),
  dropdown: (params = {}) => {
    // /employee/all only supports role_id and search (no page/limit)
    const q = new URLSearchParams()
    if (params.role_id) q.set('role_id', params.role_id)
    if (params.search)  q.set('search',  params.search)
    return request('GET', `/api/employee/employee/all?${q}`)
  },
  mappingList: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    if (params.emp_id)     q.set('emp_id',     params.emp_id)
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    return request('GET', `/api/employee/employee/mapping/list?${q}`)
  },
  mappingCreate: (body)     => request('POST', '/api/employee/employee/mapping/create', body),
  mappingUpdate: (id, body) => request('PUT', `/api/employee/employee/mapping/update/${id}`, body),
  mappingDelete: (id)       => request('DELETE', `/api/employee/employee/mapping/delete/${id}`),
  bulkUpload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE_URL}/api/employee/employee/bulk_upload`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
}

// ── CLASS TEACHER ─────────────────────────────────────────────────────────────

export const classTeacherApi = {
  create: (body) => request('POST', '/api/teacher/class_teacher/create', body),
}

// ── SUBJECT TEACHER ───────────────────────────────────────────────────────────

export const subjectTeacherApi = {
  create: (body) => request('POST', '/api/teacher/subject_teacher/create', body),
}

// ── CLASS SECTION TEACHERS ────────────────────────────────────────────────────

export const classSectionTeacherApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)       q.set('class_id',       params.class_id)
    if (params.section_id)     q.set('section_id',     params.section_id)
    if (params.school_group_id)q.set('school_group_id',params.school_group_id)
    if (params.search)         q.set('search',         params.search)
    if (params.page)           q.set('page',           params.page)
    if (params.limit)          q.set('limit',          params.limit)
    return request('GET', `/api/teacher/class_section_teacher/list?${q}`)
  },
  create: (body)     => request('POST', '/api/teacher/class_section_teacher/create', body),
  update: (id, body) => request('PUT', `/api/teacher/class_section_teacher/update/${id}`, body),
  delete: (id)       => request('DELETE', `/api/teacher/class_section_teacher/delete/${id}`),
}

// ── EXAM GRADE ────────────────────────────────────────────────────────────────

export const gradeApi = {
  list:       (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)     q.set('page',     params.page)
    if (params.limit)    q.set('limit',    params.limit)
    if (params.search)   q.set('search',   params.search)
    if (params.is_active != null) q.set('is_active', params.is_active)
    return request('GET', `/api/exam/grade/list?${q}`)
  },
  getById:    (id)     => request('GET', `/api/exam/grade/get_id/${id}`),
  create:     (body)   => request('POST', '/api/exam/grade/create', body),
  bulkCreate: (body)   => request('POST', '/api/exam/grade/bulk_create', body),
  delete:     (id)     => request('DELETE', `/api/exam/grade/delete/${id}`),
}

// ── EXAM ──────────────────────────────────────────────────────────────────────

export const examApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id) q.set('class_id', params.class_id)
    if (params.search)   q.set('search',   params.search)
    if (params.page)     q.set('page',     params.page)
    if (params.limit)    q.set('limit',    params.limit)
    return request('GET', `/api/exam/exam/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/exam/exam/get_id/${id}`),
  create:  (body)        => request('POST', '/api/exam/exam/create', body),
  update:  (id, body)    => request('PUT', `/api/exam/exam/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/exam/exam/delete/${id}`),
}

// ── EXAM TIMETABLE ────────────────────────────────────────────────────────────

export const examTimetableApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.exam_id)  q.set('exam_id',  params.exam_id)
    if (params.class_id) q.set('class_id', params.class_id)
    if (params.search)   q.set('search',   params.search)
    if (params.page)     q.set('page',     params.page)
    if (params.limit)    q.set('limit',    params.limit)
    return request('GET', `/api/exam/exam/timetable/list?${q}`)
  },
  create:  (body)        => request('POST', '/api/exam/exam/timetable/create', body),
  update:  (id, body)    => request('PUT', `/api/exam/exam/timetable/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/exam/exam/timetable/delete/${id}`),
}

// ── EXAM MARKS ────────────────────────────────────────────────────────────────

export const marksApi = {
  list:   (params = {}) => {
    const q = new URLSearchParams()
    if (params.student_id) q.set('student_id', params.student_id)
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    return request('GET', `/api/exam/marks/list?${q}`)
  },
  // body: { student_id, class_id, subjects: [{ subject_id, mark }] }
  create: (body) => request('POST', '/api/exam/marks/create', body),
}

// ── ONLINE EXAM ───────────────────────────────────────────────────────────────

export const onlineExamApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    if (params.search)     q.set('search',     params.search)
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    return request('GET', `/api/exam/online_exam/list?${q}`)
  },
  create:  (body)        => request('POST', '/api/exam/online_exam/create', body),
  update:  (id, body)    => request('PUT', `/api/exam/online_exam/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/exam/online_exam/delete/${id}`),
}

// ── ONLINE CLASS ──────────────────────────────────────────────────────────────

export const onlineClassApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    if (params.search)     q.set('search',     params.search)
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    return request('GET', `/api/exam/online_class/list?${q}`)
  },
  create:  (body)        => request('POST', '/api/exam/online_class/create', body),
  update:  (id, body)    => request('PUT', `/api/exam/online_class/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/exam/online_class/delete/${id}`),
}

// ── TIMETABLE ─────────────────────────────────────────────────────────────────
// TimeTableCreate: {class_id, section_id, school_id, school_group_id, subject_id,
//   start_time, start_ampm, end_time, end_ampm, duration(int),
//   school_table_name?, type?(W/D), day?(Mon/Tue…)}

export const timetableApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.school_id)      q.set('school_id',      params.school_id ?? SCHOOL_ID)
    if (params.class_id)       q.set('class_id',       params.class_id)
    if (params.section_id)     q.set('section_id',     params.section_id)
    if (params.school_group_id)q.set('school_group_id',params.school_group_id)
    if (params.subject_id)     q.set('subject_id',     params.subject_id)
    if (params.search)         q.set('search',         params.search)
    if (params.page)           q.set('page',           params.page)
    if (params.limit)          q.set('limit',          params.limit)
    return request('GET', `/api/timetable/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/timetable/get_id/${id}`),
  create:  (body)        => request('POST', '/api/timetable/create', body),
  update:  (id, body)    => request('PUT', `/api/timetable/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/timetable/delete/${id}`),
}

// ── ATTENDANCE ────────────────────────────────────────────────────────────────

export const employeeAttendanceApi = {
  list:   (params = {}) => {
    const q = new URLSearchParams()
    if (params.school_group_id) q.set('school_group_id', params.school_group_id)
    if (params.emp_id)          q.set('emp_id',          params.emp_id)
    if (params.attendance_dt)   q.set('attendance_dt',   params.attendance_dt)
    if (params.status)          q.set('status',          params.status)
    if (params.page)            q.set('page',            params.page)
    if (params.limit)           q.set('limit',           params.limit)
    return request('GET', `/api/attendance/employee/attendance/list?${q}`)
  },
  bulkCreate: (body)     => request('POST', '/api/attendance/employee/attendance/bulk', body),
  update:     (id, body) => request('PUT', `/api/attendance/employee/attendance/update/${id}`, body),
  delete:     (id)       => request('DELETE', `/api/attendance/employee/attendance/delete/${id}`),
}

export const studentAttendanceApi = {
  list:   (params = {}) => {
    const q = new URLSearchParams()
    if (params.school_group_id) q.set('school_group_id', params.school_group_id)
    if (params.class_id)        q.set('class_id',        params.class_id)
    if (params.section_id)      q.set('section_id',      params.section_id)
    if (params.student_id)      q.set('student_id',      params.student_id)
    if (params.attendance_dt)   q.set('attendance_dt',   params.attendance_dt)
    if (params.status)          q.set('status',          params.status)
    if (params.page)            q.set('page',            params.page)
    if (params.limit)           q.set('limit',           params.limit)
    return request('GET', `/api/attendance/student/attendance/list?${q}`)
  },
  bulkCreate: (body)     => request('POST', '/api/attendance/student/attendance/bulk', body),
  update:     (id, body) => request('PUT', `/api/attendance/student/attendance/update?student_id=${id}`, body),
  delete:     (id)       => request('DELETE', `/api/attendance/student/attendance/delete/${id}`),
}

// ── TRANSPORT VEHICLE ─────────────────────────────────────────────────────────

export const vehicleApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)   q.set('page',   params.page)
    if (params.limit)  q.set('limit',  params.limit)
    if (params.search) q.set('search', params.search)
    if (params.status) q.set('status', params.status)
    return request('GET', `/api/transport/vehicle/list?${q}`)
  },
  getById:  (id)         => request('GET', `/api/transport/vehicle/get/${id}`),
  create:   (body)       => request('POST', '/api/transport/vehicle/create', body),
  update:   (id, body)   => request('PUT', `/api/transport/vehicle/update/${id}`, body),
  delete:   (id)         => request('DELETE', `/api/transport/vehicle/delete/${id}`),
  dropdown: ()           => request('GET', '/api/transport/vehicle/all'),
}

// ── TRANSPORT ROUTE ───────────────────────────────────────────────────────────

export const routeApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)   q.set('page',   params.page)
    if (params.limit)  q.set('limit',  params.limit)
    if (params.search) q.set('search', params.search)
    if (params.status) q.set('status', params.status)
    return request('GET', `/api/transport/route/list?${q}`)
  },
  getById:  (id)         => request('GET', `/api/transport/route/get/${id}`),
  create:   (body)       => request('POST', '/api/transport/route/create', body),
  update:   (id, body)   => request('PUT', `/api/transport/route/update/${id}`, body),
  delete:   (id)         => request('DELETE', `/api/transport/route/delete/${id}`),
  dropdown: ()           => request('GET', '/api/transport/route/all'),
}

// ── TRANSPORT VEHICLE ROUTE MAP ───────────────────────────────────────────────

export const vehicleRouteMapApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    if (params.route_id)   q.set('route_id',   params.route_id)
    if (params.vehicle_id) q.set('vehicle_id', params.vehicle_id)
    return request('GET', `/api/transport/vehicle_route_map/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/transport/vehicle_route_map/get/${id}`),
  create:  (body)        => request('POST', '/api/transport/vehicle_route_map/create', body),
  update:  (id, body)    => request('PUT', `/api/transport/vehicle_route_map/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/transport/vehicle_route_map/delete/${id}`),
}

// ── TRANSPORT STUDENT ─────────────────────────────────────────────────────────

export const transportStudentApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    if (params.vehicle_id) q.set('vehicle_id', params.vehicle_id)
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.section_id) q.set('section_id', params.section_id)
    if (params.student_id) q.set('student_id', params.student_id)
    if (params.group_id)   q.set('group_id',   params.group_id)
    if (params.session_yr) q.set('session_yr', params.session_yr)
    return request('GET', `/api/transport/transportation_student/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/transport/transportation_student/get/${id}`),
  create:  (body)        => request('POST', '/api/transport/transportation_student/create', body),
  update:  (id, body)    => request('PUT', `/api/transport/transportation_student/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/transport/transportation_student/delete/${id}`),
}

// ── VEHICLE EXPENSE ───────────────────────────────────────────────────────────

async function multipartRequest(method, path, payload, imageFile = null) {
  const form = new FormData()
  form.append('payload', JSON.stringify(payload))
  if (imageFile) form.append('image', imageFile)
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'client_key': CLIENT_KEY },
    body: form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || `Request failed: ${res.status}`)
  return data
}

export const vehicleExpenseApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    if (params.vehicle_id) q.set('vehicle_id', params.vehicle_id)
    if (params.session_yr) q.set('session_yr', params.session_yr)
    return request('GET', `/api/transport/vehicle_expense/list?${q}`)
  },
  getById: (id)                    => request('GET', `/api/transport/vehicle_expense/get/${id}`),
  create:  (payload, imageFile)    => multipartRequest('POST', '/api/transport/vehicle_expense/create', payload, imageFile),
  update:  (id, payload, imageFile)=> multipartRequest('PUT', `/api/transport/vehicle_expense/update/${id}`, payload, imageFile),
  delete:  (id)                    => request('DELETE', `/api/transport/vehicle_expense/delete/${id}`),
}

// ── STUDENT INQUIRY ──────────────────────────────────────────────────────────

function qsInquiry(params = {}) {
  const q = new URLSearchParams()
  q.set('school_id', params.school_id ?? SCHOOL_ID)
  if (params.page)   q.set('page',   params.page)
  if (params.limit)  q.set('limit',  params.limit)
  if (params.search) q.set('search', params.search)
  return q.toString()
}

export const inquiryApi = {
  list:    (params = {}) => request('GET', `/api/student/inquiry/list?${qsInquiry(params)}`),
  getById: (id)          => request('GET', `/api/student/inquiry/get_id/${id}`),
  create:  (body)        => request('POST', '/api/student/inquiry/create', body),
  update:  (id, body)    => request('PUT', `/api/student/inquiry/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/student/inquiry/delete/${id}`),
}

// ── ANNOUNCEMENT ─────────────────────────────────────────────────────────────

export const announcementApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)   q.set('page',   params.page)
    if (params.limit)  q.set('limit',  params.limit)
    if (params.search) q.set('search', params.search)
    return request('GET', `/api/announcement/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/announcement/get/${id}`),
  create:  (payload, file) => {
    const form = new FormData()
    Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v) })
    if (file) form.append('file', file)
    return fetch(`${BASE_URL}/api/announcement/create`, { method: 'POST', headers: { 'client_key': CLIENT_KEY }, body: form }).then(r => r.json())
  },
  update:  (id, payload, file) => {
    const form = new FormData()
    Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v) })
    if (file) form.append('file', file)
    return fetch(`${BASE_URL}/api/announcement/update/${id}`, { method: 'PUT', headers: { 'client_key': CLIENT_KEY }, body: form }).then(r => r.json())
  },
  delete:  (id)          => request('DELETE', `/api/announcement/delete/${id}`),
  fileUrl: (id)          => `${BASE_URL}/api/announcement/file/${id}`,
}

// ── NOTIFICATION ──────────────────────────────────────────────────────────────

export const notificationApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)   q.set('page',   params.page)
    if (params.limit)  q.set('limit',  params.limit)
    if (params.search) q.set('search', params.search)
    return request('GET', `/api/notification/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/notification/get/${id}`),
  create:  (payload, image) => {
    const form = new FormData()
    Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v) })
    if (image) form.append('image', image)
    return fetch(`${BASE_URL}/api/notification/create`, { method: 'POST', headers: { 'client_key': CLIENT_KEY }, body: form }).then(r => r.json())
  },
  update:  (id, payload, image) => {
    const form = new FormData()
    Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v) })
    if (image) form.append('image', image)
    return fetch(`${BASE_URL}/api/notification/update/${id}`, { method: 'PUT', headers: { 'client_key': CLIENT_KEY }, body: form }).then(r => r.json())
  },
  delete:  (id)          => request('DELETE', `/api/notification/delete/${id}`),
  imageUrl:(id)          => `${BASE_URL}/api/notification/image/${id}`,
}

// ── HOLIDAY ───────────────────────────────────────────────────────────────────

export const holidayApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)   q.set('page',   params.page)
    if (params.limit)  q.set('limit',  params.limit)
    if (params.search) q.set('search', params.search)
    if (params.year)   q.set('year',   params.year)
    if (params.month)  q.set('month',  params.month)
    return request('GET', `/api/holiday/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/holiday/get/${id}`),
  create:  (body)        => request('POST', '/api/holiday/create', body),
  update:  (id, body)    => request('PUT', `/api/holiday/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/holiday/delete/${id}`),
}

// ── STUDENT DIARY ─────────────────────────────────────────────────────────────

export const diaryApi = {
  list:    (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    if (params.search)     q.set('search',     params.search)
    if (params.student_id) q.set('student_id', params.student_id)
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.section_id) q.set('section_id', params.section_id)
    if (params.subject_id) q.set('subject_id', params.subject_id)
    if (params.dairy_date) q.set('dairy_date', params.dairy_date)
    if (params.status)     q.set('status',     params.status)
    return request('GET', `/api/student_diary/list?${q}`)
  },
  getById: (id)          => request('GET', `/api/student_diary/get/${id}`),
  create:  (body)        => request('POST', '/api/student_diary/create', body),
  update:  (id, body)    => request('PUT', `/api/student_diary/update/${id}`, body),
  delete:  (id)          => request('DELETE', `/api/student_diary/delete/${id}`),
}

// ── STUDENT ───────────────────────────────────────────────────────────────────

function qsStudent(params = {}) {
  const q = new URLSearchParams()
  q.set('school_id', params.school_id ?? SCHOOL_ID)
  if (params.page)       q.set('page',       params.page)
  if (params.limit)      q.set('limit',      params.limit)
  if (params.search)     q.set('search',     params.search)
  if (params.class_id)   q.set('class_id',   params.class_id)
  if (params.section_id) q.set('section_id', params.section_id)
  return q.toString()
}

export const studentApi = {
  list:          (params = {}) => request('GET', `/api/student/student/list?${qsStudent(params)}`),
  getById:       (id)          => request('GET', `/api/student/student/get_id/${id}`),
  create:        (body)        => request('POST', '/api/student/student/create', body),
  update:        (id, body)    => request('PUT', `/api/student/student/update/${id}`, body),
  updateMapping: (id, body)    => request('PUT', `/api/student/student/mapping/update/${id}`, body),
  dropdown:      (params = {}) => request('GET', `/api/student/student/all?${qsStudent(params)}`),
  guardianList:  (params = {}) => {
    const q = new URLSearchParams()
    if (params.class_id)   q.set('class_id',   params.class_id)
    if (params.section_id) q.set('section_id',  params.section_id)
    if (params.page)       q.set('page',         params.page)
    if (params.limit)      q.set('limit',         params.limit)
    if (params.search)     q.set('search',         params.search)
    return request('GET', `/api/student/student/guardian/list?${q}`)
  },
  transfer: (student_id, section_id) =>
    request('POST', `/api/student/student/transfer?student_id=${student_id}&section_id=${section_id}`),
  promote: (from_class_id) =>
    request('POST', `/api/student/student/promote?from_class_id=${from_class_id}`),
  bulkUpload: (school_id, file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE_URL}/api/student/student/bulk_upload?school_id=${school_id}`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
}


// ── GALLERY ───────────────────────────────────────────────────────────────────

export const galleryApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    q.set('school_id', params.school_id ?? SCHOOL_ID)
    if (params.status != null) q.set('status', params.status)
    if (params.page)      q.set('page',      params.page)
    if (params.page_size) q.set('page_size', params.page_size)
    return request('GET', `/api/gallery/?${q}`)
  },
  getById: (id) => request('GET', `/api/gallery/${id}/`),
  create: (files, status) => {
    const form = new FormData()
    form.append('school_id', SCHOOL_ID)
    if (status != null) form.append('status', status)
    files.forEach(f => form.append('files', f))
    return fetch(`${BASE_URL}/api/gallery/`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
  update: (id, { status, file } = {}) => {
    const form = new FormData()
    if (status != null) form.append('status', status)
    if (file)           form.append('file', file)
    return fetch(`${BASE_URL}/api/gallery/${id}/`, {
      method: 'PUT',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
  delete: (id) => request('DELETE', `/api/gallery/${id}/`),
  imageUrl: (id) => `${BASE_URL}/api/gallery/${id}/image/`,
}

// ── BANNER (SLIDER) ───────────────────────────────────────────────────────────

export const bannerApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    q.set('school_id', params.school_id ?? SCHOOL_ID)
    if (params.status != null) q.set('status', params.status)
    if (params.page)      q.set('page',      params.page)
    if (params.page_size) q.set('page_size', params.page_size)
    return request('GET', `/api/banner/?${q}`)
  },
  getById: (id) => request('GET', `/api/banner/${id}/`),
  create: (files, status) => {
    const form = new FormData()
    form.append('school_id', SCHOOL_ID)
    if (status != null) form.append('status', status)
    files.forEach(f => form.append('files', f))
    return fetch(`${BASE_URL}/api/banner/`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
  update: (id, { status, file } = {}) => {
    const form = new FormData()
    if (status != null) form.append('status', status)
    if (file)           form.append('file', file)
    return fetch(`${BASE_URL}/api/banner/${id}/`, {
      method: 'PUT',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
  delete: (id) => request('DELETE', `/api/banner/${id}/`),
  imageUrl: (id) => `${BASE_URL}/api/banner/${id}/image/`,
}

// ── EMPLOYEE LEAVE REQUEST ────────────────────────────────────────────────────

export const empLeaveApi = {
  list: (params = {}) => {
    const q = new URLSearchParams()
    if (params.page)       q.set('page',       params.page)
    if (params.limit)      q.set('limit',      params.limit)
    if (params.search)     q.set('search',     params.search)
    if (params.emp_id)     q.set('emp_id',     params.emp_id)
    if (params.status)     q.set('status',     params.status)
    if (params.leave_type) q.set('leave_type', params.leave_type)
    if (params.from_dt)    q.set('from_dt',    params.from_dt)
    if (params.to_date)    q.set('to_date',    params.to_date)
    return request('GET', `/api/emp_leave/list?${q}`)
  },
  getById:    (id)          => request('GET', `/api/emp_leave/get/${id}`),
  create:     (payload, attachmentFile) => {
    const form = new FormData()
    form.append('payload', JSON.stringify(payload))
    if (attachmentFile) form.append('attachment', attachmentFile)
    return fetch(`${BASE_URL}/api/emp_leave/create`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
  update:     (id, payload, attachmentFile) => {
    const form = new FormData()
    form.append('payload', JSON.stringify(payload))
    if (attachmentFile) form.append('attachment', attachmentFile)
    return fetch(`${BASE_URL}/api/emp_leave/update/${id}`, {
      method: 'PUT',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
  delete:     (id)          => request('DELETE', `/api/emp_leave/delete/${id}`),
  approve:    (id)          => request('PATCH', `/api/emp_leave/approve/${id}`),
  reject:     (id)          => request('PATCH', `/api/emp_leave/reject/${id}`),
  attachmentUrl: (id)       => `${BASE_URL}/api/emp_leave/attachment/${id}`,
}

// ── UPLOAD ────────────────────────────────────────────────────────────────────

export const uploadApi = {
  image: (file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE_URL}/api/upload/`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
      body: form,
    }).then(r => r.json())
  },
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (mobile, password) => {
    const r = await fetch(`${BASE_URL}/api/auth/web/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'client_key': CLIENT_KEY },
      body: JSON.stringify({ mobile, password }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data?.detail || data?.message || `Login failed (${r.status})`)
    return data
  },

  profile: () =>
    fetch(`${BASE_URL}/api/auth/profile/`, {
      method: 'GET',
      headers: { 'client_key': CLIENT_KEY },
    }).then(r => r.json()),

  logout: () =>
    fetch(`${BASE_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: { 'client_key': CLIENT_KEY },
    }).then(r => r.json()).catch(() => ({})),
}
