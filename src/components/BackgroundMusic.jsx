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
      {/* 媽媽編織的粉紅裙子白鵝；播放時旁邊有跳動的音符，關掉時變灰 */}
      <span className="cute-icon">
        <img src="/icons/music-goose.jpg" alt="" />
        <span className="music-note" aria-hidden="true">♪</span>
      </span>
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
    <div className="music-credit">
      {/* 左右兩邊是媽媽編織的娃娃：左邊上一首、右邊下一首 */}
      <button type="button" className="doll-skip" data-sound="none" onClick={() => skip(-1)} title="上一首" aria-label="上一首">
        <img src="/icons/music-prev-blue.jpg" alt="" />
        <span>上一首</span>
      </button>
      <p>
        背景音樂：{info.title} · {info.performer} ·{' '}
        <a href={info.source} target="_blank" rel="noreferrer">{info.license}</a>
      </p>
      <button type="button" className="doll-skip" data-sound="none" onClick={() => skip(1)} title="下一首" aria-label="下一首">
        <img src="/icons/music-next-red.jpg" alt="" />
        <span>下一首</span>
      </button>
    </div>
  )
}
