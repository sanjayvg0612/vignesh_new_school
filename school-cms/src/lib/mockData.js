// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export const STATS = {
  total_students: 1234,
  total_teachers: 56,
  total_classes: 24,
  total_buses: 8,
  student_trend: '+12%',
  teacher_trend: '+5%',
  class_trend: '+2',
  bus_trend: '0%',
}

// ─── Students ────────────────────────────────────────────────────────────────
export const STUDENTS = [
  { id: 1, name: 'Arjun Sharma',    email: 'arjun@school.com',   phone: '9876543210', class_name: 'Class 10-A', roll_no: '1001', status: 'Active',   gender: 'Male',   dob: '2009-03-15', address: 'Chennai' },
  { id: 2, name: 'Priya Nair',      email: 'priya@school.com',   phone: '9876543211', class_name: 'Class 9-B',  roll_no: '1002', status: 'Active',   gender: 'Female', dob: '2010-07-22', address: 'Chennai' },
  { id: 3, name: 'Rahul Verma',     email: 'rahul@school.com',   phone: '9876543212', class_name: 'Class 8-C',  roll_no: '1003', status: 'Inactive', gender: 'Male',   dob: '2011-01-08', address: 'Coimbatore' },
  { id: 4, name: 'Divya Krishnan',  email: 'divya@school.com',   phone: '9876543213', class_name: 'Class 11-A', roll_no: '1004', status: 'Active',   gender: 'Female', dob: '2008-11-30', address: 'Chennai' },
  { id: 5, name: 'Kiran Patel',     email: 'kiran@school.com',   phone: '9876543214', class_name: 'Class 12-B', roll_no: '1005', status: 'Transfer', gender: 'Male',   dob: '2007-05-19', address: 'Madurai' },
  { id: 6, name: 'Sneha Iyer',      email: 'sneha@school.com',   phone: '9876543215', class_name: 'Class 7-A',  roll_no: '1006', status: 'Active',   gender: 'Female', dob: '2012-09-14', address: 'Trichy' },
  { id: 7, name: 'Vikram Rajan',    email: 'vikram@school.com',  phone: '9876543216', class_name: 'Class 6-B',  roll_no: '1007', status: 'Active',   gender: 'Male',   dob: '2013-02-27', address: 'Chennai' },
  { id: 8, name: 'Meena Bose',      email: 'meena@school.com',   phone: '9876543217', class_name: 'Class 10-C', roll_no: '1008', status: 'Active',   gender: 'Female', dob: '2009-06-03', address: 'Salem' },
  { id: 9, name: 'Arun Kumar',      email: 'arun@school.com',    phone: '9876543218', class_name: 'Class 9-A',  roll_no: '1009', status: 'Active',   gender: 'Male',   dob: '2010-12-17', address: 'Chennai' },
  { id: 10, name: 'Lakshmi Devi',   email: 'lakshmi@school.com', phone: '9876543219', class_name: 'Class 11-B', roll_no: '1010', status: 'Active',   gender: 'Female', dob: '2008-08-25', address: 'Chennai' },
]

// ─── Teachers ────────────────────────────────────────────────────────────────
export const TEACHERS = [
  { id: 1, name: 'Ms. Lakshmi Rajan',  email: 'l.rajan@school.com',  phone: '9811111111', subject: 'Mathematics', qualification: 'M.Sc. Maths',   experience: '10 yrs', status: 'Active' },
  { id: 2, name: 'Mr. Suresh Kumar',   email: 's.kumar@school.com',  phone: '9811111112', subject: 'Physics',      qualification: 'M.Sc. Physics', experience: '8 yrs',  status: 'Active' },
  { id: 3, name: 'Ms. Anitha Bose',    email: 'a.bose@school.com',   phone: '9811111113', subject: 'English',      qualification: 'M.A. English',  experience: '12 yrs', status: 'Active' },
  { id: 4, name: 'Mr. Rajesh Menon',   email: 'r.menon@school.com',  phone: '9811111114', subject: 'Chemistry',    qualification: 'M.Sc. Chem',    experience: '6 yrs',  status: 'Active' },
  { id: 5, name: 'Ms. Kavitha Pillai', email: 'k.pillai@school.com', phone: '9811111115', subject: 'Biology',      qualification: 'M.Sc. Bio',     experience: '9 yrs',  status: 'Leave'  },
  { id: 6, name: 'Mr. Dinesh Nair',    email: 'd.nair@school.com',   phone: '9811111116', subject: 'History',      qualification: 'M.A. History',  experience: '15 yrs', status: 'Active' },
  { id: 7, name: 'Ms. Preethi Rao',    email: 'p.rao@school.com',    phone: '9811111117', subject: 'Geography',    qualification: 'M.A. Geo',      experience: '5 yrs',  status: 'Active' },
]

