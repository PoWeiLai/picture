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

  // 註銷帳號：要輸入「註銷」兩個字才會執行，避免誤按
  async function deleteAccount() {
    const typed = prompt('註銷後帳號、留言和頭像都會永久刪除，無法復原。\n確定要註銷請輸入「註銷」：')
    if (typed === null) return
    if (typed.trim() !== '註銷') return alert('輸入的文字不符，帳號沒有註銷。')
    const { error } = await supabase.rpc('delete_my_account')
    if (error) return alert('註銷失敗：' + error.message)
    if (profile.avatar_path) await supabase.storage.from('avatars').remove([profile.avatar_path])
    await supabase.auth.signOut()
    alert('帳號已註銷。')
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

      <section className="panel">
        <h2>註銷帳號</h2>
        <p className="muted">永久刪除這個帳號，以及你的留言和頭像，刪除後無法復原。</p>
        <button type="button" className="link-button danger" onClick={deleteAccount}>註銷帳號</button>
      </section>
    </main>
  )
}
