import { useCallback, useEffect, useState } from 'react'
import { supabase, formatDate } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import { AdminPage } from './AdminLayout'

export default function MembersAdmin() {
  const { user } = useAuth()
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

  async function toggleAdmin(m) {
    const next = !m.is_admin
    const msg = next
      ? `確定讓「${m.display_name}」成為管理員嗎？管理員可以修改、刪除網站上的所有內容。`
      : `確定取消「${m.display_name}」的管理員身分嗎？`
    if (!confirm(msg)) return
    const { error } = await supabase.rpc('set_admin', { target: m.id, value: next })
    if (error) return setError('設定失敗：' + error.message)
    setError('')
    load()
  }

  return (
    <AdminPage title="會員" subtitle={members ? `共 ${members.length} 位會員` : '載入中…'}>
      {error && <p className="error">{error}</p>}
      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>顯示名稱</th>
              <th>Email</th>
              <th>加入日期</th>
              <th>留言數</th>
              <th>身分</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((m) => (
              <tr key={m.id}>
                <td>{m.display_name}</td>
                <td>{m.email}</td>
                <td className="nowrap">{formatDate(m.created_at)}</td>
                <td>{m.comment_count}</td>
                <td>{m.is_admin ? <span className="tag">管理員</span> : '會員'}</td>
                <td className="row-actions">
                  {m.id !== user?.id && (
                    <button className="link-button" onClick={() => toggleAdmin(m)}>
                      {m.is_admin ? '取消管理員' : '設為管理員'}
                    </button>
                  )}
                </td>
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
