import { Routes, Route, Link, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { supabase } from './lib/supabase'
import Gallery from './pages/Gallery'
import PaintingDetail from './pages/PaintingDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Admin from './pages/Admin'
import About from './pages/About'
import { isDemo } from './lib/supabase'
import Ornament from './components/Ornament'
import { toRoman } from './lib/video'
import { SITE_NAME } from './siteConfig'

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
          <NavLink to="/about">畫家</NavLink>
          {isAdmin && <NavLink to="/admin">管理</NavLink>}
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
        </nav>
      </div>
    </header>
  )
}

function RequireAuth({ children, admin = false }) {
  const { user, isAdmin, loading, profile } = useAuth()
  if (loading || (user && !profile)) return <p className="container muted">載入中…</p>
  if (!user) return <Navigate to="/login" replace />
  if (admin && !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      {isDemo && (
        <p className="demo-banner">預覽模式：目前顯示示範資料，登入與留言需先設定 Supabase（見 README）。</p>
      )}
      <Header />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Gallery />} />
        <Route path="/paintings/:id" element={<PaintingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="site-footer">
        <Ornament />
        <p>{SITE_NAME} · Anno Domini {toRoman(new Date().getFullYear())}</p>
      </footer>
    </>
  )
}
