import { useCallback, useEffect, useState } from 'react'
import { supabase, imageUrl, formatDate } from '../lib/supabase'
import { uploadImage, removeImage } from '../lib/storage'
import { pour } from '../lib/sounds'
import Dropzone from '../components/Dropzone'
import { AdminPage } from './AdminLayout'

// 管理「畫室日常」照片：批次上傳（每張可寫說明與日期）與刪除
export default function StudioAdmin() {
  const [photos, setPhotos] = useState([])
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('studio_photos').select('*').order('created_at', { ascending: false })
    setPhotos(data ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function addFiles(files) {
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        caption: '',
        taken_on: file.lastModified ? new Date(file.lastModified).toISOString().slice(0, 10) : '',
      })),
    ])
  }

  function update(key, field, value) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, [field]: value } : i)))
  }

  function removeItem(key) {
    setItems((prev) => {
      const item = prev.find((i) => i.key === key)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((i) => i.key !== key)
    })
  }

  async function submit(e) {
    e.preventDefault()
    if (items.length === 0) return
    setBusy(true)
    const failed = []
    for (const [index, item] of items.entries()) {
      setProgress(`上傳中… ${index + 1} / ${items.length}`)
      try {
        const path = await uploadImage(item.file, 'studio')
        const { error } = await supabase.from('studio_photos').insert({
          image_path: path,
          caption: item.caption.trim(),
          taken_on: item.taken_on || null,
        })
        if (error) {
          await removeImage(path)
          throw new Error('儲存失敗：' + error.message)
        }
        URL.revokeObjectURL(item.preview)
      } catch (err) {
        failed.push({ ...item, error: err.message })
      }
    }
    setBusy(false)
    setItems(failed)
    setProgress(failed.length ? `完成，但有 ${failed.length} 張失敗（留在下方，可再試一次）` : '全部上傳完成！')
    if (failed.length < items.length) pour()
    load()
  }

  async function edit(photo) {
    const caption = prompt('照片說明', photo.caption)
    if (caption === null) return
    const takenOn = prompt('拍攝日期（例如 2026-09-26，可留空）', photo.taken_on ?? '')
    if (takenOn === null) return
    const { error } = await supabase
      .from('studio_photos')
      .update({ caption: caption.trim(), taken_on: takenOn.trim() || null })
      .eq('id', photo.id)
    if (error) alert('儲存失敗：' + error.message)
    load()
  }

  async function remove(photo) {
    if (!confirm('確定刪除這張照片嗎？')) return
    const { error } = await supabase.from('studio_photos').delete().eq('id', photo.id)
    if (!error) await removeImage(photo.image_path)
    load()
  }

  return (
    <AdminPage title="畫室照片" subtitle="前台「畫室日常」頁的照片">
    <div className="admin-columns">
      <form onSubmit={submit} className="panel form">
        <h2>上傳畫室照片</h2>
        <Dropzone onFiles={addFiles} hint="畫畫的日常、畫室一角都可以，一次可選多張" />
        {items.length > 0 && (
          <ul className="import-list">
            {items.map((item) => (
              <li key={item.key}>
                <img src={item.preview} alt="" />
                <div className="import-fields">
                  <input
                    value={item.caption}
                    onChange={(e) => update(item.key, 'caption', e.target.value)}
                    placeholder="照片說明（選填）"
                    maxLength={200}
                    aria-label='照片說明'
                  />
                  <input
                    type="date"
                    value={item.taken_on}
                    onChange={(e) => update(item.key, 'taken_on', e.target.value)}
                    aria-label="拍攝日期"
                  />
                  {item.error && <p className="error">{item.error}</p>}
                </div>
                <button type="button" className="link-button danger" onClick={() => removeItem(item.key)}>移除</button>
              </li>
            ))}
          </ul>
        )}
        {progress && <p className="muted">{progress}</p>}
        <button type="submit" disabled={busy || items.length === 0}>
          {busy ? '上傳中…' : `上傳 ${items.length || ''} 張照片`}
        </button>
      </form>

      <section className="panel">
        <h2>畫室照片（{photos.length}）</h2>
        <ul className="list">
          {photos.map((p) => (
            <li key={p.id}>
              <span className="list-work">
                <span className="thumb"><img src={imageUrl(p.image_path)} alt="" /></span>
                <span>
                  {p.caption || '（無說明）'}
                  {p.taken_on && <span className="muted"> · {formatDate(p.taken_on)}</span>}
                </span>
              </span>
              <span>
                <button className="link-button" onClick={() => edit(p)}>編輯說明</button>
                <button className="link-button danger" onClick={() => remove(p)}>刪除</button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
    </AdminPage>
  )
}