// ─── Staff ───────────────────────────────────────────────────────────────────
export const STAFF = [
  { id: 1, name: 'Raj Mohan',     email: 'raj@school.com',    phone: '9822222221', role: 'Accountant',  department: 'Finance',       status: 'Active' },
  { id: 2, name: 'Mani Iyer',     email: 'mani@school.com',   phone: '9822222222', role: 'Librarian',   department: 'Library',       status: 'Active' },
  { id: 3, name: 'Geetha Devi',   email: 'geetha@school.com', phone: '9822222223', role: 'Receptionist',department: 'Administration',status: 'Active' },
  { id: 4, name: 'Senthil Kumar', email: 'senthil@school.com',phone: '9822222224', role: 'Peon',        department: 'General',       status: 'Active' },
  { id: 5, name: 'Kamala Bai',    email: 'kamala@school.com', phone: '9822222225', role: 'Nurse',       department: 'Medical',       status: 'Active' },
]

// ─── Attendance ──────────────────────────────────────────────────────────────
export const ATTENDANCE = [
  { id: 1, student_name: 'Arjun Sharma',   roll_no: '1001', class_name: 'Class 10-A', status: 'Present' },
  { id: 2, student_name: 'Priya Nair',     roll_no: '1002', class_name: 'Class 10-A', status: 'Present' },
  { id: 3, student_name: 'Rahul Verma',    roll_no: '1003', class_name: 'Class 10-A', status: 'Absent'  },
  { id: 4, student_name: 'Divya Krishnan', roll_no: '1004', class_name: 'Class 10-A', status: 'Present' },
  { id: 5, student_name: 'Kiran Patel',    roll_no: '1005', class_name: 'Class 10-A', status: 'Late'    },
  { id: 6, student_name: 'Sneha Iyer',     roll_no: '1006', class_name: 'Class 10-A', status: 'Present' },
  { id: 7, student_name: 'Vikram Rajan',   roll_no: '1007', class_name: 'Class 10-A', status: 'Absent'  },
]

// ─── Timetable ───────────────────────────────────────────────────────────────
export const TIMETABLE = [
  { id: 1, class_id: 'Class 10-A', subject: 'Mathematics', teacher: 'Ms. Lakshmi Rajan',  day: 'Monday',    start_time: '09:00', end_time: '10:00' },
  { id: 2, class_id: 'Class 10-A', subject: 'Physics',     teacher: 'Mr. Suresh Kumar',   day: 'Monday',    start_time: '10:00', end_time: '11:00' },
  { id: 3, class_id: 'Class 10-A', subject: 'English',     teacher: 'Ms. Anitha Bose',    day: 'Tuesday',   start_time: '09:00', end_time: '10:00' },
  { id: 4, class_id: 'Class 9-B',  subject: 'Chemistry',   teacher: 'Mr. Rajesh Menon',   day: 'Wednesday', start_time: '11:00', end_time: '12:00' },
  { id: 5, class_id: 'Class 9-B',  subject: 'Biology',     teacher: 'Ms. Kavitha Pillai', day: 'Thursday',  start_time: '09:00', end_time: '10:00' },
  { id: 6, class_id: 'Class 11-A', subject: 'History',     teacher: 'Mr. Dinesh Nair',    day: 'Friday',    start_time: '10:00', end_time: '11:00' },
]

