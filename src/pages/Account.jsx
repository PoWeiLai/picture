import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'

export default function Account() {
  const { user, profile, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [nameMsg, setNameMsg] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  async function saveName(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)
    setNameMsg(error ? '儲存失敗：' + error.message : '已儲存')
    if (!error) refreshProfile()
  }

  async function savePassword(e) {
    e.preventDefault()
    if (password !== confirmPassword) return setPwMsg('兩次輸入的密碼不一致')
    const { error } = await supabase.auth.updateUser({ password })
    setPwMsg(error ? '更新失敗：' + error.message : '密碼已更新')
    if (!error) {
      setPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <main className="container narrow">
      <h1>帳戶設定</h1>
      <p className="muted">Email：{user.email}</p>

      <form onSubmit={saveName} className="panel form">
        <h2>顯示名稱</h2>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} required />
        {nameMsg && <p className="muted">{nameMsg}</p>}
        <button type="submit">儲存名稱</button>
      </form>

      <form onSubmit={savePassword} className="panel form">
        <h2>變更密碼</h2>
        <label>
          新密碼
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required autoComplete="new-password" />
        </label>
        <label>
          再輸入一次
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required autoComplete="new-password" />
        </label>
        {pwMsg && <p className="muted">{pwMsg}</p>}
        <button type="submit">更新密碼</button>
      </form>
    </main>
  )
}
