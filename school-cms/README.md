# School CMS — Standalone Frontend

A complete **Next.js 14 + Tailwind CSS** school admin dashboard with **mock data only** — no backend required.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Login credentials:**
- Username: `admin`
- Password: `admin123`
- *(Or click "Demo credentials" to autofill)*

---

## 📁 Project Structure

```
src/
├── app/
│   ├── login/                  # Login page
│   └── admin/
│       ├── dashboard/          # Dashboard with stats
│       ├── students/           # Student list + CRUD
│       ├── teachers/           # Teacher list + CRUD
│       ├── staff/              # Staff list + CRUD
│       ├── attendance/         # Attendance marking
│       ├── timetable/          # Class timetable
│       ├── exam-semester/      # Exams list
│       ├── fees/               # Fee management
│       ├── communication/      # Notice, Events
│       ├── transport/          # Vehicles, Routes
│       └── system/             # Contact info, Backup
├── components/
│   ├── layout/
│   │   ├── Sidebar.js          # Full collapsible sidebar
│   │   ├── Header.js           # Topbar with breadcrumb
│   │   └── AdminLayout.js      # Layout wrapper
│   └── ui/
│       └── index.js            # Shared UI components
└── lib/
    └── mockData.js             # ALL mock data lives here
```

---

## 📝 Editing Mock Data

All sample data is in **`src/lib/mockData.js`**. Just edit the arrays to change what shows up:

```js
// Change student data
export const STUDENTS = [
  { id: 1, name: 'Your Student', email: 'student@school.com', ... },
  ...
]

// Change school stats on dashboard
export const STATS = {
  total_students: 1234,
  total_teachers: 56,
  ...
}
```

---

## 🎨 Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (custom purple primary color)
- **Lucide React** icons
- **DM Sans + Outfit** fonts (Google Fonts)
- Zero backend, zero API calls

---

## 🔌 Want to connect a FastAPI backend later?

1. Install axios: `npm install axios`
2. Create `src/lib/api.js` with your endpoint calls
3. Replace `useState(MOCK_DATA)` with `useEffect(() => fetchFromApi(), [])` in each page

---

## 📦 Build

```bash
npm run build
npm start
```
