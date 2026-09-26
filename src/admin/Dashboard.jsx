import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, formatDate } from '../lib/supabase'
import { AdminPage } from './AdminLayout'

async function count(table, filter) {
  let q = supabase.from(table).select('id')
  if (filter) q = filter(q)
  const { data } = await q
  return data?.length ?? 0
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [latest, setLatest] = useState([])

  useEffect(() => {
    Promise.all([
      count('paintings', (q) => q.is('video_url', null)),
      count('paintings', (q) => q.not('video_url', 'is', null)),
      count('studio_photos'),
      count('comments'),
      count('profiles'),
    ]).then(([paintings, videos, photos, comments, members]) =>
      setStats({ paintings, videos, photos, comments, members }),
    )
    supabase
      .from('comments')
      .select('id, body, created_at, painting_id, profiles(display_name), paintings(title)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setLatest((data ?? []).slice(0, 6)))
  }, [])

  const tiles = [
    { label: '畫作', value: stats?.paintings, to: '/admin/works' },
    { label: '影片', value: stats?.videos, to: '/admin/works?kind=video' },
    { label: '畫室照片', value: stats?.photos, to: '/admin/studio' },
    { label: '留言', value: stats?.comments, to: '/admin/comments' },
    { label: '會員', value: stats?.members, to: '/admin/members' },
  ]

  return (
    <AdminPage title="總覽" subtitle="網站目前的狀況一覽">
      <div className="stat-grid">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="stat-tile">
            <span className="stat-value">{t.value ?? '—'}</span>
            <span className="stat-label">{t.label}</span>
          </Link>
        ))}
      </div>

      <div className="admin-columns">
        <section className="panel">
          <h2>最新留言</h2>
          {latest.length === 0 ? (
            <p className="muted">目前還沒有留言。</p>
          ) : (
            <ul className="list">
              {latest.map((c) => (
                <li key={c.id}>
                  <span>
                    <strong>{c.profiles?.display_name ?? '匿名'}</strong>
                    <span className="muted"> 於《{c.paintings?.title ?? '已刪除的作品'}》· {formatDate(c.created_at)}</span>
                    <br />
                    {c.body.length > 60 ? c.body.slice(0, 60) + '…' : c.body}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/comments">查看全部留言 →</Link>
        </section>

        <section className="panel">
          <h2>快速動作</h2>
          <ul className="quick-actions">
            <li><Link to="/admin/works">匯入新畫作或影片</Link></li>
            <li><Link to="/admin/studio">上傳畫室照片</Link></li>
            <li><Link to="/admin/content">修改首頁封面與畫家介紹</Link></li>
            <li><Link to="/admin/members">管理會員與管理員</Link></li>
          </ul>
        </section>
      </div>
    </AdminPage>
  )
}
