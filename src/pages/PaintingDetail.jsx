import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { supabase, formatDate } from '../lib/supabase'
import { toRoman } from '../lib/video'
import { useAuth } from '../AuthContext'
import { WorkPlayer } from '../components/WorkMedia'
import { pour } from '../lib/sounds'
import ScrollPaper from '../components/ScrollPaper'
import Ornament from '../components/Ornament'

export default function PaintingDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  const [work, setWork] = useState(undefined)
  const [comments, setComments] = useState([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  // 管理員正在回覆的留言 id 與回覆內容
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, body, reply, replied_at, created_at, user_id, profiles(display_name, is_admin)')
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
    pour()
    loadComments()
  }

  function startReply(c) {
    setReplyingId(c.id)
    setReplyText(c.reply ?? '')
  }

  // 管理員回覆留言；text 為 null 代表刪除回覆
  async function saveReply(commentId, text) {
    const reply = text?.trim() || null
    const { error } = await supabase
      .from('comments')
      .update({ reply, replied_at: reply ? new Date().toISOString() : null })
      .eq('id', commentId)
    if (error) return alert('回覆失敗：' + error.message)
    setReplyingId(null)
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

      <div key={work.id} className="frame large hang">
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

      {work.description && (
        <ScrollPaper key={work.id} className="description-scroll">
          <p className="description">{work.description}</p>
        </ScrollPaper>
      )}

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
                    {isAdmin && replyingId !== c.id && (
                      <button className="link-button" onClick={() => startReply(c)}>{c.reply ? '修改回覆' : '回覆'}</button>
                    )}
                    {(user?.id === c.user_id || isAdmin) && (
                      <button className="link-button danger" onClick={() => remove(c.id)}>刪除</button>
                    )}
                  </div>
                  <p>{c.body}</p>
                  {c.reply && replyingId !== c.id && (
                    <div className="reply">
                      <div className="letter-head">
                        <strong>畫家回覆</strong>
                        {c.replied_at && <span className="muted">{formatDate(c.replied_at)}</span>}
                        {isAdmin && (
                          <button
                            className="link-button danger"
                            onClick={() => confirm('確定刪除這則回覆嗎？') && saveReply(c.id, null)}
                          >
                            刪除回覆
                          </button>
                        )}
                      </div>
                      <p>{c.reply}</p>
                    </div>
                  )}
                  {replyingId === c.id && (
                    <form
                      className="reply-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        saveReply(c.id, replyText)
                      }}
                    >
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`回覆 ${name}…`}
                        maxLength={1000}
                        rows={2}
                        required
                        autoFocus
                      />
                      <div className="reply-actions">
                        <button type="submit">送出回覆</button>
                        <button type="button" className="link-button" onClick={() => setReplyingId(null)}>取消</button>
                      </div>
                    </form>
                  )}
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
            <Link to="/login" state={{ from: location.pathname }}>登入</Link> 或{' '}
            <Link to="/register" state={{ from: location.pathname }}>註冊會員</Link> 後即可留言。
          </p>
        )}
      </section>
    </main>
  )
}
