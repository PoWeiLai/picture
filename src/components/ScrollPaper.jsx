import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'
import { unroll } from '../lib/sounds'

// 捲軸：捲進畫面時自動往下展開；點擊木軸可以捲起或再次展開
export default function ScrollPaper({ children, className = '' }) {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setOpen(true)
      return
    }
    let timer
    const openNow = () => {
      observer.disconnect()
      clearTimeout(timer)
      setOpen(true)
      unroll()
    }
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && openNow(), { threshold: 0.2 })
    observer.observe(el)
    // 一進頁面就在畫面內的捲軸，稍等片刻（讓畫框先落下）再展開
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) timer = setTimeout(openNow, 500)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [])

  function toggle() {
    if (!open) unroll()
    setOpen(!open)
  }

  return (
    <div ref={ref} className={`scroll-paper ${open ? 'open' : ''} ${className}`}>
      <button
        type="button"
        className="scroll-rod"
        data-sound="none"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? '捲起' : '展開'}
      />
      <div className="scroll-sheet">
        <div className="scroll-content">{children}</div>
      </div>
      <button
        type="button"
        className="scroll-rod bottom"
        data-sound="none"
        onClick={toggle}
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
