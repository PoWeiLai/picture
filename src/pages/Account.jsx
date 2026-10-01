import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import AdminRequest from '../components/AdminRequest'
import PasswordForm from '../components/PasswordForm'
import AvatarUpload from '../components/AvatarUpload'

export default function Account() {
  const { user, profile, isAdmin, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [nameMsg, setNameMsg] = useState('')

  async function saveName(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)
    setNameMsg(error ? '儲存失敗：' + error.message : '已儲存')
    if (!error) refreshProfile()
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <main className="container narrow">
      <h1>帳戶設定</h1>
      <p className="muted">Email：{user.email}</p>
      <p className="account-actions">
        {isAdmin && <Link to="/admin" className="button">進入後台</Link>}
        <button type="button" onClick={logout}>登出</button>
      </p>

      <AvatarUpload />

      <form onSubmit={saveName} className="panel form">
        <h2>顯示名稱</h2>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} required />
        {nameMsg && <p className="muted">{nameMsg}</p>}
        <button type="submit">儲存名稱</button>
      </form>

      <PasswordForm />

      <AdminRequest />
    </main>
  )
}
