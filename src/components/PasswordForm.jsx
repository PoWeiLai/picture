import { useState } from 'react'
import { supabase } from '../lib/supabase'

// 設定新密碼：帳戶頁、後台「修改密碼」、忘記密碼後的重設頁共用
export default function PasswordForm({ title = '變更密碼', submitLabel = '更新密碼', onDone }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (password !== confirmPassword) return setMsg('兩次輸入的密碼不一致')
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) return setMsg('更新失敗：' + error.message)
    setMsg('密碼已更新')
    setPassword('')
    setConfirmPassword('')
    onDone?.()
  }

  return (
    <form onSubmit={submit} className="panel form">
      <h2>{title}</h2>
      <label>
        新密碼（至少 6 個字元）
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required autoComplete="new-password" />
      </label>
      <label>
        再輸入一次
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required autoComplete="new-password" />
      </label>
      {msg && <p className="muted">{msg}</p>}
      <button type="submit" disabled={busy}>{busy ? '更新中…' : submitLabel}</button>
    </form>
  )
}
