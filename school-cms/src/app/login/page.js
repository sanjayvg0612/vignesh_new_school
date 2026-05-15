'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [mobile, setMobile]   = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(mobile.trim(), password)
      // client_key is set as a cookie by the server — browser handles it automatically
      const user = res?.extra || res?.result || res?.data
      if (user && typeof user === 'object') {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: 'Outfit' }}>School CMS</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Outfit' }}>
            Manage your school smarter
          </h1>
          <p className="text-primary-200 text-lg mb-8">
            Complete school management system for students, teachers, exams, fees and more.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[{ l: 'Students', v: '1,234+' }, { l: 'Teachers', v: '56+' }, { l: 'Classes', v: '24' }, { l: 'Modules', v: '12' }].map(i => (
              <div key={i.l} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>{i.v}</div>
                <div className="text-primary-200 text-sm mt-1">{i.l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-primary-300 text-sm">© 2025–2026 School CMS. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Outfit' }}>School CMS</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Outfit' }}>Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your admin account</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                className="input"
                type="tel"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
