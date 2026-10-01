import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import { SITE_NAME } from '../siteConfig'

// 後台專用登入頁：只有管理員帳號能從這裡登入；一般會員請用前台右上角的「登入會員」
export default function AdminLogin() {
  const { user, isAdmin, loading, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading || (user && !profile)) return <p className="container muted center">載入中…</p>
  if (isAdmin) return <Navigate to="/admin" replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setBusy(false)
      return setError('登入失敗：請確認 Email 與密碼是否正確。')
    }
    const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()
    setBusy(false)
    if (!p?.is_admin) {
      await supabase.auth.signOut()
      return setError('這個帳號不是管理員，無法登入後台。一般會員請從網站右上角的「登入會員」登入。')
    }
    navigate('/admin')
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <main className="container narrow auth-page admin-login">
      <p className="eyebrow center">Studiolo</p>
      <h1>後台管理登入</h1>
      <p className="muted center">{SITE_NAME}</p>

      {user ? (
        // 已用一般會員帳號登入前台
        <div className="panel center">
          <p>目前登入的帳號（{user.email}）不是管理員。</p>
          <p className="muted">如果想協助管理網站，可以到帳戶頁申請成為管理員。</p>
          <p className="account-actions" style={{ justifyContent: 'center' }}>
            <Link to="/account" className="button">前往帳戶頁</Link>
            <button type="button" onClick={logout}>登出，改用管理員帳號</button>
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="panel form">
          <label>
            管理員 Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            密碼
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? '登入中…' : '登入後台'}</button>
          <p className="muted center">
            <Link to="/forgot-password" state={{ admin: true }}>忘記密碼？</Link>
          </p>
        </form>
      )}

      <p className="muted center"><Link to="/">← 返回網站</Link></p>
    </main>
  )
}
