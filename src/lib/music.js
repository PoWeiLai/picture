// 背景音樂：整個網站共用一份播放清單，換頁時不中斷，一首播完自動接下一首，全部播完從頭再來。
// 古典樂錄音來自維基共享資源（公有領域或創用 CC 授權），授權要求標示出處，所以頁尾會顯示目前播放的曲目與授權。
// 檔案都放在 public/music/。

const STORAGE_KEY = 'gallery-music'
const VOLUME = 0.35
const FADE_MS = 900

const HARRISON = {
  performer: 'John Harrison（小提琴）',
  license: 'CC BY-SA 4.0',
}
const commons = (file) => `https://commons.wikimedia.org/wiki/File:${file}`

export const TRACKS = {
  'love-song': {
    src: '/music/love-song.m4a',
    title: '情歌',
    performer: 'Po-Wei Lai',
    license: 'YouTube',
    source: 'https://www.youtube.com/watch?v=hkhr4cEY4fE',
  },
  'always-with-me': {
    src: '/music/always-with-me.m4a',
    title: '宮崎駿〈Always with me〉',
    performer: 'Po-Wei Lai',
    license: 'YouTube',
    source: 'https://www.youtube.com/watch?v=Gqk6ou9NgF8',
  },
  'kikis-delivery-service': {
    src: '/music/kikis-delivery-service.m4a',
    title: '宮崎駿〈魔女宅急便〉',
    performer: 'Po-Wei Lai',
    license: 'YouTube',
    source: 'https://www.youtube.com/watch?v=ubhkaERcqdw',
  },
  'spring-1': { src: '/music/vivaldi-spring-1.mp3', title: '韋瓦第〈四季・春〉第一樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_1_Spring_mvt_1_Allegro_-_John_Harrison_violin.oga') },
  'spring-2': { src: '/music/vivaldi-spring-2.mp3', title: '韋瓦第〈四季・春〉第二樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_1_Spring_mvt_2_Largo_-_John_Harrison_violin.oga') },
  'spring-3': { src: '/music/vivaldi-spring-3.mp3', title: '韋瓦第〈四季・春〉第三樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_1_Spring_mvt_3_Allegro_-_John_Harrison_violin.oga') },
  'summer-1': { src: '/music/vivaldi-summer-1.mp3', title: '韋瓦第〈四季・夏〉第一樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_2_Summer_mvt_1_Allegro_non_molto_-_John_Harrison_violin.oga') },
  'summer-2': { src: '/music/vivaldi-summer-2.mp3', title: '韋瓦第〈四季・夏〉第二樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_2_Summer_mvt_2_Adagio_-_John_Harrison_violin.oga') },
  'summer-3': { src: '/music/vivaldi-summer-3.mp3', title: '韋瓦第〈四季・夏〉第三樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_2_Summer_mvt_3_Presto_-_John_Harrison_violin.oga') },
  'autumn-1': { src: '/music/vivaldi-autumn-1.mp3', title: '韋瓦第〈四季・秋〉第一樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_3_Autumn_mvt_1_Allegro_-_John_Harrison_violin.oga') },
  'autumn-2': { src: '/music/vivaldi-autumn-2.mp3', title: '韋瓦第〈四季・秋〉第二樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_3_Autumn_mvt_2_Adagio_molto_-_John_Harrison_violin.oga') },
  'autumn-3': { src: '/music/vivaldi-autumn-3.mp3', title: '韋瓦第〈四季・秋〉第三樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_3_Autumn_mvt_3_Allegro_-_John_Harrison_violin.oga') },
  'winter-1': { src: '/music/vivaldi-winter-1.mp3', title: '韋瓦第〈四季・冬〉第一樂章', ...HARRISON, source: commons('Vivaldi_-_Four_Seasons_4_Winter_mvt_1_Allegro_non_molto_-_John_Harrison_violin.oga') },
  'winter-2': { src: '/music/vivaldi-winter-2.mp3', title: '韋瓦第〈四季・冬〉第二樂章', ...HARRISON, source: commons('11_-_Vivaldi_Winter_mvt_2_Largo_-_John_Harrison_violin.ogg') },
  'winter-3': { src: '/music/vivaldi-winter-3.mp3', title: '韋瓦第〈四季・冬〉第三樂章', ...HARRISON, source: commons('12_-_Vivaldi_Winter_mvt_3_Allegro_-_John_Harrison_violin.ogg') },
  air: {
    src: '/music/bach-air.mp3',
    title: '巴哈〈G 弦之歌〉',
    performer: 'Joel Belov（小提琴）、Robert Gayler（鋼琴），1920 年錄音',
    license: '公有領域',
    source: commons('Air_(Bach).ogg'),
  },
  handel: {
    src: '/music/handel-water-music.mp3',
    title: '韓德爾〈水上音樂〉小步舞曲',
    performer: '78 轉唱片錄音',
    license: 'CC BY-SA 3.0',
    source: commons('6-George_Frideric_Handel_-_Water_Music_Suite_in_F_major_(Minuet)_HWV348.ogg'),
  },
  canon: {
    src: '/music/pachelbel-canon.mp3',
    title: '帕海貝爾〈D 大調卡農〉',
    performer: 'Kevin MacLeod',
    license: 'CC BY 3.0',
    source: commons('Kevin_MacLeod_-_Canon_in_D_Major.ogg'),
  },
  goldberg: {
    src: '/music/bach-goldberg-aria.mp3',
    title: '巴哈〈郭德堡變奏曲〉詠嘆調',
    performer: 'Musopen',
    license: 'CC0',
    source: commons('Bach,_Goldberg_Variations,_Aria_(Musopen_version).ogg'),
  },
}

// 播放順序：照 TRACKS 的順序
const PLAYLIST = Object.keys(TRACKS)

let audio = null
let index = 0 // 目前在播放清單的第幾首
let paused = false // 後台不播音樂
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

function currentTrack() {
  return paused ? null : PLAYLIST[index]
}

function notify() {
  listeners.forEach((fn) => fn({ enabled, track: currentTrack() }))
}

export function onMusicChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function musicState() {
  return { enabled, track: currentTrack() }
}

function element() {
  if (!audio) {
    audio = new Audio()
    audio.preload = 'none'
    audio.volume = 0
    // 一首播完接下一首
    audio.addEventListener('ended', () => skip(1))
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
  if (!enabled || paused) return
  const src = TRACKS[PLAYLIST[index]].src
  if (!el.src.endsWith(src)) {
    el.src = src
    el.volume = 0
  }
  el.play().then(() => fadeTo(VOLUME)).catch(() => {})
}

// 換到下一首（step = 1）或上一首（step = -1）
export function skip(step = 1) {
  index = (index + step + PLAYLIST.length) % PLAYLIST.length
  notify()
  const el = element()
  if (el.paused) return play()
  fadeTo(0, () => {
    el.pause()
    play()
  })
}

// 換頁時呼叫：後台暫停，其他頁面繼續播同一份清單（不重新開始）
export function setPage(pathname) {
  const nextPaused = pathname.startsWith('/admin')
  if (nextPaused === paused) return
  paused = nextPaused
  notify()
  if (paused) fadeTo(0, () => element().pause())
  else play()
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
