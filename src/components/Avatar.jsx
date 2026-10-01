import { avatarUrl } from '../lib/supabase'

// 個人頭像：有上傳照片就顯示照片，否則顯示名字第一個字的紅色印章
export default function Avatar({ profile, className = '' }) {
  const name = profile?.display_name ?? '匿名'
  if (profile?.avatar_path) {
    return <img className={`seal seal-photo ${className}`} src={avatarUrl(profile.avatar_path)} alt="" />
  }
  return <span className={`seal ${className}`} aria-hidden="true">{name.slice(0, 1)}</span>
}
