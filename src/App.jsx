import { Routes, Route, Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Gallery from './pages/Gallery'
import PaintingDetail from './pages/PaintingDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import WorksAdmin from './admin/WorksAdmin'
import WorkEdit from './admin/WorkEdit'
import CategoriesAdmin from './admin/CategoriesAdmin'
import StudioAdmin from './admin/StudioAdmin'
import CommentsAdmin from './admin/CommentsAdmin'
import MembersAdmin from './admin/MembersAdmin'
import ContentAdmin from './admin/ContentAdmin'
import About from './pages/About'
import Studio from './pages/Studio'
import Exhibitions from './pages/Exhibitions'
import Contact from './pages/Contact'
import MessagesAdmin from './admin/MessagesAdmin'
import { isDemo } from './lib/supabase'
import Ornament from './components/Ornament'
import { toRoman } from './lib/video'
import { SITE_NAME } from './siteConfig'
import { useSoundEffects } from './components/SoundEffects'
import { useBackgroundMusic, MusicToggle, MusicCredit } from './components/BackgroundMusic'

// 右上角的可愛按鈕：未登入時是「登入會員」，登入後顯示名稱、點進去是帳戶頁
function MemberButton() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const to = user ? '/account' : '/login'
  const active = ['/login', '/register', '/account'].includes(location.pathname)

  return (
    <Link to={to} className={active ? 'cute-button member-button active' : 'cute-button member-button'}>
      {/* 小熊臉 */}
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="16" cy="16" r="9" fill="#e8b98a" stroke="#6b4426" strokeWidth="2.5" />
        <circle cx="48" cy="16" r="9" fill="#e8b98a" stroke="#6b4426" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="4" fill="#ffc9d4" />
        <circle cx="48" cy="16" r="4" fill="#ffc9d4" />
        <circle cx="32" cy="36" r="22" fill="#f3cc9f" stroke="#6b4426" strokeWidth="2.5" />
        <circle cx="24" cy="33" r="3" fill="#3b2414" />
        <circle cx="40" cy="33" r="3" fill="#3b2414" />
        <ellipse cx="32" cy="43" rx="8" ry="6" fill="#fff3e2" />
        <ellipse cx="32" cy="40.5" rx="3" ry="2.2" fill="#3b2414" />
        <path d="M29 45q3 2.5 6 0" fill="none" stroke="#3b2414" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="42" r="3.5" fill="#ff9fb5" opacity="0.7" />
        <circle cx="47" cy="42" r="3.5" fill="#ff9fb5" opacity="0.7" />
      </svg>
      <span className="cute-label">{user ? (profile?.display_name ?? '會員') : '登入會員'}</span>
    </Link>
  )
}

function Header() {
  const location = useLocation()
  const isVideo = location.pathname === '/' && new URLSearchParams(location.search).get('kind') === 'video'

  return (
    <header className="site-header">
      <div className="corner-buttons">
        <MusicToggle />
        <MemberButton />
      </div>
      <div className="container header-inner">
        <p className="eyebrow">Galleria Privata</p>
        <Link to="/" className="brand">{SITE_NAME}</Link>
        <Ornament />
        <nav className="nav">
          <NavLink to="/about">個人自傳</NavLink>
          <Link to="/?kind=video#collection" className={isVideo ? 'active' : ''}>影片</Link>
          <NavLink to="/" end className={({ isActive }) => (isActive && !isVideo ? 'active' : '')}>作品</NavLink>
          <NavLink to="/exhibitions">藝無界、美相遇</NavLink>
          <NavLink to="/setup">布展活動</NavLink>
          <NavLink to="/studio">生活點滴</NavLink>
          <NavLink to="/contact">歡迎私訊我</NavLink>
        </nav>
      </div>
    </header>
  )
}

// 需要登入才能進入；admin 頁面還必須是管理員（每位管理員各自註冊帳號，再由現任管理員核准）
function RequireAuth({ children, admin = false }) {
  const { user, isAdmin, loading, profile } = useAuth()
  const location = useLocation()
  if (loading || (user && !profile)) return <p className="container muted">載入中…</p>
  // 未登入：先去登入，登入後回到原本要去的頁面
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  // 已登入但不是管理員：帶到帳戶頁，可以在那裡申請成為管理員
  if (admin && !isAdmin) return <Navigate to="/account" replace />
  return children
}

// 前台版面：頁首、頁尾與預覽提示
function FrontLayout() {
  return (
    <>
      {isDemo && (
        <p className="demo-banner">預覽模式：目前顯示示範資料，登入與留言需先設定 Supabase（見 README）。</p>
      )}
      <Header />
      <Outlet />
      <footer className="site-footer">
        <Ornament />
        <p>{SITE_NAME} · Anno Domini {toRoman(new Date().getFullYear())}</p>
        <MusicCredit />
      </footer>
    </>
  )
}

export default function App() {
  useSoundEffects()
  useBackgroundMusic()

  return (
    <Routes>
      <Route element={<FrontLayout />}>
        <Route path="/" element={<Gallery />} />
        <Route path="/paintings/:id" element={<PaintingDetail />} />
        <Route path="/studio" element={<Studio key="daily" album="daily" />} />
        <Route path="/setup" element={<Studio key="setup" album="setup" />} />
        <Route path="/about" element={<About />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
      </Route>
      <Route path="/admin" element={<RequireAuth admin><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="works" element={<WorksAdmin />} />
        <Route path="works/:id" element={<WorkEdit />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="studio" element={<StudioAdmin key="daily" album="daily" />} />
        <Route path="setup" element={<StudioAdmin key="setup" album="setup" />} />
        <Route path="comments" element={<CommentsAdmin />} />
        <Route path="messages" element={<MessagesAdmin />} />
        <Route path="members" element={<MembersAdmin />} />
        <Route path="content" element={<ContentAdmin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
