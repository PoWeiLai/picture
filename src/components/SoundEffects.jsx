import { useEffect, useState } from 'react'
import { SOUNDS, clink, isSoundEnabled, setSoundEnabled, onSoundChange } from '../lib/sounds'

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

export function SoundToggle() {
  const [on, setOn] = useState(isSoundEnabled)
  useEffect(() => onSoundChange(setOn), [])

  function toggle() {
    const next = !on
    setSoundEnabled(next)
    if (next) clink()
  }

  return (
    <button
      type="button"
      className="link-button sound-toggle"
      data-sound={on ? 'clink' : 'none'}
      onClick={toggle}
      aria-pressed={on}
      title={on ? '關閉音效' : '開啟音效'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? (
          <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
      音效{on ? '開' : '關'}
    </button>
  )
}
