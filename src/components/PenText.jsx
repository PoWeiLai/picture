import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// 像用鋼筆一樣一個字一個字寫出文字，筆尖跟著最後寫下的字移動。
// start 為 false 時先不寫（用來讓多段文字依序出現），寫完會呼叫 onDone。
// brush 為 true 時改成毛筆：字像墨暈開一樣出現，跟著寫的是毛筆。finish 為 true 時直接寫完。
export default function PenText({ as: Tag = 'p', text, className = '', speed = 90, start = true, onDone, brush = false, finish = false }) {
  const chars = Array.from(text ?? '')
  const instant = prefersReducedMotion()
  const [written, setCount] = useState(instant ? chars.length : 0)
  // finish 時直接全部寫完
  const count = finish ? chars.length : written

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
    <Tag className={`pen-text ${brush ? 'brush' : ''} ${className}`}>
      <span aria-hidden="true">
        {chars.map((ch, i) => (
          <span key={i} className={i < count ? 'pen-char written' : 'pen-char'}>
            {ch}
            {writing && i === count - 1 && <span className={brush ? 'brush-nib' : 'pen-nib'} />}
          </span>
        ))}
      </span>
      {/* 放在後面，才不會搶走段落首字放大的 ::first-letter */}
      <span className="sr-only">{text}</span>
    </Tag>
  )
}
