import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, formatDate } from '../lib/supabase'
import { toRoman } from '../lib/video'
import { useAuth } from '../AuthContext'
import { WorkPlayer } from '../components/WorkMedia'
import Ornament from '../components/Ornament'

export default function PaintingDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const [work, setWork] = useState(undefined)
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, body, created_at, user_id, profiles(display_name, is_admin)')
      .eq('painting_id', id)
      .order('created_at')
    setComments(data ?? [])
  }, [id])

  useEffect(() => {
    supabase
      .from('paintings')
      .select('*, categories(name)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => setWork(data))
    loadComments()
  }, [id, loadComments])

  async function submit(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setSending(true)
    setError('')
    const { error } = await supabase.from('comments').insert({ painting_id: Number(id), body: text })
    setSending(false)
    if (error) return setError('送出失敗：' + error.message)
    setBody('')
    loadComments()
  }

  async function remove(commentId) {
    if (!confirm('確定要刪除這則留言嗎？')) return
    await supabase.from('comments').delete().eq('id', commentId)
    loadComments()
  }

  if (work === undefined) return <p className="container muted center">載入中…</p>
  if (work === null) return <p className="container center">找不到這件作品。<Link to="/">回到畫廊</Link></p>

  return (
    <main className="container narrow">
      <Link to="/" className="back">← 回到畫廊</Link>

      <div className="frame large">
        <div className="frame-mat">
          <WorkPlayer work={work} />
        </div>
      </div>

      <div className="placard large">
        <span className="placard-no">N° {toRoman(work.id)}</span>
        <h1 className="placard-title">{work.title}</h1>
        <span className="placard-style">
          {[work.year, work.medium, work.dimensions].filter(Boolean).join(' · ') || formatDate(work.created_at)}
        </span>
        <span className="placard-style">
          {[work.categories?.name !== work.medium && work.categories?.name, work.video_url ? '影片' : null].filter(Boolean).join(' · ')}
        </span>
      </div>

      {work.description && <p className="description">{work.description}</p>}

      <section className="guestbook">
        <Ornament />
        <h2>留言簿</h2>
        <p className="muted center">共 {comments.length} 則留言</p>

        <ul>
          {comments.map((c) => {
            const name = c.profiles?.display_name ?? '匿名'
            return (
              <li key={c.id} className="letter">
                <span className="seal" aria-hidden="true">{name.slice(0, 1)}</span>
                <div className="letter-body">
                  <div className="letter-head">
                    <strong>{name}</strong>
                    {c.profiles?.is_admin && <span className="tag">畫家</span>}
                    <span className="muted">{formatDate(c.created_at)}</span>
                    {(user?.id === c.user_id || isAdmin) && (
                      <button className="link-button danger" onClick={() => remove(c.id)}>刪除</button>
                    )}
                  </div>
                  <p>{c.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
        {comments.length === 0 && <p className="muted center">還沒有留言，來寫下第一句吧。</p>}

        {user ? (
          <form onSubmit={submit} className="panel comment-form">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="寫下你的感想…"
              maxLength={1000}
              rows={3}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={sending}>{sending ? '送出中…' : '留下墨跡'}</button>
          </form>
        ) : (
          <p className="muted center">
            <Link to="/login">登入</Link> 或 <Link to="/register">註冊</Link> 後即可留言。
          </p>
        )}
      </section>
    </main>
  )
}
