import { useCallback, useEffect, useState } from 'react'
import { supabase, formatDate } from '../lib/supabase'
import { useAuth } from '../AuthContext'

// 帳戶頁：一般會員申請成為管理員（可以進後台編輯、上傳照片），由現任管理員在後台「會員」頁核准
export default function AdminRequest() {
  const { user, isAdmin } = useAuth()
  const [request, setRequest] = useState(undefined)
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('admin_requests').select('*').eq('user_id', user.id).maybeSingle()
    setRequest(data ?? null)
  }, [user.id])

  useEffect(() => {
    if (!isAdmin) load()
  }, [isAdmin, load])

  if (isAdmin || request === undefined) return null

  async function apply(e) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.from('admin_requests').insert({ note: note.trim() })
    setBusy(false)
    if (error) return setMsg('申請失敗：' + error.message)
    setMsg('')
    setNote('')
    load()
  }

  async function cancel() {
    if (!confirm('確定取消管理員申請嗎？')) return
    const { error } = await supabase.from('admin_requests').delete().eq('user_id', user.id)
    if (error) return setMsg('取消失敗：' + error.message)
    load()
  }

  return (
    <section className="panel form">
      <h2>申請成為管理員</h2>
      {request ? (
        <>
          <p>已於 {formatDate(request.created_at)} 送出申請，任何一位管理員同意後即生效。同意後重新整理頁面，就能從上方「進入後台」編輯作品、上傳照片。</p>
          {request.note && <p className="muted">申請說明：{request.note}</p>}
          {msg && <p className="error">{msg}</p>}
          <button type="button" onClick={cancel}>取消申請</button>
        </>
      ) : (
        <form onSubmit={apply} className="form">
          <p className="muted">管理員可以進入後台，新增、編輯作品，以及上傳生活點滴、布展活動的照片。</p>
          <label>
            申請說明（選填，例如你是誰、想幫忙什麼）
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} />
          </label>
          {msg && <p className="error">{msg}</p>}
          <button type="submit" disabled={busy}>{busy ? '送出中…' : '送出申請'}</button>
        </form>
      )}
    </section>
  )
}
