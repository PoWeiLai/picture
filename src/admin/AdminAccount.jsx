import { useAuth } from '../AuthContext'
import PasswordForm from '../components/PasswordForm'
import { AdminPage } from './AdminLayout'

// 後台「修改密碼」：管理員不用回到前台就能改自己的密碼
export default function AdminAccount() {
  const { user } = useAuth()
  return (
    <AdminPage title="修改密碼" subtitle={`登入帳號：${user.email}`}>
      <div className="admin-narrow">
        <PasswordForm title="設定新密碼" />
      </div>
    </AdminPage>
  )
}
