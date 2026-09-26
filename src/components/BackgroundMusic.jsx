import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TRACKS, trackFor, setTrack, setMusicEnabled, musicState, onMusicChange, startOnFirstInteraction } from '../lib/music'

// 換頁時切換成該頁的曲目
export function useBackgroundMusic() {
  const { pathname } = useLocation()
  useEffect(() => startOnFirstInteraction(), [])
  useEffect(() => setTrack(trackFor(pathname)), [pathname])
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
      className="link-button sound-toggle"
      data-sound="none"
      onClick={() => setMusicEnabled(!enabled)}
      aria-pressed={enabled}
      title={info ? `${enabled ? '正在播放' : '已關閉'}：${info.title}` : '背景音樂'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 17V5l11-2v12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="6.5" cy="17.5" r="2.5" fill="currentColor" />
        <circle cx="17.5" cy="15.5" r="2.5" fill="currentColor" />
      </svg>
      音樂{enabled ? '開' : '關'}
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
      <a href={info.source} target="_blank" rel="noreferrer">{info.license}</a>
    </p>
  )
}
