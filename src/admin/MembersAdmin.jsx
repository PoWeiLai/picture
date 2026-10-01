import { useCallback, useEffect, useState } from 'react'
import { supabase, formatDate } from '../lib/supabase'
import { AdminPage } from './AdminLayout'

export default function MembersAdmin() {
  const [members, setMembers] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_list_members')
    if (error) setError('讀取會員失敗：' + error.message)
    setMembers(data ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // 任何一位管理員同意即生效
  async function approve(m) {
    if (!confirm(`同意「${m.display_name}」成為管理員嗎？管理員可以修改、刪除網站上的所有內容。`)) return
    const { error } = await supabase.rpc('approve_admin', { target: m.id })
    if (error) return setError('同意失敗：' + error.message)
    setError('')
    load()
  }

  async function reject(m) {
    if (!confirm(`拒絕「${m.display_name}」的管理員申請嗎？`)) return
    const { error } = await supabase.from('admin_requests').delete().eq('user_id', m.id)
    if (error) return setError('拒絕失敗：' + error.message)
    setError('')
    load()
  }

  const pending = (members ?? []).filter((m) => m.requested_at && !m.is_admin)

  return (
    <AdminPage title="會員" subtitle={members ? `共 ${members.length} 位會員${pending.length ? `，${pending.length} 位申請成為管理員` : ''}` : '載入中…'}>
      {error && <p className="error">{error}</p>}
      {pending.length > 0 && (
        <section className="panel">
          <h2>管理員申請（{pending.length}）</h2>
          <ul className="list">
            {pending.map((m) => (
              <li key={m.id}>
                <span>
                  <strong>{m.display_name}</strong> <span className="muted">{m.email} · {formatDate(m.requested_at)}</span>
                  {m.request_note && <><br />{m.request_note}</>}
                </span>
                <span>
                  <button className="link-button" onClick={() => approve(m)}>同意</button>
                  <button className="link-button danger" onClick={() => reject(m)}>拒絕</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>顯示名稱</th>
              <th>Email</th>
              <th>加入日期</th>
              <th>留言數</th>
              <th>身分</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((m) => (
              <tr key={m.id}>
                <td>{m.display_name}</td>
                <td>{m.email}</td>
                <td className="nowrap">{formatDate(m.created_at)}</td>
                <td>{m.comment_count}</td>
                <td>{m.is_admin ? <span className="tag">管理員</span> : m.requested_at ? '申請中' : '會員'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {members?.length === 0 && !error && <p className="muted center">目前還沒有會員。</p>}
      </div>
      <p className="muted">會員忘記密碼時，可以到 Supabase 後台的 Authentication 寄送重設密碼信給對方。</p>
    </AdminPage>
  )
}