// ─── Exams ───────────────────────────────────────────────────────────────────
export const EXAMS = [
  { id: 1, name: 'Mid-Term Exam',    class_id: 'Class 10-A', subject: 'Mathematics', date: '2025-09-15', total_marks: 100, duration_minutes: 180, type: 'Offline' },
  { id: 2, name: 'Unit Test 1',      class_id: 'Class 9-B',  subject: 'Physics',     date: '2025-09-20', total_marks: 50,  duration_minutes: 90,  type: 'Offline' },
  { id: 3, name: 'Online Quiz 1',    class_id: 'Class 11-A', subject: 'Chemistry',   date: '2025-09-25', total_marks: 30,  duration_minutes: 45,  type: 'Online'  },
  { id: 4, name: 'Final Exam',       class_id: 'Class 12-B', subject: 'Biology',     date: '2025-11-10', total_marks: 100, duration_minutes: 180, type: 'Offline' },
  { id: 5, name: 'Term-End Test',    class_id: 'Class 8-C',  subject: 'English',     date: '2025-10-05', total_marks: 80,  duration_minutes: 120, type: 'Offline' },
]

// ─── Fees ────────────────────────────────────────────────────────────────────
export const FEES = [
  { id: 1, name: 'Tuition Fee',      amount: 12000, class_id: 'All',       due_date: '2025-07-10', collected: 1100000, pending: 88000  },
  { id: 2, name: 'Transport Fee',    amount: 3000,  class_id: 'All',       due_date: '2025-07-10', collected: 270000,  pending: 6000   },
  { id: 3, name: 'Lab Fee',          amount: 1500,  class_id: 'Class 11+', due_date: '2025-08-01', collected: 60000,   pending: 15000  },
  { id: 4, name: 'Sports Fee',       amount: 500,   class_id: 'All',       due_date: '2025-07-15', collected: 50000,   pending: 5000   },
  { id: 5, name: 'Library Fee',      amount: 300,   class_id: 'All',       due_date: '2025-07-15', collected: 30000,   pending: 3000   },
]

// ─── Notices ─────────────────────────────────────────────────────────────────
export const NOTICES = [
  { id: 1, title: 'School reopens after summer break',       target: 'All',      date: '2025-06-01', content: 'School will reopen on June 10th. All students must report by 8:30 AM.' },
  { id: 2, title: 'Parent-Teacher Meeting scheduled',        target: 'Parents',  date: '2025-06-15', content: 'PTM is scheduled on June 22nd from 10 AM to 1 PM.' },
  { id: 3, title: 'Annual Sports Day registration open',     target: 'Students', date: '2025-07-01', content: 'Register for sports events before July 15th.' },
  { id: 4, title: 'New library books arrived',               target: 'All',      date: '2025-07-05', content: 'Over 200 new books added to the library. Borrowing starts Monday.' },
  { id: 5, title: 'Mid-term exam schedule released',         target: 'Students', date: '2025-08-01', content: 'Check the exam timetable on the notice board.' },
]

// ─── Events ──────────────────────────────────────────────────────────────────
export const EVENTS = [
  { id: 1, title: 'Annual Day Celebration', date: '2025-12-20', venue: 'School Auditorium', organizer: 'Admin',      status: 'Upcoming' },
  { id: 2, title: 'Science Exhibition',     date: '2025-10-15', venue: 'School Grounds',    organizer: 'Science Dept',status: 'Upcoming' },
  { id: 3, title: 'Sports Day',             date: '2025-09-05', venue: 'Sports Ground',     organizer: 'Sports Dept', status: 'Completed'},
  { id: 4, title: 'Cultural Fest',          date: '2025-11-10', venue: 'School Hall',        organizer: 'Admin',       status: 'Upcoming' },
]

