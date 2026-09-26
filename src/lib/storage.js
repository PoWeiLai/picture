import { supabase } from './supabase'

// 上傳圖片到 Supabase Storage 的 paintings bucket，回傳儲存路徑
export async function uploadImage(file, folder = '') {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${folder ? folder + '/' : ''}${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('paintings').upload(path, file, { contentType: file.type })
  if (error) throw new Error('圖片上傳失敗：' + error.message)
  return path
}

// 只刪除上傳到 Storage 的檔案；以 / 開頭的是網站內建圖片，不能刪
export async function removeImage(path) {
  if (path && !path.startsWith('/')) await supabase.storage.from('paintings').remove([path])
}
