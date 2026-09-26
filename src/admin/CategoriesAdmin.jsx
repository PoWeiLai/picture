import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCategories } from './WorksAdmin'
import { AdminPage } from './AdminLayout'

export default function CategoriesAdmin() {
  const [categories, reload] = useCategories()
  const [counts, setCounts] = useState({})
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('paintings')
      .select('category_id')
      .then(({ data }) => {
        const c = {}
        for (const w of data ?? []) c[w.category_id] = (c[w.category_id] ?? 0) + 1
        setCounts(c)
      })
  }, [categories])

  async function run(promise, failMsg) {
    const { error } = await promise
    if (error) setError(failMsg + '：' + error.message)
    else setError('')
    reload()
    return !error
  }

  async function add(e) {
    e.preventDefault()
    const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order))
    if (await run(supabase.from('categories').insert({ name: name.trim(), sort_order: maxOrder + 1 }), '新增失敗')) setName('')
  }

  async function rename(c) {
    const newName = prompt('新的分類名稱', c.name)?.trim()
    if (!newName || newName === c.name) return
    run(supabase.from('categories').update({ name: newName }).eq('id', c.id), '修改失敗')
  }

  async function remove(c) {
    if (!confirm(`確定刪除分類「${c.name}」嗎？這個分類的 ${counts[c.id] ?? 0} 件作品會變成未分類。`)) return
    run(supabase.from('categories').delete().eq('id', c.id), '刪除失敗')
  }

  // 與上一個／下一個分類交換排序
  async function move(index, delta) {
    const a = categories[index]
    const b = categories[index + delta]
    if (!a || !b) return
    const { error } = await supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id)
    if (!error) await supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id)
    if (error) setError('排序失敗：' + error.message)
    reload()
  }

  return (
    <AdminPage title="分類" subtitle="前台畫廊的「風格」篩選會依照這裡的順序顯示">
      <div className="panel admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>順序</th>
              <th>分類名稱</th>
              <th>作品數</th>
              <th aria-label="操作" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr key={c.id}>
                <td className="row-actions">
                  <button className="link-button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="往上移">▲</button>
                  <button className="link-button" onClick={() => move(i, 1)} disabled={i === categories.length - 1} aria-label="往下移">▼</button>
                </td>
                <td>{c.name}</td>
                <td>{counts[c.id] ?? 0}</td>
                <td className="row-actions">
                  <button className="link-button" onClick={() => rename(c)}>改名</button>
                  <button className="link-button danger" onClick={() => remove(c)}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={add} className="inline-form">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="新分類名稱，例如：花鳥" maxLength={30} required />
          <button type="submit">新增分類</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </AdminPage>
  )
}