// ─── Vehicles ────────────────────────────────────────────────────────────────
export const VEHICLES = [
  { id: 1, vehicle_no: 'TN 01 AB 1234', model: 'Tata Winger',  capacity: 20, driver_name: 'Murugan S',   driver_phone: '9900001111', status: 'Active'      },
  { id: 2, vehicle_no: 'TN 01 CD 5678', model: 'Force Tempo',  capacity: 15, driver_name: 'Ravi K',      driver_phone: '9900002222', status: 'Active'      },
  { id: 3, vehicle_no: 'TN 01 EF 9012', model: 'Ashok Leyland',capacity: 40, driver_name: 'Selvam P',    driver_phone: '9900003333', status: 'Maintenance' },
  { id: 4, vehicle_no: 'TN 01 GH 3456', model: 'Tata Ace',     capacity: 10, driver_name: 'Kannan R',    driver_phone: '9900004444', status: 'Active'      },
  { id: 5, vehicle_no: 'TN 01 IJ 7890', model: 'Maruti Van',   capacity: 8,  driver_name: 'Vignesh M',   driver_phone: '9900005555', status: 'Active'      },
]

// ─── Routes ──────────────────────────────────────────────────────────────────
export const ROUTES = [
  { id: 1, route_name: 'Route A - North', vehicle_no: 'TN 01 AB 1234', stops: 'Anna Nagar → Kilpauk → Nungambakkam', students: 18, driver: 'Murugan S' },
  { id: 2, route_name: 'Route B - South', vehicle_no: 'TN 01 CD 5678', stops: 'Adyar → Velachery → Guindy',          students: 14, driver: 'Ravi K'    },
  { id: 3, route_name: 'Route C - East',  vehicle_no: 'TN 01 GH 3456', stops: 'Mylapore → T. Nagar → Saidapet',      students: 9,  driver: 'Kannan R'  },
]

// ─── Gallery ─────────────────────────────────────────────────────────────────
export const GALLERY = [
  { id: 1, title: 'Annual Day 2024',    category: 'Events',  date: '2024-12-20', images: 24 },
  { id: 2, title: 'Sports Day 2025',    category: 'Sports',  date: '2025-09-05', images: 36 },
  { id: 3, title: 'Science Exhibition', category: 'Academic',date: '2024-10-15', images: 18 },
  { id: 4, title: 'Cultural Fest',      category: 'Events',  date: '2024-11-10', images: 42 },
]

// ─── Sliders ─────────────────────────────────────────────────────────────────
export const SLIDERS = [
  { id: 1, title: 'Welcome to School CMS', subtitle: 'Empowering education through technology', order: 1, active: true },
  { id: 2, title: 'Annual Day 2025',        subtitle: 'Celebrating excellence and achievement',  order: 2, active: true },
  { id: 3, title: 'Admissions Open',        subtitle: 'Enroll now for the 2025-26 academic year', order: 3, active: false },
]

// ─── Marks ───────────────────────────────────────────────────────────────────
export const MARKS = [
  { id: 1, student_name: 'Arjun Sharma',   roll_no: '1001', class_name: 'Class 10-A', subject: 'Mathematics', exam: 'Mid-Term', marks_obtained: 88, total_marks: 100 },
  { id: 2, student_name: 'Priya Nair',     roll_no: '1002', class_name: 'Class 10-A', subject: 'Mathematics', exam: 'Mid-Term', marks_obtained: 92, total_marks: 100 },
  { id: 3, student_name: 'Rahul Verma',    roll_no: '1003', class_name: 'Class 10-A', subject: 'Mathematics', exam: 'Mid-Term', marks_obtained: 74, total_marks: 100 },
  { id: 4, student_name: 'Divya Krishnan', roll_no: '1004', class_name: 'Class 10-A', subject: 'Mathematics', exam: 'Mid-Term', marks_obtained: 95, total_marks: 100 },
  { id: 5, student_name: 'Kiran Patel',    roll_no: '1005', class_name: 'Class 10-A', subject: 'Mathematics', exam: 'Mid-Term', marks_obtained: 61, total_marks: 100 },
]

