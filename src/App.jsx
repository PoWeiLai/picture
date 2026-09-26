import { Routes, Route, Link, NavLink, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { supabase } from './lib/supabase'
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
import { isDemo } from './lib/supabase'
import Ornament from './components/Ornament'
import { toRoman } from './lib/video'
import { SITE_NAME } from './siteConfig'
import { useSoundEffects, SoundToggle } from './components/SoundEffects'

function Header() {
  const { user, profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isVideo = location.pathname === '/' && new URLSearchParams(location.search).get('kind') === 'video'

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <p className="eyebrow">Galleria Privata</p>
        <Link to="/" className="brand">{SITE_NAME}</Link>
        <Ornament />
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive && !isVideo ? 'active' : '')}>畫廊</NavLink>
          <Link to="/?kind=video#collection" className={isVideo ? 'active' : ''}>影片</Link>
          <NavLink to="/studio">畫室</NavLink>
          <NavLink to="/about">畫家</NavLink>
          {(isAdmin || isDemo) && <NavLink to="/admin">後台</NavLink>}
          {user ? (
            <>
              <NavLink to="/account">{profile?.display_name ?? '帳戶'}</NavLink>
              <button className="link-button" onClick={logout}>登出</button>
            </>
          ) : (
            <>
              <NavLink to="/login">登入</NavLink>
              <NavLink to="/register">註冊</NavLink>
            </>
          )}
          <SoundToggle />
        </nav>
      </div>
    </header>
  )
}

function RequireAuth({ children, admin = false }) {
  const { user, isAdmin, loading, profile } = useAuth()
  // 預覽模式沒有登入功能，直接開放後台瀏覽（所有寫入都會被擋下）
  if (admin && isDemo) return children
  if (loading || (user && !profile)) return <p className="container muted">載入中…</p>
  if (!user) return <Navigate to="/login" replace />
  if (admin && !isAdmin) return <Navigate to="/" replace />
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
      </footer>
    </>
  )
}

export default function App() {
  useSoundEffects()

  return (
    <Routes>
      <Route element={<FrontLayout />}>
        <Route path="/" element={<Gallery />} />
        <Route path="/paintings/:id" element={<PaintingDetail />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
      </Route>
      <Route path="/admin" element={<RequireAuth admin><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="works" element={<WorksAdmin />} />
        <Route path="works/:id" element={<WorkEdit />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="studio" element={<StudioAdmin />} />
        <Route path="comments" element={<CommentsAdmin />} />
        <Route path="members" element={<MembersAdmin />} />
        <Route path="content" element={<ContentAdmin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
