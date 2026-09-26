import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { parseVideo } from '../lib/video'
import { WorkPlayer } from '../components/WorkMedia'
import { pour } from '../lib/sounds'
import Dropzone from '../components/Dropzone'
import { uploadImage, removeImage } from '../lib/storage'

export async function insertWork(row) {
  const { error } = await supabase.from('paintings').insert(row)
  if (error) {
    await removeImage(row.image_path)
    throw new Error('儲存失敗：' + error.message)
  }
}

export function CategorySelect({ categories, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">（未分類）</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  )
}

// 批次匯入圖片：可一次選多張或拖曳進來，檔名自動當標題
export function ImageImport({ categories, onUploaded }) {
  const [items, setItems] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')

  function addFiles(fileList) {
    const images = [...fileList].filter((f) => f.type.startsWith('image/'))
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^.]+$/, '').slice(0, 100),
      })),
    ])
  }

  function removeItem(key) {
    setItems((prev) => {
      const item = prev.find((i) => i.key === key)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((i) => i.key !== key)
    })
  }

  function setTitle(key, title) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, title } : i)))
  }

  async function submit(e) {
    e.preventDefault()
    if (items.length === 0) return
    setBusy(true)
    const failed = []
    for (const [index, item] of items.entries()) {
      setProgress(`上傳中… ${index + 1} / ${items.length}`)
      try {
        const path = await uploadImage(item.file)
        await insertWork({
          title: item.title.trim() || '無題',
          category_id: categoryId ? Number(categoryId) : null,
          image_path: path,
        })
        URL.revokeObjectURL(item.preview)
      } catch (err) {
        failed.push({ ...item, error: err.message })
      }
    }
    setBusy(false)
    setItems(failed)
    setProgress(
      failed.length
        ? `完成，但有 ${failed.length} 張失敗（留在下方，可再試一次）`
        : '全部匯入完成！',
    )
    if (failed.length < items.length) pour()
    onUploaded()
  }

  return (
    <form onSubmit={submit} className="panel form">
      <h2>匯入畫作圖片</h2>
      <Dropzone onFiles={addFiles} hint="可一次選取多張，檔名會自動當作標題" />

      {items.length > 0 && (
        <>
          <ul className="import-list">
            {items.map((item) => (
              <li key={item.key}>
                <img src={item.preview} alt="" />
                <div>
                  <input value={item.title} onChange={(e) => setTitle(item.key, e.target.value)} maxLength={100} aria-label="標題" />
                  {item.error && <p className="error">{item.error}</p>}
                </div>
                <button type="button" className="link-button danger" onClick={() => removeItem(item.key)}>移除</button>
              </li>
            ))}
          </ul>
          <label>
            這批作品的風格分類
            <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
          </label>
        </>
      )}
      {progress && <p className="muted">{progress}</p>}
      <button type="submit" disabled={busy || items.length === 0}>
        {busy ? '匯入中…' : `匯入 ${items.length || ''} 幅作品`}
      </button>
    </form>
  )
}

// 以網址匯入影片
export function VideoImport({ categories, onUploaded }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [cover, setCover] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const video = useMemo(() => parseVideo(url), [url])

  async function submit(e) {
    e.preventDefault()
    if (!video) return
    setBusy(true)
    setMsg('')
    try {
      const imagePath = cover ? await uploadImage(cover) : null
      await insertWork({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        video_url: video.url,
        image_path: imagePath,
      })
      setUrl('')
      setTitle('')
      setDescription('')
      setCover(null)
      e.target.reset()
      setMsg('影片已匯入！')
      pour()
      onUploaded()
    } catch (err) {
      setMsg(err.message)
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="panel form">
      <h2>以網址匯入影片</h2>
      <label>
        影片網址
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" required />
      </label>
      {url && !video && <p className="error">無法辨識這個網址。支援 YouTube、Vimeo、Google 雲端硬碟（需開放連結檢視），或 .mp4 / .webm 影片檔連結。</p>}
      {video && (
        <div className="frame small">
          <div className="frame-mat"><WorkPlayer work={{ title: '預覽', video_url: video.url }} /></div>
        </div>
      )}
      <label>
        標題
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
      </label>
      <label>
        風格分類
        <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />
      </label>
      <label>
        說明（選填）
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>
      <label>
        封面圖片（選填，未上傳則使用影片縮圖）
        <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files[0] ?? null)} />
      </label>
      {msg && <p className="muted">{msg}</p>}
      <button type="submit" disabled={busy || !video}>{busy ? '匯入中…' : '匯入影片'}</button>
    </form>
  )
}
