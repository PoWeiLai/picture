import { createClient } from '@supabase/supabase-js'
import { demoClient } from './demoClient'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 沒有設定 Supabase 時進入唯讀的預覽模式
export const isDemo = !(url && anonKey)

export const supabase = isDemo ? demoClient : createClient(url, anonKey)

// 以 / 開頭的路徑是網站 public/ 內的圖片，其餘是 Supabase Storage 的檔案
export function imageUrl(path) {
  if (path.startsWith('/')) return path
  return supabase.storage.from('paintings').getPublicUrl(path).data.publicUrl
}

// 個人頭像的公開網址（avatars bucket）
export function avatarUrl(path) {
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}
