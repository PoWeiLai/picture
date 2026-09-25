// 把使用者輸入的影片網址解析成可嵌入的格式。
// 只用解析出的 ID 組 iframe 網址，不會把原始輸入直接放進 iframe。

const YOUTUBE_ID = /^[\w-]{11}$/

export function parseVideo(input) {
  let raw = (input ?? '').trim()
  if (!raw) return null
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw

  let u
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  u.protocol = 'https:'
  const host = u.hostname.replace(/^(www\.|m\.)/, '')

  // YouTube
  let ytId = null
  if (host === 'youtu.be') ytId = u.pathname.slice(1).split('/')[0]
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') ytId = u.searchParams.get('v')
    else ytId = u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1]
  }
  if (ytId && YOUTUBE_ID.test(ytId)) {
    return {
      provider: 'youtube',
      url: `https://www.youtube.com/watch?v=${ytId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`,
      thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    }
  }

  // Vimeo（含不公開影片的 hash）
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = u.pathname.match(/(?:^|\/)(\d+)(?:\/([0-9a-f]+))?\/?$/)
    if (m) {
      const hash = m[2] ?? u.searchParams.get('h')
      const h = hash && /^[0-9a-f]+$/.test(hash) ? `?h=${hash}` : ''
      return {
        provider: 'vimeo',
        url: `https://vimeo.com/${m[1]}${hash ? '/' + hash : ''}`,
        embedUrl: `https://player.vimeo.com/video/${m[1]}${h}`,
        thumbnail: null,
      }
    }
  }

  // Google 雲端硬碟（檔案需設為「知道連結的任何人都能查看」）
  if (host === 'drive.google.com') {
    const id = u.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] ?? u.searchParams.get('id')
    if (id && /^[\w-]{10,}$/.test(id)) {
      return {
        provider: 'gdrive',
        url: `https://drive.google.com/file/d/${id}/view`,
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
        thumbnail: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
      }
    }
  }

  // 影片檔直連
  if (/\.(mp4|webm|ogv|mov)$/i.test(u.pathname)) {
    return { provider: 'file', url: u.href, embedUrl: u.href, thumbnail: null }
  }

  return null
}

export function toRoman(n) {
  const table = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  if (n < 1 || n > 3999) return String(n)
  let out = ''
  for (const [value, numeral] of table) {
    while (n >= value) {
      out += numeral
      n -= value
    }
  }
  return out
}
