import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../AuthContext'
import Avatar from './Avatar'

const SIZE = 256

// 把選好的照片裁成正方形並縮小成 256×256 的 JPEG，手機照片也不會太大
async function toSquareJpeg(file) {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  canvas
    .getContext('2d')
    .drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE)
  bitmap.close()
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
}

// 帳戶頁與後台「個人設定」共用：上傳、更換、移除自己的頭像
export default function AvatarUpload() {
  const { user, profile, refreshProfile } = useAuth()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(newPath) {
    const old = profile.avatar_path
    const { error } = await supabase.from('profiles').update({ avatar_path: newPath }).eq('id', user.id)
    if (error) throw new Error('儲存失敗：' + error.message)
    if (old) await supabase.storage.from('avatars').remove([old])
    await refreshProfile()
  }

  async function upload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return setMsg('請選擇圖片檔')
    setBusy(true)
    setMsg('上傳中…')
    try {
      const blob = await toSquareJpeg(file)
      // 每個人只能上傳到以自己 id 命名的資料夾（資料庫規則限制）
      const path = `${user.id}/${Date.now()}.jpg`
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg' })
      if (error) throw new Error('上傳失敗：' + error.message)
      await save(path)
      setMsg('頭像已更新')
    } catch (err) {
      setMsg(err.message)
    }
    setBusy(false)
  }

  async function remove() {
    if (!confirm('確定移除頭像嗎？')) return
    setBusy(true)
    try {
      await save(null)
      setMsg('已移除頭像')
    } catch (err) {
      setMsg(err.message)
    }
    setBusy(false)
  }

  return (
    <section className="panel form avatar-upload">
      <h2>個人頭像</h2>
      <Avatar profile={profile} className="avatar-large" />
      <p className="muted center">留言時會顯示在名字旁邊。照片會自動裁成正方形。</p>
      <div className="account-actions" style={{ justifyContent: 'center' }}>
        <label className="button">
          {profile?.avatar_path ? '更換照片' : '選擇照片'}
          <input type="file" accept="image/*" onChange={upload} disabled={busy} hidden />
        </label>
        {profile?.avatar_path && (
          <button type="button" className="link-button danger" onClick={remove} disabled={busy}>移除頭像</button>
        )}
      </div>
      {msg && <p className="muted center">{msg}</p>}
    </section>
  )
}