// ─── Grades ──────────────────────────────────────────────────────────────────
export const GRADES = [
  { id: 1, grade: 'A+', min_marks: 90, max_marks: 100, gpa: 10.0, description: 'Outstanding' },
  { id: 2, grade: 'A',  min_marks: 80, max_marks: 89,  gpa: 9.0,  description: 'Excellent'   },
  { id: 3, grade: 'B+', min_marks: 70, max_marks: 79,  gpa: 8.0,  description: 'Very Good'   },
  { id: 4, grade: 'B',  min_marks: 60, max_marks: 69,  gpa: 7.0,  description: 'Good'        },
  { id: 5, grade: 'C',  min_marks: 50, max_marks: 59,  gpa: 6.0,  description: 'Average'     },
  { id: 6, grade: 'D',  min_marks: 35, max_marks: 49,  gpa: 5.0,  description: 'Pass'        },
  { id: 7, grade: 'F',  min_marks: 0,  max_marks: 34,  gpa: 0.0,  description: 'Fail'        },
]

// ─── Notifications ───────────────────────────────────────────────────────────
export const NOTIFICATIONS = [
  { id: 1, title: 'Fee payment reminder',       message: 'Last date for fee payment is July 10th.',       type: 'Warning', sent_to: 'Parents',  date: '2025-07-01', sent: true  },
  { id: 2, title: 'Exam schedule published',    message: 'Mid-term exam schedule has been published.',    type: 'Info',    sent_to: 'Students', date: '2025-08-01', sent: true  },
  { id: 3, title: 'Holiday announcement',       message: 'School will remain closed on August 15th.',    type: 'Info',    sent_to: 'All',      date: '2025-08-10', sent: false },
]

// ─── Announcements ───────────────────────────────────────────────────────────
export const ANNOUNCEMENTS = [
  { id: 1, title: 'New Academic Year Begins',   content: 'The new academic year 2025-26 begins on June 10th. All students must report by 8:30 AM.', priority: 'High',   date: '2025-06-01' },
  { id: 2, title: 'Library Timings Updated',    content: 'Library will now be open from 8 AM to 5 PM on all working days.',                         priority: 'Normal', date: '2025-06-15' },
  { id: 3, title: 'Uniform Policy Reminder',    content: 'All students must wear proper school uniform. No exceptions will be made.',                priority: 'High',   date: '2025-07-01' },
]

// ─── Transport Students ───────────────────────────────────────────────────────
export const TRANSPORT_STUDENTS = [
  { id: 1, student_name: 'Arjun Sharma',   roll_no: '1001', class_name: 'Class 10-A', route: 'Route A - North', vehicle_no: 'TN 01 AB 1234', pickup_point: 'Anna Nagar' },
  { id: 2, student_name: 'Priya Nair',     roll_no: '1002', class_name: 'Class 9-B',  route: 'Route B - South', vehicle_no: 'TN 01 CD 5678', pickup_point: 'Adyar'     },
  { id: 3, student_name: 'Sneha Iyer',     roll_no: '1006', class_name: 'Class 7-A',  route: 'Route A - North', vehicle_no: 'TN 01 AB 1234', pickup_point: 'Kilpauk'   },
  { id: 4, student_name: 'Vikram Rajan',   roll_no: '1007', class_name: 'Class 6-B',  route: 'Route C - East',  vehicle_no: 'TN 01 GH 3456', pickup_point: 'Mylapore'  },
]

