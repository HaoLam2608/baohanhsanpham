import { useState, useEffect, useRef } from 'react'
import { userAPI, storage } from '../services/api'
import { Camera, RotateCcw, Save, X, User, Mail, Phone, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SettingsPage({ onSaved }) {
  const [user, setUser] = useState(storage.getUser() || null)
  const [form, setForm] = useState({ hoTen: '', email: '', soDienThoai: '', matKhau: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const fresh = await userAPI.getProfile().catch(() => null)
        const data = fresh?.data || fresh || storage.getUser()
        if (data && mounted) {
          setUser(data)
          setForm({ hoTen: data.hoTen || '', email: data.email || '', soDienThoai: data.soDienThoai || '', matKhau: '' })
          if (data.avatar) setAvatarPreview(data.avatar)
        }
      } catch (e) {
        console.error('Load profile error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false; if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview) }
  }, [])

  const updateField = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const onSelectAvatar = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview)
    const url = URL.createObjectURL(f)
    setAvatarFile(f)
    setAvatarPreview(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      setLoading(true)
      // If avatar file selected, upload it first
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      let uploadedUser = null
      if (avatarFile) {
        const fd = new FormData()
        fd.append('avatar', avatarFile)
        const resp = await fetch(`${API_BASE}/user/avatar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${storage.getToken()}`
          },
          body: fd
        })
        const text = await resp.text()
        try {
          const data = JSON.parse(text)
          if (!resp.ok) throw new Error(data.message || text)
          uploadedUser = data?.data || data
        } catch (err) {
          if (!resp.ok) throw new Error(text || `Upload failed (${resp.status})`)
          uploadedUser = { avatar: text }
        }
      }

      const payload = { hoTen: form.hoTen, email: form.email, soDienThoai: form.soDienThoai }
      if (form.matKhau && form.matKhau.trim().length > 0) payload.matKhau = form.matKhau

      const res = await userAPI.updateProfile(payload)
      const updated = res?.data || res || payload
      // if upload returned updated user, prefer that avatar
      if (uploadedUser && uploadedUser.avatar) updated.avatar = uploadedUser.avatar
      storage.setUser(updated)
      setUser(updated)
      setSuccess('Cập nhật thông tin thành công')
      setForm(prev => ({ ...prev, matKhau: '' }))
      if (onSaved) onSaved(updated)
    } catch (err) {
      console.error('Update profile error', err)
      setError(err.message || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const initials = (name) => (name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U')

  const normalizeAvatar = (p) => {
    if (!p) return null
    // blob: preview
    if (p.startsWith('blob:')) return p
    // already absolute URL
    if (p.startsWith('http://') || p.startsWith('https://')) return p
    // relative path like /uploads/xxx or /api/uploads/xxx -> prefix with API base (which includes /api)
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    // if p already starts with /api, remove leading slash to avoid double
    if (p.startsWith('/api')) return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${p.slice(4)}`
    return `${API_BASE}${p}`
  }

  const displayAvatar = avatarPreview ? normalizeAvatar(avatarPreview) : (user?.avatar ? normalizeAvatar(user.avatar) : null)

  return (
    <div className="settings-page bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="settings-grid grid md:grid-cols-3 min-h-[500px]">
        <aside className="settings-aside md:col-span-1 bg-gray-50 p-8 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-gray-100">
          <div className="avatar-box relative mb-6 group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center">
              {displayAvatar ? (
                <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold">
                  {initials(user?.hoTen)}
                </div>
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              onClick={() => inputRef.current && inputRef.current.click()}
              title="Thay đổi ảnh đại diện"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="profile-summary mb-8">
            <div className="profile-name text-xl font-bold text-gray-900 mb-1">{user?.hoTen || 'Chưa đặt tên'}</div>
            <div className="profile-email text-sm text-gray-500 mb-1">{user?.email || '-'}</div>
            <div className="profile-phone text-sm text-gray-500">{user?.soDienThoai || '-'}</div>
          </div>

          <div className="avatar-actions flex gap-3 w-full">
            <input ref={inputRef} id="avatar-input" type="file" accept="image/*" onChange={onSelectAvatar} style={{ display: 'none' }} />
            <button
              type="button"
              className="flex-1 py-2 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              onClick={() => { setAvatarFile(null); if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview); setAvatarPreview(user?.avatar || null) }}
            >
              <RotateCcw className="w-4 h-4" /> Hoàn tác
            </button>
          </div>
        </aside>

        <section className="settings-main md:col-span-2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Thông tin cá nhân
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form className="settings-form space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> Họ tên
                </label>
                <input
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.hoTen}
                  onChange={(e) => updateField('hoTen', e.target.value)}
                  placeholder="Họ và tên"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" /> Email
                </label>
                <input
                  type="email"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="email@domain.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> Số điện thoại
                </label>
                <input
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.soDienThoai}
                  onChange={(e) => updateField('soDienThoai', e.target.value)}
                  placeholder="0901 xxx xxx"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" /> Mật khẩu mới
                </label>
                <input
                  type="password"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.matKhau}
                  onChange={(e) => updateField('matKhau', e.target.value)}
                  placeholder="Để trống nếu không đổi"
                />
              </div>
            </div>

            <div className="form-actions pt-4 flex gap-4 border-t border-gray-100 mt-8">
              <button
                className="btn-primary px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>Đang lưu...</>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Lưu thay đổi
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => { setForm({ hoTen: user?.hoTen || '', email: user?.email || '', soDienThoai: user?.soDienThoai || '', matKhau: '' }); setError(''); setSuccess('') }}
              >
                <X className="w-5 h-5" /> Huỷ
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
