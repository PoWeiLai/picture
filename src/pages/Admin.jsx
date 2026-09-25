import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { parseVideo } from '../lib/video'
import { WorkThumb, WorkPlayer } from '../components/WorkMedia'
import Ornament from '../components/Ornament'
import { pour } from '../lib/sounds'

async function uploadImage(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('paintings').upload(path, file, { contentType: file.type })
  if (error) throw new Error('圖片上傳失敗：' + error.message)
  return path
}

async function insertWork(row) {
  const { error } = await supabase.from('paintings').insert(row)
  if (error) {
    if (row.image_path) await supabase.storage.from('paintings').remove([row.image_path])
    throw new Error('儲存失敗：' + error.message)
  }
}

function CategorySelect({ categories, value, onChange }) {
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
function ImageImport({ categories, onUploaded }) {
  const [items, setItems] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [dragging, setDragging] = useState(false)

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
      <label
        className={dragging ? 'dropzone dragging' : 'dropzone'}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
      >
        <input type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
        <span className="dropzone-title">點此選擇圖片，或把圖片拖曳到這裡</span>
        <span className="muted">可一次選取多張，檔名會自動當作標題</span>
      </label>

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
function VideoImport({ categories, onUploaded }) {
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

function CategoryManager({ categories, onChanged }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  async function add(e) {
    e.preventDefault()
    const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order))
    const { error } = await supabase.from('categories').insert({ name: name.trim(), sort_order: maxOrder + 1 })
    if (error) return setError('新增失敗：' + error.message)
    setName('')
    setError('')
    onChanged()
  }

  async function rename(c) {
    const newName = prompt('新的分類名稱', c.name)?.trim()
    if (!newName || newName === c.name) return
    const { error } = await supabase.from('categories').update({ name: newName }).eq('id', c.id)
    if (error) return setError('修改失敗：' + error.message)
    onChanged()
  }

  async function remove(c) {
    if (!confirm(`確定刪除分類「${c.name}」嗎？該分類的作品會變成未分類。`)) return
    await supabase.from('categories').delete().eq('id', c.id)
    onChanged()
  }

  return (
    <section className="panel form">
      <h2>風格分類</h2>
      <ul className="list">
        {categories.map((c) => (
          <li key={c.id}>
            <span>{c.name}</span>
            <span>
              <button className="link-button" onClick={() => rename(c)}>改名</button>
              <button className="link-button danger" onClick={() => remove(c)}>刪除</button>
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="inline-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="新分類名稱" maxLength={30} required />
        <button type="submit">新增</button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  )
}

function WorkList({ works, categories, onChanged }) {
  async function changeCategory(w, categoryId) {
    await supabase.from('paintings').update({ category_id: categoryId ? Number(categoryId) : null }).eq('id', w.id)
    onChanged()
  }

  async function remove(w) {
    if (!confirm(`確定刪除「${w.title}」嗎？評論也會一起刪除，無法復原。`)) return
    const { error } = await supabase.from('paintings').delete().eq('id', w.id)
    if (!error && w.image_path) await supabase.storage.from('paintings').remove([w.image_path])
    onChanged()
  }

  return (
    <section className="panel">
      <h2>館藏作品（{works.length}）</h2>
      <ul className="list">
        {works.map((w) => (
          <li key={w.id}>
            <Link to={`/paintings/${w.id}`} className="list-work">
              <WorkThumb work={w} />
              <span>{w.title}</span>
            </Link>
            <span>
              <CategorySelect categories={categories} value={w.category_id ?? ''} onChange={(v) => changeCategory(w, v)} />
              <button className="link-button danger" onClick={() => remove(w)}>刪除</button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Admin() {
  const [categories, setCategories] = useState([])
  const [works, setWorks] = useState([])
  const [tab, setTab] = useState('images')

  const loadCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data ?? [])
  }, [])

  const loadWorks = useCallback(async () => {
    const { data } = await supabase.from('paintings').select('*').order('created_at', { ascending: false })
    setWorks(data ?? [])
  }, [])

  useEffect(() => {
    loadCategories()
    loadWorks()
  }, [loadCategories, loadWorks])

  return (
    <main className="container">
      <header className="page-title">
        <p className="eyebrow">Studiolo</p>
        <h1>畫室管理</h1>
        <Ornament />
      </header>
      <div className="admin-columns">
        <div>
          <div className="tabs">
            <button className={tab === 'images' ? 'tab active' : 'tab'} onClick={() => setTab('images')}>匯入圖片</button>
            <button className={tab === 'video' ? 'tab active' : 'tab'} onClick={() => setTab('video')}>匯入影片</button>
          </div>
          {tab === 'images'
            ? <ImageImport categories={categories} onUploaded={loadWorks} />
            : <VideoImport categories={categories} onUploaded={loadWorks} />}
        </div>
        <CategoryManager
          categories={categories}
          onChanged={() => {
            loadCategories()
            loadWorks()
          }}
        />
      </div>
      <WorkList works={works} categories={categories} onChanged={loadWorks} />
    </main>
  )
}
