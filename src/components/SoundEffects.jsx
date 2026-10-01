import { useEffect } from 'react'
import { SOUNDS } from '../lib/sounds'

// 決定點擊某個元素要發出哪種聲音：
// data-sound 指定（none 代表不發聲）> 分頁/分類切換是風聲 > 換頁不發聲 > 其他按鈕是杯盤聲
function soundFor(el) {
  if (el.dataset.sound) return el.dataset.sound
  if (el.matches('.tab, .chip')) return 'wind'
  if (el.tagName === 'A') {
    const href = el.getAttribute('href') ?? ''
    if (href.startsWith('#')) return 'wind'
    if (href.startsWith('/') && el.target !== '_blank') {
      const target = new URL(href, window.location.origin)
      return target.pathname === window.location.pathname ? 'wind' : 'none'
    }
    return 'clink'
  }
  return 'clink'
}

export function useSoundEffects() {
  useEffect(() => {
    function onClick(e) {
      const el = e.target.closest('[data-sound], button, a, label.dropzone')
      if (!el || el.disabled) return
      SOUNDS[soundFor(el)]?.()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])
}
