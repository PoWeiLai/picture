import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// 像用鋼筆一樣一個字一個字寫出文字，筆尖跟著最後寫下的字移動。
// start 為 false 時先不寫（用來讓多段文字依序出現），寫完會呼叫 onDone。
export default function PenText({ as: Tag = 'p', text, className = '', speed = 90, start = true, onDone }) {
  const chars = Array.from(text ?? '')
  const instant = prefersReducedMotion()
  const [count, setCount] = useState(instant ? chars.length : 0)

  useEffect(() => {
    if (!start) return
    if (count >= chars.length) {
      onDone?.()
      return
    }
    // 標點停頓久一點，像寫字時提筆
    const pause = /[，。、；：！？,.]/.test(chars[count - 1] ?? '') ? speed * 3 : speed
    const timer = setTimeout(() => setCount((n) => n + 1), pause)
    return () => clearTimeout(timer)
  }, [start, count, chars.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const writing = start && count < chars.length

  return (
    <Tag className={`pen-text ${className}`}>
      <span aria-hidden="true">
        {chars.map((ch, i) => (
          <span key={i} className={i < count ? 'pen-char written' : 'pen-char'}>
            {ch}
            {writing && i === count - 1 && <span className="pen-nib" />}
          </span>
        ))}
      </span>
      {/* 放在後面，才不會搶走段落首字放大的 ::first-letter */}
      <span className="sr-only">{text}</span>
    </Tag>
  )
}
