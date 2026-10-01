import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import PasswordForm from '../components/PasswordForm'

// 重設密碼：從重設信的連結進來時，Supabase 會自動用網址裡的憑證登入，這裡只要設定新密碼
export default function ResetPassword() {
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <p className="container muted center">載入中…</p>

  return (
    <main className="container narrow auth-page">
      <h1>設定新密碼</h1>
      {user ? (
        <PasswordForm
          title={user.email}
          submitLabel="儲存新密碼"
          onDone={() => setTimeout(() => navigate(isAdmin ? '/admin' : '/'), 1200)}
        />
      ) : (
        <p className="panel center">這個重設連結已經失效或用過了，請回到登入頁按「忘記密碼」重新寄一次。</p>
      )}
    </main>
  )
}