// ─── Vehicle Expenses ─────────────────────────────────────────────────────────
export const VEHICLE_EXPENSES = [
  { id: 1, vehicle_no: 'TN 01 AB 1234', type: 'Fuel',        amount: 4500, date: '2025-06-01', description: 'Monthly fuel refill'    },
  { id: 2, vehicle_no: 'TN 01 CD 5678', type: 'Maintenance', amount: 2200, date: '2025-06-05', description: 'Oil change and service' },
  { id: 3, vehicle_no: 'TN 01 EF 9012', type: 'Repair',      amount: 8500, date: '2025-06-10', description: 'Engine repair'          },
  { id: 4, vehicle_no: 'TN 01 AB 1234', type: 'Fuel',        amount: 4200, date: '2025-07-01', description: 'Monthly fuel refill'    },
  { id: 5, vehicle_no: 'TN 01 GH 3456', type: 'Insurance',   amount: 12000,date: '2025-07-15', description: 'Annual insurance renewal'},
]

// ─── Admins ───────────────────────────────────────────────────────────────────
export const ADMINS = [
  { id: 1, name: 'Super Admin',    email: 'admin@school.com',       phone: '9800001111', role: 'Super Admin', status: 'Active',   last_login: '2025-07-01' },
  { id: 2, name: 'Ravi Shankar',   email: 'ravi@school.com',        phone: '9800002222', role: 'Admin',       status: 'Active',   last_login: '2025-06-30' },
  { id: 3, name: 'Meena Kumari',   email: 'meena.k@school.com',     phone: '9800003333', role: 'Moderator',   status: 'Inactive', last_login: '2025-05-15' },
]

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = [
  { id: 1, name: 'Super Admin', permissions: 'All Access',                         users: 1, description: 'Full system access' },
  { id: 2, name: 'Admin',       permissions: 'Students, Teachers, Fees, Reports',  users: 2, description: 'General admin access' },
  { id: 3, name: 'Moderator',   permissions: 'Communication, Notices, Events',     users: 1, description: 'Content management only' },
  { id: 4, name: 'Teacher',     permissions: 'Attendance, Marks, Timetable',       users: 7, description: 'Academic management' },
]

// ─── Student Fee Records ──────────────────────────────────────────────────────
export const STUDENT_FEES = [
  { id: 1, student_name: 'Arjun Sharma',   roll_no: '1001', class_name: 'Class 10-A', fee_type: 'Tuition Fee', amount: 12000, paid: 12000, balance: 0,    status: 'Paid',    date: '2025-07-05' },
  { id: 2, student_name: 'Priya Nair',     roll_no: '1002', class_name: 'Class 9-B',  fee_type: 'Tuition Fee', amount: 12000, paid: 6000,  balance: 6000, status: 'Partial', date: '2025-07-08' },
  { id: 3, student_name: 'Rahul Verma',    roll_no: '1003', class_name: 'Class 8-C',  fee_type: 'Tuition Fee', amount: 12000, paid: 0,     balance: 12000,status: 'Pending', date: null         },
  { id: 4, student_name: 'Divya Krishnan', roll_no: '1004', class_name: 'Class 11-A', fee_type: 'Tuition Fee', amount: 12000, paid: 12000, balance: 0,    status: 'Paid',    date: '2025-07-03' },
  { id: 5, student_name: 'Kiran Patel',    roll_no: '1005', class_name: 'Class 12-B', fee_type: 'Tuition Fee', amount: 12000, paid: 12000, balance: 0,    status: 'Paid',    date: '2025-07-01' },
  { id: 6, student_name: 'Sneha Iyer',     roll_no: '1006', class_name: 'Class 7-A',  fee_type: 'Tuition Fee', amount: 12000, paid: 0,     balance: 12000,status: 'Pending', date: null         },
]

// ─── Contact Info ────────────────────────────────────────────────────────────
export const CONTACT_INFO = {
  school_name: 'Sri Vidya Mandir School',
  principal_name: 'Dr. Meenakshi Sundaram',
  address: '14, Gandhi Road, T. Nagar, Chennai - 600017',
  phone: '+91 44 2345 6789',
  email: 'info@srividyamandir.edu.in',
  website: 'https://srividyamandir.edu.in',
}
