import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import { SITE_NAME } from '../siteConfig'
import Avatar from '../components/Avatar'

const MENU = [
  { to: '/admin', label: '總覽', end: true },
  { to: '/admin/works', label: '作品' },
  { to: '/admin/categories', label: '分類' },
  { to: '/admin/studio', label: '生活點滴' },
  { to: '/admin/setup', label: '布展活動' },
  { to: '/admin/comments', label: '留言' },
  { to: '/admin/messages', label: '私訊' },
  { to: '/admin/members', label: '會員' },
  { to: '/admin/content', label: '網站內容' },
  { to: '/admin/account', label: '個人設定' },
]

// 後台版面：左側選單 + 內容區，與前台的頁首頁尾分開
export default function AdminLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function logout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <span className="eyebrow">Studiolo</span>
          <strong>後台管理</strong>
          <span className="muted">{SITE_NAME}</span>
        </Link>
        <nav className="admin-menu" aria-label="後台選單">
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end}>{m.label}</NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <span className="admin-me"><Avatar profile={profile} className="avatar-small" /> {profile?.display_name}</span>
          <button type="button" className="link-button" onClick={logout}>登出</button>
          <Link to="/">← 返回前台</Link>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}

export function AdminPage({ title, subtitle, actions, children }) {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        {actions && <div className="admin-page-actions">{actions}</div>}
      </header>
      {children}
    </section>
  )
}
