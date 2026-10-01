import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// 忘記密碼：寄出重設密碼信，信裡的連結會開啟 /reset-password
export default function ForgotPassword() {
  // 從後台登入頁過來時，「返回」連到後台登入頁
  const fromAdmin = useLocation().state?.admin === true
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    if (error) return setError('寄送失敗：' + error.message)
    setSent(true)
  }

  return (
    <main className="container narrow auth-page">
      <h1>忘記密碼</h1>
      {sent ? (
        <div className="panel center">
          <p>如果這個 Email 有註冊過，重設密碼的信已經寄出了。</p>
          <p className="muted">請到信箱點信裡的連結，設定新密碼。沒收到的話，看看垃圾郵件匣。</p>
        </div>
      ) : (
        <form onSubmit={submit} className="panel form">
          <p className="muted">輸入註冊時用的 Email，我們會寄一封重設密碼的信給你。</p>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? '寄送中…' : '寄出重設信'}</button>
        </form>
      )}
      <p className="muted center">
        <Link to={fromAdmin ? '/admin/login' : '/login'}>← 返回登入</Link>
      </p>
    </main>
  )
}
