import { NavLink, Link, Outlet } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { isDemo } from '../lib/supabase'
import { SITE_NAME } from '../siteConfig'

const MENU = [
  { to: '/admin', label: '總覽', end: true },
  { to: '/admin/works', label: '作品' },
  { to: '/admin/categories', label: '分類' },
  { to: '/admin/studio', label: '畫室照片' },
  { to: '/admin/comments', label: '留言' },
  { to: '/admin/members', label: '會員' },
  { to: '/admin/content', label: '網站內容' },
]

// 後台版面：左側選單 + 內容區，與前台的頁首頁尾分開
export default function AdminLayout() {
  const { profile } = useAuth()

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
          <span className="muted">{profile?.display_name ?? (isDemo ? '預覽模式' : '')}</span>
          <Link to="/">← 返回前台</Link>
        </div>
      </aside>
      <div className="admin-main">
        {isDemo && (
          <p className="admin-demo">預覽模式：可以瀏覽後台的所有功能，但無法儲存。接上 Supabase 後才能正式使用。</p>
        )}
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
