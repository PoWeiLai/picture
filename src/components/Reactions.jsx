import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// 像 Facebook 一樣的表情；不用登入也能按，每位訪客對每件作品只留一個表情
const KINDS = [
  { kind: 'like', emoji: '👍', label: '讚' },
  { kind: 'love', emoji: '❤️', label: '大心' },
  { kind: 'care', emoji: '🥰', label: '加油' },
  { kind: 'haha', emoji: '😆', label: '哈' },
  { kind: 'wow', emoji: '😮', label: '哇' },
  { kind: 'sad', emoji: '😢', label: '感動' },
]

// 瀏覽器自己的訪客代號，存在 localStorage；無法存取時每次都是新的（仍可按，只是不記得按過）
function visitorId() {
  try {
    let id = localStorage.getItem('visitor_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('visitor_id', id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export default function Reactions({ paintingId }) {
  const [state, setState] = useState(null)
  const [busy, setBusy] = useState(false)
  const [visitor] = useState(visitorId)

  useEffect(() => {
    supabase
      .rpc('get_reactions', { p_painting: Number(paintingId), p_visitor: visitor })
      .then(({ data, error }) => setState(error ? null : data))
  }, [paintingId, visitor])

  // 資料庫還沒有表情功能（或預覽模式）時整列不顯示
  if (!state) return null

  async function choose(kind) {
    if (busy) return
    const next = state.mine === kind ? null : kind
    setBusy(true)
    const { data, error } = await supabase.rpc('set_reaction', {
      p_painting: Number(paintingId),
      p_visitor: visitor,
      p_kind: next,
    })
    setBusy(false)
    if (!error) setState(data)
  }

  const total = Object.values(state.counts).reduce((a, b) => a + b, 0)

  return (
    <div className="reactions">
      <div className="reaction-buttons">
        {KINDS.map(({ kind, emoji, label }) => (
          <button
            key={kind}
            type="button"
            className={'reaction' + (state.mine === kind ? ' chosen' : '')}
            onClick={() => choose(kind)}
            disabled={busy}
            title={label}
            aria-pressed={state.mine === kind}
          >
            <span className="reaction-emoji">{emoji}</span>
            <span className="reaction-label">{label}</span>
            {state.counts[kind] > 0 && <span className="reaction-count">{state.counts[kind]}</span>}
          </button>
        ))}
      </div>
      <p className="muted center">{total > 0 ? `共 ${total} 人表達心情` : '按個表情，告訴畫家你的感受'}</p>
    </div>
  )
}
