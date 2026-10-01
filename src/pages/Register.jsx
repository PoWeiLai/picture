import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

export default function Register() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from ?? '/'
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() },
        emailRedirectTo: window.location.origin,
      },
    })
    setBusy(false)
    if (error) return setError('註冊失敗：' + error.message)
    // Supabase 預設需要 Email 驗證，此時不會有 session
    if (!data.session) return setNotice('註冊成功！請到信箱點擊驗證連結後再登入。')
    navigate(from)
  }

  if (notice) {
    return (
      <main className="container narrow">
        <h1>註冊</h1>
        <p>{notice}</p>
        <Link to="/login" state={{ from }}>前往登入</Link>
      </main>
    )
  }

  return (
    <main className="container narrow">
      <h1>註冊</h1>
      <form onSubmit={submit} className="panel form">
        <label>
          顯示名稱（評論時會顯示）
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          密碼（至少 6 個字元）
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required autoComplete="new-password" />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? '註冊中…' : '註冊'}</button>
      </form>
      <p className="muted">已經有帳號？<Link to="/login" state={{ from }}>登入</Link></p>
    </main>
  )
}
