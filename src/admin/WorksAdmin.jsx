import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { removeImage } from '../lib/storage'
import { WorkThumb } from '../components/WorkMedia'
import { ImageImport, VideoImport } from './imports'
import { AdminPage } from './AdminLayout'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const load = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data ?? [])
  }, [])
  useEffect(() => {
    load()
  }, [load])
  return [categories, load]
}

export default function WorksAdmin() {
  const [categories] = useCategories()
  const [works, setWorks] = useState([])
  const [params, setParams] = useSearchParams()
  const [importTab, setImportTab] = useState(null)
  const [query, setQuery] = useState('')
  const kind = params.get('kind') ?? ''
  const category = params.get('category') ?? ''

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('paintings')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
    setWorks(data ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return works.filter(
      (w) =>
        (!kind || (kind === 'video') === Boolean(w.video_url)) &&
        (!category || String(w.category_id) === category) &&
        (!q || w.title.toLowerCase().includes(q) || (w.description ?? '').toLowerCase().includes(q)),
    )
  }, [works, kind, category, query])

  function setFilter(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  async function remove(w) {
    if (!confirm(`確定刪除「${w.title}」嗎？這件作品的留言也會一起刪除，無法復原。`)) return
    const { error } = await supabase.from('paintings').delete().eq('id', w.id)
    if (error) return alert('刪除失敗：' + error.message)
    await removeImage(w.image_path)
    load()
  }

  return (
    <AdminPage
      title="作品"
      subtitle={`共 ${works.length} 件，其中影片 ${works.filter((w) => w.video_url).length} 件`}
      actions={
        <>
          <button onClick={() => setImportTab(importTab === 'images' ? null : 'images')}>＋ 匯入圖片</button>
          <button onClick={() => setImportTab(importTab === 'video' ? null : 'video')}>＋ 匯入影片</button>
        </>
      }
    >
      {importTab === 'images' && <ImageImport categories={categories} onUploaded={load} />}
      {importTab === 'video' && <VideoImport categories={categories} onUploaded={load} />}

      <div className="admin-toolbar">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜尋標題或說明…" aria-label="搜尋作品" />
        <select value={kind} onChange={(e) => setFilter('kind', e.target.value)} aria-label="類型">
          <option value="">全部類型</option>
          <option value="image">畫作</option>
          <option value="video">影片</option>
        </select>
        <select value={category} onChange={(e) => setFilter('category', e.target.value)} aria-label="分類">
          <option value="">全部分類</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>作品</th>
              <th>分類</th>
              <th>年份</th>
              <th>類型</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {shown.map((w) => (
              <tr key={w.id}>
                <td>
                  <Link to={`/admin/works/${w.id}`} className="list-work">
                    <WorkThumb work={w} />
                    <span>{w.title}</span>
                  </Link>
                </td>
                <td>{w.categories?.name ?? <span className="muted">未分類</span>}</td>
                <td>{w.year ?? <span className="muted">—</span>}</td>
                <td>{w.video_url ? '影片' : '畫作'}</td>
                <td className="row-actions">
                  <Link to={`/admin/works/${w.id}`}>編輯</Link>
                  <Link to={`/paintings/${w.id}`} target="_blank">前台</Link>
                  <button className="link-button danger" onClick={() => remove(w)}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="muted center">沒有符合條件的作品。</p>}
      </div>
    </AdminPage>
  )
}
