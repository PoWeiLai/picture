import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, imageUrl } from '../lib/supabase'
import { parseVideo } from '../lib/video'
import { uploadImage, removeImage } from '../lib/storage'
import { pour } from '../lib/sounds'
import { WorkPlayer } from '../components/WorkMedia'
import { CategorySelect } from './imports'
import { useCategories } from './WorksAdmin'
import { AdminPage } from './AdminLayout'

const FIELDS = ['title', 'description', 'category_id', 'year', 'medium', 'dimensions', 'video_url']

export default function WorkEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories] = useCategories()
  const [work, setWork] = useState(undefined)
  const [form, setForm] = useState(null)
  const [newImage, setNewImage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase
      .from('paintings')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setWork(data)
        if (data) {
          setForm(Object.fromEntries(FIELDS.map((f) => [f, data[f] ?? ''])))
        }
      })
  }, [id])

  const video = useMemo(() => (form?.video_url ? parseVideo(form.video_url) : null), [form?.video_url])
  const preview = useMemo(() => (newImage ? URL.createObjectURL(newImage) : null), [newImage])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  if (work === undefined) return <p className="muted">載入中…</p>
  if (work === null) return <p>找不到這件作品。<Link to="/admin/works">回到作品列表</Link></p>

  const set = (field) => (e) => setForm({ ...form, [field]: e.target?.value ?? e })
  const videoInvalid = form.video_url && !video
  const needsMedia = !form.video_url && !work.image_path && !newImage

  async function save(e) {
    e.preventDefault()
    if (videoInvalid || needsMedia) return
    setBusy(true)
    setMsg('')
    let uploaded = null
    try {
      if (newImage) uploaded = await uploadImage(newImage)
      const row = {
        title: form.title.trim(),
        description: form.description.trim(),
        category_id: form.category_id ? Number(form.category_id) : null,
        year: form.year ? Number(form.year) : null,
        medium: form.medium.trim(),
        dimensions: form.dimensions.trim(),
        video_url: video ? video.url : null,
        ...(uploaded ? { image_path: uploaded } : {}),
      }
      const { error } = await supabase.from('paintings').update(row).eq('id', work.id)
      if (error) throw new Error('儲存失敗：' + error.message)
      if (uploaded) await removeImage(work.image_path)
      setWork({ ...work, ...row })
      setNewImage(null)
      setMsg('已儲存')
      pour()
    } catch (err) {
      if (uploaded) await removeImage(uploaded)
      setMsg(err.message)
    }
    setBusy(false)
  }

  async function remove() {
    if (!confirm(`確定刪除「${work.title}」嗎？這件作品的留言也會一起刪除，無法復原。`)) return
    const { error } = await supabase.from('paintings').delete().eq('id', work.id)
    if (error) return setMsg('刪除失敗：' + error.message)
    await removeImage(work.image_path)
    navigate('/admin/works')
  }

  const previewWork = { ...work, title: form.title, video_url: video?.url ?? null }

  return (
    <AdminPage
      title="編輯作品"
      subtitle={<Link to="/admin/works">← 回到作品列表</Link>}
      actions={<Link to={`/paintings/${work.id}`} target="_blank" className="button">在前台查看</Link>}
    >
      <form onSubmit={save} className="edit-grid">
        <div className="panel">
          <h2>{video ? '影片預覽' : '圖片'}</h2>
          <div className="frame small">
            <div className="frame-mat">
              {preview ? <img src={preview} alt="新圖片預覽" /> : video || work.image_path ? <WorkPlayer work={previewWork} /> : <p className="muted center">尚無圖片</p>}
            </div>
          </div>
          {video && work.image_path && !preview && (
            <p className="muted">目前封面：<img className="inline-thumb" src={imageUrl(work.image_path)} alt="" /></p>
          )}
          <label className="form-field">
            {video ? '更換封面圖片（選填）' : '更換圖片'}
            <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0] ?? null)} />
          </label>
          <label className="form-field">
            影片網址（留空代表這是畫作）
            <input value={form.video_url} onChange={set('video_url')} placeholder="YouTube、Vimeo、Google 雲端硬碟或 .mp4 連結" />
          </label>
          {videoInvalid && <p className="error">無法辨識這個影片網址。</p>}
          {needsMedia && <p className="error">畫作需要有圖片，或填入影片網址。</p>}
        </div>

        <div className="panel form">
          <h2>作品資料</h2>
          <label>
            標題
            <input value={form.title} onChange={set('title')} maxLength={100} required />
          </label>
          <label>
            風格分類
            <CategorySelect categories={categories} value={form.category_id} onChange={set('category_id')} />
          </label>
          <div className="field-row">
            <label>
              年份
              <input type="number" min="1900" max="2100" value={form.year} onChange={set('year')} placeholder="2026" />
            </label>
            <label>
              媒材
              <input value={form.medium} onChange={set('medium')} placeholder="油畫" />
            </label>
            <label>
              尺寸
              <input value={form.dimensions} onChange={set('dimensions')} placeholder="10F（53 × 45.5 cm）" />
            </label>
          </div>
          <label>
            作品說明
            <textarea value={form.description} onChange={set('description')} rows={7} />
          </label>
          {msg && <p className="muted">{msg}</p>}
          <div className="form-actions">
            <button type="button" className="link-button danger" onClick={remove}>刪除這件作品</button>
            <button type="submit" disabled={busy || videoInvalid || needsMedia}>{busy ? '儲存中…' : '儲存變更'}</button>
          </div>
        </div>
      </form>
    </AdminPage>
  )
}
