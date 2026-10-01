import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TRACKS, setPage, skip, setMusicEnabled, musicState, onMusicChange, startOnFirstInteraction } from '../lib/music'

// 整站共用一份播放清單；進後台時暫停
export function useBackgroundMusic() {
  const { pathname } = useLocation()
  useEffect(() => startOnFirstInteraction(), [])
  useEffect(() => setPage(pathname), [pathname])
}

function useMusic() {
  const [state, setState] = useState(musicState)
  useEffect(() => onMusicChange(setState), [])
  return state
}

export function MusicToggle() {
  const { enabled, track } = useMusic()
  const info = track && TRACKS[track]
  return (
    <button
      type="button"
      className={enabled ? 'cute-button music-button playing' : 'cute-button music-button'}
      data-sound="none"
      onClick={() => setMusicEnabled(!enabled)}
      aria-pressed={enabled}
      title={info ? `${enabled ? '正在播放' : '已關閉'}：${info.title}` : '背景音樂'}
    >
      {/* 戴著音符的小圓臉 */}
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="34" r="22" fill="#ffd6e0" stroke="#8a4b5c" strokeWidth="2.5" />
        <circle cx="24" cy="32" r="3" fill="#5a2e3a" />
        <circle cx="40" cy="32" r="3" fill="#5a2e3a" />
        <circle cx="18" cy="40" r="3.5" fill="#ff9fb5" opacity="0.8" />
        <circle cx="46" cy="40" r="3.5" fill="#ff9fb5" opacity="0.8" />
        {enabled ? (
          <path d="M26 41q6 6 12 0" fill="none" stroke="#5a2e3a" strokeWidth="2.5" strokeLinecap="round" />
        ) : (
          <path d="M27 43h10" fill="none" stroke="#5a2e3a" strokeWidth="2.5" strokeLinecap="round" />
        )}
        <g className="music-note">
          <path d="M46 6v14" stroke="#8a4b5c" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 6q6 1 8 6" fill="none" stroke="#8a4b5c" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="43" cy="20" rx="4" ry="3" fill="#8a4b5c" />
        </g>
      </svg>
      <span className="cute-label">音樂{enabled ? '開' : '關'}</span>
    </button>
  )
}

// 頁尾的曲目與授權標示
export function MusicCredit() {
  const { track } = useMusic()
  const info = track && TRACKS[track]
  if (!info) return null
  return (
    <p className="music-credit">
      背景音樂：{info.title} · {info.performer} ·{' '}
      <a href={info.source} target="_blank" rel="noreferrer">{info.license}</a> ·{' '}
      <button type="button" className="link-button" data-sound="none" onClick={() => skip(1)}>下一首 ⏭</button>
    </p>
  )
}
