import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, formatDate } from '../lib/supabase'
import { AdminPage } from './AdminLayout'

export default function CommentsAdmin() {
  const [comments, setComments] = useState(null)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, body, reply, replied_at, created_at, painting_id, profiles(display_name), paintings(title)')
      .order('created_at', { ascending: false })
    setComments(data ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || !comments) return comments ?? []
    return comments.filter((c) =>
      [c.body, c.reply, c.profiles?.display_name, c.paintings?.title].some((s) => s?.toLowerCase().includes(q)),
    )
  }, [comments, query])

  // 回覆留言：留空並按確定會刪除回覆
  async function reply(c) {
    const text = prompt(`回覆 ${c.profiles?.display_name ?? '這位訪客'}（留空會刪除回覆）`, c.reply ?? '')
    if (text === null) return
    const value = text.trim() || null
    const { error } = await supabase
      .from('comments')
      .update({ reply: value, replied_at: value ? new Date().toISOString() : null })
      .eq('id', c.id)
    if (error) return alert('回覆失敗：' + error.message)
    load()
  }

  async function remove(c) {
    if (!confirm(`確定刪除 ${c.profiles?.display_name ?? '這位訪客'} 的這則留言嗎？`)) return
    const { error } = await supabase.from('comments').delete().eq('id', c.id)
    if (error) return alert('刪除失敗：' + error.message)
    load()
  }

  return (
    <AdminPage title="留言" subtitle={comments ? `共 ${comments.length} 則留言，${comments.filter((c) => !c.reply).length} 則尚未回覆` : '載入中…'}>
      <div className="admin-toolbar">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜尋留言、回覆、留言者或作品…" aria-label="搜尋留言" />
      </div>
      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>留言者</th>
              <th>內容</th>
              <th>我的回覆</th>
              <th>作品</th>
              <th>日期</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id}>
                <td>{c.profiles?.display_name ?? '匿名'}</td>
                <td className="cell-text">{c.body}</td>
                <td className="cell-text">{c.reply ?? <span className="muted">尚未回覆</span>}</td>
                <td>
                  <Link to={`/paintings/${c.painting_id}`} target="_blank">{c.paintings?.title ?? '—'}</Link>
                </td>
                <td className="nowrap">{formatDate(c.created_at)}</td>
                <td className="row-actions">
                  <button className="link-button" onClick={() => reply(c)}>{c.reply ? '修改回覆' : '回覆'}</button>
                  <button className="link-button danger" onClick={() => remove(c)}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {comments && shown.length === 0 && <p className="muted center">{query ? '沒有符合的留言。' : '目前還沒有留言。'}</p>}
      </div>
    </AdminPage>
  )
}
