import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import Ornament from '../components/Ornament'

// 「歡迎私訊我」：訪客不用登入就能留下訊息，畫家在後台「私訊」頁查看
export default function Contact() {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase
      .from('messages')
      .insert({ name: name.trim(), email: email.trim(), body: body.trim() })
    setBusy(false)
    if (error) return setError('送出失敗：' + error.message)
    setSent(true)
    setBody('')
  }

  return (
    <main className="container narrow">
      <header className="page-title">
        <p className="eyebrow">Scrivimi</p>
        <h1>歡迎私訊我</h1>
        <Ornament />
        <p className="tagline">想聊聊作品、邀展或合作，都歡迎留言給我。</p>
      </header>

      {sent ? (
        <div className="panel center">
          <p>謝謝你的訊息！我看到後會盡快回覆到你的 Email。</p>
          <button type="button" onClick={() => setSent(false)}>再寫一則</button>
        </div>
      ) : (
        <form onSubmit={submit} className="panel form">
          <label>
            你的名字
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} required autoComplete="name" />
          </label>
          <label>
            Email（我會回覆到這裡）
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} required autoComplete="email" />
          </label>
          <label>
            想說的話
            <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} rows={6} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? '送出中…' : '送出訊息'}</button>
        </form>
      )}
    </main>
  )
}
