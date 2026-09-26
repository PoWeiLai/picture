// 背景音樂：每個頁面播放不同的巴洛克樂曲。
// 錄音都來自維基共享資源（公有領域或創用 CC 授權），檔案放在 public/music/，
// 授權要求標示出處，所以頁尾會顯示目前播放的曲目與授權。

const STORAGE_KEY = 'gallery-music'
const VOLUME = 0.35
const FADE_MS = 900

export const TRACKS = {
  vivaldi: {
    src: '/music/vivaldi-spring.mp3',
    title: '韋瓦第〈四季・春〉第一樂章',
    performer: 'John Harrison（小提琴）',
    license: 'CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:Vivaldi_-_Four_Seasons_1_Spring_mvt_1_Allegro_-_John_Harrison_violin.oga',
  },
  air: {
    src: '/music/bach-air.mp3',
    title: '巴哈〈G 弦之歌〉',
    performer: 'Joel Belov（小提琴）、Robert Gayler（鋼琴），1920 年錄音',
    license: '公有領域',
    source: 'https://commons.wikimedia.org/wiki/File:Air_(Bach).ogg',
  },
  handel: {
    src: '/music/handel-water-music.mp3',
    title: '韓德爾〈水上音樂〉小步舞曲',
    performer: '78 轉唱片錄音',
    license: 'CC BY-SA 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:6-George_Frideric_Handel_-_Water_Music_Suite_in_F_major_(Minuet)_HWV348.ogg',
  },
  canon: {
    src: '/music/pachelbel-canon.mp3',
    title: '帕海貝爾〈D 大調卡農〉',
    performer: 'Kevin MacLeod',
    license: 'CC BY 3.0',
    source: 'https://commons.wikimedia.org/wiki/File:Kevin_MacLeod_-_Canon_in_D_Major.ogg',
  },
  goldberg: {
    src: '/music/bach-goldberg-aria.mp3',
    title: '巴哈〈郭德堡變奏曲〉詠嘆調',
    performer: 'Musopen',
    license: 'CC0',
    source: 'https://commons.wikimedia.org/wiki/File:Bach,_Goldberg_Variations,_Aria_(Musopen_version).ogg',
  },
}

// 依網址決定曲目；後台不播音樂
export function trackFor(pathname) {
  if (pathname.startsWith('/admin')) return null
  if (pathname.startsWith('/paintings/')) return 'air'
  if (pathname.startsWith('/studio')) return 'handel'
  if (pathname.startsWith('/about')) return 'canon'
  if (['/login', '/register', '/account'].some((p) => pathname.startsWith(p))) return 'goldberg'
  return 'vivaldi'
}

let audio = null
let current = null // 目前頁面要播的曲目
let enabled = readEnabled()
let fadeTimer = null
const listeners = new Set()

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

function notify() {
  listeners.forEach((fn) => fn({ enabled, track: current }))
}

export function onMusicChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function musicState() {
  return { enabled, track: current }
}

function element() {
  if (!audio) {
    audio = new Audio()
    audio.loop = true
    audio.preload = 'none'
    audio.volume = 0
  }
  return audio
}

function fadeTo(target, done) {
  const el = element()
  clearInterval(fadeTimer)
  const steps = 18
  const start = el.volume
  let i = 0
  fadeTimer = setInterval(() => {
    i++
    el.volume = Math.min(1, Math.max(0, start + ((target - start) * i) / steps))
    if (i >= steps) {
      clearInterval(fadeTimer)
      done?.()
    }
  }, FADE_MS / steps)
}

// 瀏覽器要求使用者先和頁面互動才能播放聲音；還不能播時就等下一次點擊再試
function play() {
  const el = element()
  if (!enabled || !current) return
  const src = TRACKS[current].src
  if (!el.src.endsWith(src)) {
    el.src = src
    el.volume = 0
  }
  el.play().then(() => fadeTo(VOLUME)).catch(() => {})
}

export function setTrack(key) {
  if (key === current) return
  current = key
  notify()
  const el = element()
  if (el.paused || !el.src) return play()
  fadeTo(0, () => {
    el.pause()
    play()
  })
}

export function setMusicEnabled(value) {
  enabled = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
  } catch {
    // 無法儲存時只在這次瀏覽生效
  }
  notify()
  if (value) play()
  else fadeTo(0, () => element().pause())
}

// 第一次點擊或按鍵時開始播放
export function startOnFirstInteraction() {
  const start = () => {
    if (element().paused) play()
  }
  window.addEventListener('pointerdown', start)
  window.addEventListener('keydown', start)
  return () => {
    window.removeEventListener('pointerdown', start)
    window.removeEventListener('keydown', start)
  }
}
