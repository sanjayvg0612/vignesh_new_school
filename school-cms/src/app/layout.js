import './globals.css'

export const metadata = { title: 'School CMS', description: 'School Management System' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
