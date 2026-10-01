import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

export default function Login() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const from = useLocation().state?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setBusy(false)
      return setError('登入失敗：請確認 Email 與密碼是否正確。')
    }
    // 管理員帳號要從後台登入頁登入，會員與管理員的入口分開
    const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()
    setBusy(false)
    if (p?.is_admin) {
      await supabase.auth.signOut()
      return setError('admin')
    }
    navigate(from)
  }

  return (
    <main className="container narrow">
      <h1>會員登入</h1>
      <form onSubmit={submit} className="panel form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          密碼
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error === 'admin' ? (
          <p className="error">這是管理員帳號，請從<Link to="/admin/login">後台登入頁</Link>登入。</p>
        ) : (
          error && <p className="error">{error}</p>
        )}
        <button type="submit" disabled={busy}>{busy ? '登入中…' : '登入'}</button>
        <p className="muted center"><Link to="/forgot-password">忘記密碼？</Link></p>
      </form>
      <p className="muted center">還沒有帳號？<Link to="/register" state={{ from }}>註冊會員</Link></p>
    </main>
  )
}
