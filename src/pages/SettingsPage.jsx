import { useState, useEffect, useRef } from 'react'
import { userAPI, storage } from '../services/api'
import '../styles/SettingsPage.css'

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

  const initials = (name) => (name ? name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'U')

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
    <div className="settings-page card">
      <div className="settings-grid">
        <aside className="settings-aside">
          <div className="avatar-box">
            {displayAvatar ? (
              <img src={displayAvatar} alt="avatar" className="avatar-img" />
            ) : (
              <div className="avatar-fallback">{initials(user?.hoTen)}</div>
            )}
          </div>
          <div className="avatar-actions">
            <input ref={inputRef} id="avatar-input" type="file" accept="image/*" onChange={onSelectAvatar} style={{display:'none'}} />
            <button type="button" className="btn-outline" onClick={() => inputRef.current && inputRef.current.click()}>Thay ảnh</button>
            <button type="button" className="btn-link" onClick={() => { setAvatarFile(null); if (avatarPreview && avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview); setAvatarPreview(user?.avatar || null) }}>Hoàn tác</button>
          </div>
          <div className="profile-summary">
            <div className="profile-name">{user?.hoTen || 'Chưa đặt tên'}</div>
            <div className="profile-email">{user?.email || '-'}</div>
            <div className="profile-phone">{user?.soDienThoai || '-'}</div>
          </div>
        </aside>

        <section className="settings-main">
          <h2 className="section-title-small">Thông tin cá nhân</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Họ tên</label>
                <input value={form.hoTen} onChange={(e) => updateField('hoTen', e.target.value)} placeholder="Họ và tên" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="email@domain.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input value={form.soDienThoai} onChange={(e) => updateField('soDienThoai', e.target.value)} placeholder="0901 xxx xxx" />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input type="password" value={form.matKhau} onChange={(e) => updateField('matKhau', e.target.value)} placeholder="Để trống nếu không đổi" />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              <button type="button" className="btn-secondary" onClick={() => { setForm({ hoTen: user?.hoTen || '', email: user?.email || '', soDienThoai: user?.soDienThoai || '', matKhau: '' }); setError(''); setSuccess('') }}>Huỷ</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
