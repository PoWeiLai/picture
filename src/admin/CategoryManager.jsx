import { useState } from 'react'
import { supabase } from '../lib/supabase'

// 作品頁裡的「分類管理」：新增、刪除分類（前台「作品」的分類按鈕會跟著更新）
export default function CategoryManager({ categories, works, onChange }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const count = (c) => works.filter((w) => w.category_id === c.id).length

  async function add(e) {
    e.preventDefault()
    const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order))
    const { error } = await supabase.from('categories').insert({ name: name.trim(), sort_order: maxOrder + 1 })
    if (error) return setError('新增失敗：' + (error.code === '23505' ? '已經有這個分類了' : error.message))
    setError('')
    setName('')
    onChange()
  }

  async function remove(c) {
    const n = count(c)
    const msg = n
      ? `確定刪除分類「${c.name}」嗎？這個分類的 ${n} 件作品不會被刪掉，但會變成未分類。`
      : `確定刪除分類「${c.name}」嗎？`
    if (!confirm(msg)) return
    const { error } = await supabase.from('categories').delete().eq('id', c.id)
    if (error) return setError('刪除失敗：' + error.message)
    setError('')
    onChange()
  }

  return (
    <section className="panel category-manager">
      <h2>分類管理</h2>
      <ul className="category-chips">
        {categories.map((c) => (
          <li key={c.id}>
            <span>{c.name}</span>
            <span className="muted">（{count(c)} 件）</span>
            <button type="button" className="link-button danger" onClick={() => remove(c)} aria-label={`刪除分類 ${c.name}`}>✕</button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="inline-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="新分類名稱，例如：素描" maxLength={30} required />
        <button type="submit">新增分類</button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  )
}
