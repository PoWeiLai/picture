// 以 Web Audio API 即時合成的介面音效（不需要音效檔）：
// clink 杯子放上瓷盤、pageFlip 翻頁、wind 風聲、pour 倒水。

const STORAGE_KEY = 'gallery-sound'
let ctx = null
let master = null
let noise = null
let enabled = readEnabled()
const listeners = new Set()

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function isSoundEnabled() {
  return enabled
}

export function setSoundEnabled(value) {
  enabled = value
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off')
  } catch {
    // 無法儲存時只在這次瀏覽生效
  }
  listeners.forEach((fn) => fn(value))
}

export function onSoundChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// 瀏覽器要求在使用者互動後才能發聲，所以第一次播放時才建立 AudioContext
function audio() {
  if (!enabled) return null
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function noiseSource(c) {
  const src = c.createBufferSource()
  src.buffer = noise
  src.loop = true
  return src
}

function envelope(c, peak, attack, release, at = c.currentTime) {
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + release)
  return g
}

// 杯子放上瓷盤：瓷器的非諧波泛音 + 一聲輕微的回彈
export function clink() {
  const c = audio()
  if (!c) return
  const tap = (at, strength) => {
    const partials = [
      [2489, 1, 0.5],
      [3730, 0.55, 0.35],
      [5120, 0.3, 0.22],
      [6930, 0.16, 0.14],
    ]
    for (const [freq, amp, decay] of partials) {
      const osc = c.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.01)
      const g = envelope(c, 0.09 * amp * strength, 0.002, decay, at)
      osc.connect(g).connect(master)
      osc.start(at)
      osc.stop(at + decay + 0.05)
    }
    // 接觸瞬間的「喀」
    const n = noiseSource(c)
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3200
    bp.Q.value = 1.2
    const g = envelope(c, 0.12 * strength, 0.001, 0.025, at)
    n.connect(bp).connect(g).connect(master)
    n.start(at, Math.random())
    n.stop(at + 0.05)
  }
  const now = c.currentTime
  tap(now, 1)
  tap(now + 0.075, 0.35)
}

// 翻頁：紙張摩擦的沙沙聲，頻率上揚後落下
export function pageFlip() {
  const c = audio()
  if (!c) return
  const now = c.currentTime
  const dur = 0.42
  const n = noiseSource(c)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.9
  bp.frequency.setValueAtTime(900, now)
  bp.frequency.exponentialRampToValueAtTime(4200, now + dur * 0.55)
  bp.frequency.exponentialRampToValueAtTime(1800, now + dur)
  const g = c.createGain()
  // 紙張抖動的起伏
  const curve = new Float32Array(32)
  for (let i = 0; i < curve.length; i++) {
    const x = i / (curve.length - 1)
    const shape = Math.sin(Math.PI * Math.pow(x, 0.7))
    const flutter = 0.75 + 0.25 * Math.sin(x * 40)
    curve[i] = Math.max(0.0001, 0.22 * shape * flutter)
  }
  g.gain.setValueCurveAtTime(curve, now, dur)
  n.connect(bp).connect(g).connect(master)
  n.start(now, Math.random())
  n.stop(now + dur + 0.05)

  // 紙頁落下的輕拍
  const slap = noiseSource(c)
  const hp = c.createBiquadFilter()
  hp.type = 'lowpass'
  hp.frequency.value = 1400
  const sg = envelope(c, 0.18, 0.004, 0.08, now + dur - 0.02)
  slap.connect(hp).connect(sg).connect(master)
  slap.start(now + dur - 0.02, Math.random())
  slap.stop(now + dur + 0.12)
}

// 風聲：低頻噪音緩緩湧起再散去
export function wind() {
  const c = audio()
  if (!c) return
  const now = c.currentTime
  const dur = 1.3
  const n = noiseSource(c)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 2.2
  bp.frequency.setValueAtTime(380, now)
  bp.frequency.linearRampToValueAtTime(820, now + dur * 0.45)
  bp.frequency.linearRampToValueAtTime(450, now + dur)
  // 陣風的起伏
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 2.3
  lfoGain.gain.value = 160
  lfo.connect(lfoGain).connect(bp.frequency)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.linearRampToValueAtTime(0.32, now + dur * 0.4)
  g.gain.linearRampToValueAtTime(0.0001, now + dur)
  n.connect(bp).connect(g).connect(master)
  n.start(now, Math.random())
  lfo.start(now)
  n.stop(now + dur + 0.05)
  lfo.stop(now + dur + 0.05)
}

// 倒水：水流聲 + 音高隨著「杯子變滿」而上升的氣泡聲
export function pour() {
  const c = audio()
  if (!c) return
  const now = c.currentTime
  const dur = 1.4

  const n = noiseSource(c)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 3
  for (let t = 0; t < dur; t += 0.025) {
    const rise = 700 + (t / dur) * 900
    bp.frequency.setValueAtTime(rise * (0.8 + Math.random() * 0.4), now + t)
  }
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.linearRampToValueAtTime(0.16, now + 0.08)
  g.gain.setValueAtTime(0.16, now + dur - 0.25)
  g.gain.linearRampToValueAtTime(0.0001, now + dur)
  n.connect(bp).connect(g).connect(master)
  n.start(now, Math.random())
  n.stop(now + dur + 0.05)

  for (let i = 0; i < 26; i++) {
    const at = now + Math.random() * (dur - 0.15)
    const base = 420 + ((at - now) / dur) * 520 + Math.random() * 180
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(base, at)
    osc.frequency.exponentialRampToValueAtTime(base * 1.7, at + 0.035)
    const bg = envelope(c, 0.05 + Math.random() * 0.04, 0.004, 0.04, at)
    osc.connect(bg).connect(master)
    osc.start(at)
    osc.stop(at + 0.06)
  }
}

export const SOUNDS = { clink, pageFlip, wind, pour }
