// 預覽模式：尚未設定 Supabase 時，用 src/data/works.js 的資料模擬唯讀的 Supabase client。
// 只實作網站用到的查詢方法；所有寫入都會回傳錯誤。
import { CATEGORIES, WORKS, STUDIO_PHOTOS } from '../data/works'

const TABLES = {
  categories: () => CATEGORIES,
  paintings: () =>
    WORKS.map((w) => ({ ...w, categories: CATEGORIES.find((c) => c.id === w.category_id) ?? null })),
  studio_photos: () => STUDIO_PHOTOS,
  comments: () => [],
  profiles: () => DEMO_MEMBERS,
  site_settings: () => [],
}

const DEMO_MEMBERS = [
  {
    id: 'demo-artist',
    email: '（預覽模式）',
    display_name: '許培璟',
    is_admin: true,
    created_at: '2026-09-26T00:00:00Z',
    comment_count: 0,
  },
]

const READ_ONLY = { data: null, error: { message: '預覽模式無法寫入，請先設定 Supabase。' } }

class Query {
  constructor(table) {
    this.table = table
    this.filters = []
    this.sort = null
    this.mode = 'many'
  }
  select() { return this }
  eq(col, value) { this.filters.push((r) => String(r[col]) === String(value)); return this }
  is(col, value) { this.filters.push((r) => (r[col] ?? null) === value); return this }
  not(col, op, value) { this.filters.push((r) => (r[col] ?? null) !== value); return this }
  order(col, { ascending = true } = {}) {
    this.sort = (a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (ascending ? 1 : -1)
    return this
  }
  single() { this.mode = 'single'; return this }
  maybeSingle() { this.mode = 'maybe'; return this }
  insert() { return Promise.resolve(READ_ONLY) }
  upsert() { return Promise.resolve(READ_ONLY) }
  update() { return new WriteQuery() }
  delete() { return new WriteQuery() }
  then(resolve, reject) {
    let rows = (TABLES[this.table]?.() ?? []).filter((r) => this.filters.every((f) => f(r)))
    if (this.sort) rows = [...rows].sort(this.sort)
    const data = this.mode === 'many' ? rows : (rows[0] ?? null)
    return Promise.resolve({ data, error: null }).then(resolve, reject)
  }
}

class WriteQuery {
  eq() { return this }
  then(resolve, reject) { return Promise.resolve(READ_ONLY).then(resolve, reject) }
}

export const demoClient = {
  rpc: (name) =>
    Promise.resolve(name === 'admin_list_members' ? { data: DEMO_MEMBERS, error: null } : READ_ONLY),
  from: (table) => new Query(table),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signInWithPassword: () => Promise.resolve(READ_ONLY),
    signUp: () => Promise.resolve(READ_ONLY),
    signOut: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.resolve(READ_ONLY),
  },
  storage: {
    from: () => ({
      getPublicUrl: (path) => ({ data: { publicUrl: path } }),
      upload: () => Promise.resolve(READ_ONLY),
      remove: () => Promise.resolve(READ_ONLY),
    }),
  },
}
