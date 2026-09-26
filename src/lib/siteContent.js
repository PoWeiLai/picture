import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { HERO, ARTIST } from '../siteConfig'

// 網站內容：資料庫 site_settings 有值就用資料庫的，否則用 siteConfig.js 的預設值
export const DEFAULT_CONTENT = { hero: HERO, artist: ARTIST }

let cache = null
let pending = null
const listeners = new Set()

function merge(rows) {
  const content = { ...DEFAULT_CONTENT }
  for (const row of rows ?? []) {
    if (row.key in content) content[row.key] = { ...content[row.key], ...row.value }
  }
  return content
}

export function loadSiteContent() {
  if (!pending) {
    pending = supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        cache = merge(data)
        listeners.forEach((fn) => fn(cache))
        return cache
      })
  }
  return pending
}

// 後台儲存後呼叫，讓前台立即看到新內容
export function refreshSiteContent() {
  pending = null
  return loadSiteContent()
}

export function useSiteContent() {
  const [content, setContent] = useState(cache ?? DEFAULT_CONTENT)
  useEffect(() => {
    listeners.add(setContent)
    loadSiteContent()
    return () => listeners.delete(setContent)
  }, [])
  return content
}
