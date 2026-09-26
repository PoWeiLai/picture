import { useState } from 'react'
import { supabase, imageUrl } from '../lib/supabase'
import { uploadImage } from '../lib/storage'
import { pour } from '../lib/sounds'
import { useSiteContent, refreshSiteContent } from '../lib/siteContent'
import { AdminPage } from './AdminLayout'

// 文字區塊 ↔ 陣列：段落以空行分隔，清單一行一項
const toParagraphs = (text) => text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
const toLines = (text) => text.split('\n').map((s) => s.trim()).filter(Boolean)

async function saveSetting(key, value) {
  const { error } = await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw new Error('儲存失敗：' + error.message)
  await refreshSiteContent()
  pour()
}

function ImageField({ label, path, onFile, file }) {
  const preview = file ? URL.createObjectURL(file) : imageUrl(path)
  return (
    <div className="image-field">
      <img src={preview} alt="" />
      <label>
        {label}
        <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files[0] ?? null)} />
      </label>
    </div>
  )
}

function HeroForm({ hero }) {
  const [form, setForm] = useState({
    eyebrow: hero.eyebrow,
    title: hero.title,
    subtitle: hero.subtitle,
    artworkTitle: hero.artwork?.title ?? '',
    artworkDetail: hero.artwork?.detail ?? '',
    intro: hero.intro,
    exhibition: hero.exhibition,
    link: hero.link ?? '',
  })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const image = file ? await uploadImage(file, 'site') : hero.image
      await saveSetting('hero', {
        image,
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        artwork: { title: form.artworkTitle.trim(), detail: form.artworkDetail.trim() },
        intro: form.intro.trim(),
        exhibition: form.exhibition.trim(),
        link: form.link.trim(),
      })
      setFile(null)
      setMsg('已儲存，前台首頁已更新')
    } catch (err) {
      setMsg(err.message)
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="panel form">
      <h2>首頁封面</h2>
      <ImageField label="封面畫作圖片" path={hero.image} file={file} onFile={setFile} />
      <div className="field-row">
        <label>封面畫作名稱<input value={form.artworkTitle} onChange={set('artworkTitle')} /></label>
        <label>畫作資訊<input value={form.artworkDetail} onChange={set('artworkDetail')} placeholder="2023 · 油畫 · 60P" /></label>
      </div>
      <div className="field-row">
        <label>小標（花體字）<input value={form.eyebrow} onChange={set('eyebrow')} /></label>
        <label>大標題<input value={form.title} onChange={set('title')} required /></label>
      </div>
      <label>副標題<input value={form.subtitle} onChange={set('subtitle')} /></label>
      <label>捲軸介紹文字<textarea value={form.intro} onChange={set('intro')} rows={5} /></label>
      <label>捲軸底部（日期與地點）<input value={form.exhibition} onChange={set('exhibition')} /></label>
      <label>「展覽介紹」連結（留空則不顯示）<input type="url" value={form.link} onChange={set('link')} /></label>
      {msg && <p className="muted">{msg}</p>}
      <button type="submit" disabled={busy}>{busy ? '儲存中…' : '儲存首頁封面'}</button>
    </form>
  )
}

function ArtistForm({ artist }) {
  const [form, setForm] = useState({
    name: artist.name,
    education: artist.education,
    lead: artist.lead,
    paragraphs: (artist.paragraphs ?? []).join('\n\n'),
    quote: artist.quote ?? '',
    awards: (artist.awards ?? []).join('\n'),
    exhibitions: (artist.exhibitions ?? []).join('\n'),
  })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const portrait = file ? await uploadImage(file, 'site') : artist.portrait
      await saveSetting('artist', {
        ...artist,
        portrait,
        name: form.name.trim(),
        education: form.education.trim(),
        lead: form.lead.trim(),
        paragraphs: toParagraphs(form.paragraphs),
        quote: form.quote.trim(),
        awards: toLines(form.awards),
        exhibitions: toLines(form.exhibitions),
      })
      setFile(null)
      setMsg('已儲存，前台畫家頁已更新')
    } catch (err) {
      setMsg(err.message)
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="panel form">
      <h2>畫家介紹</h2>
      <ImageField label="畫家照片" path={artist.portrait} file={file} onFile={setFile} />
      <div className="field-row">
        <label>姓名<input value={form.name} onChange={set('name')} required /></label>
        <label>學歷／頭銜<input value={form.education} onChange={set('education')} /></label>
      </div>
      <label>開頭引言（第一頁）<textarea value={form.lead} onChange={set('lead')} rows={3} /></label>
      <label>
        創作理念段落（段落之間空一行；第一段在第一頁，其餘在第二頁）
        <textarea value={form.paragraphs} onChange={set('paragraphs')} rows={10} />
      </label>
      <label>引言金句<textarea value={form.quote} onChange={set('quote')} rows={2} /></label>
      <div className="field-row">
        <label>獲獎（一行一項）<textarea value={form.awards} onChange={set('awards')} rows={5} /></label>
        <label>展覽經歷（一行一項）<textarea value={form.exhibitions} onChange={set('exhibitions')} rows={5} /></label>
      </div>
      {msg && <p className="muted">{msg}</p>}
      <button type="submit" disabled={busy}>{busy ? '儲存中…' : '儲存畫家介紹'}</button>
    </form>
  )
}

export default function ContentAdmin() {
  const { hero, artist } = useSiteContent()
  // key 讓表單在內容從資料庫載入後重新帶入
  return (
    <AdminPage title="網站內容" subtitle="修改前台首頁封面與畫家頁，儲存後立即生效">
      <HeroForm key={JSON.stringify(hero)} hero={hero} />
      <ArtistForm key={JSON.stringify(artist)} artist={artist} />
    </AdminPage>
  )
}
