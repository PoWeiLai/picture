import { useAuth } from '../AuthContext'
import PasswordForm from '../components/PasswordForm'
import AvatarUpload from '../components/AvatarUpload'
import { AdminPage } from './AdminLayout'

// 後台「個人設定」：管理員不用回到前台就能換頭像、改密碼
export default function AdminAccount() {
  const { user } = useAuth()
  return (
    <AdminPage title="個人設定" subtitle={`登入帳號：${user.email}`}>
      <div className="admin-narrow">
        <AvatarUpload />
        <PasswordForm title="修改密碼" />
      </div>
    </AdminPage>
  )
}
