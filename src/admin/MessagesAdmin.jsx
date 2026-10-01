import { useCallback, useEffect, useState } from 'react'
import { supabase, formatDate } from '../lib/supabase'
import { AdminPage } from './AdminLayout'

// 「歡迎私訊我」收到的訪客私訊：查看、標記已讀、回覆（開啟 Email）、刪除
export default function MessagesAdmin() {
  const [messages, setMessages] = useState(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    setMessages(data ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleRead(m) {
    const { error } = await supabase.from('messages').update({ is_read: !m.is_read }).eq('id', m.id)
    if (error) return alert('儲存失敗：' + error.message)
    load()
  }

  async function remove(m) {
    if (!confirm(`確定刪除 ${m.name} 的這則私訊嗎？`)) return
    const { error } = await supabase.from('messages').delete().eq('id', m.id)
    if (error) return alert('刪除失敗：' + error.message)
    load()
  }

  const unread = messages?.filter((m) => !m.is_read).length ?? 0

  return (
    <AdminPage title="私訊" subtitle={messages ? `共 ${messages.length} 則，${unread} 則未讀` : '載入中…'}>
      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>寄件人</th>
              <th>內容</th>
              <th>日期</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {(messages ?? []).map((m) => (
              <tr key={m.id} className={m.is_read ? 'muted' : ''}>
                <td>
                  {!m.is_read && <strong>● </strong>}
                  {m.name}
                  <br />
                  <a href={`mailto:${m.email}`}>{m.email}</a>
                </td>
                <td className="cell-text">{m.body}</td>
                <td className="nowrap">{formatDate(m.created_at)}</td>
                <td className="row-actions">
                  <a className="link-button" href={`mailto:${m.email}?subject=${encodeURIComponent('回覆：你在網站上的私訊')}`}>回覆</a>
                  <button className="link-button" onClick={() => toggleRead(m)}>{m.is_read ? '標為未讀' : '標為已讀'}</button>
                  <button className="link-button danger" onClick={() => remove(m)}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {messages && messages.length === 0 && <p className="muted center">目前還沒有私訊。</p>}
      </div>
    </AdminPage>
  )
}
