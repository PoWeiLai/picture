import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { swing, prefersReducedMotion } from '../lib/motion'
import { supabase } from '../lib/supabase'
import { toRoman } from '../lib/video'
import { WorkThumb } from '../components/WorkMedia'
import Ornament from '../components/Ornament'
import { HERO } from '../siteConfig'
import ScrollPaper from '../components/ScrollPaper'

const KINDS = [
  { value: '', label: '全部' },
  { value: 'image', label: '畫作' },
  { value: 'video', label: '影片' },
]

function Hero() {
  return (
    <section className="hero">
      <figure className="hero-art">
        <div className="frame large hang" onClick={(e) => swing(e.currentTarget)}>
          <div className="frame-mat">
            <img src={HERO.image} alt={HERO.artwork.title} />
          </div>
        </div>
        <figcaption className="placard">
          <span className="placard-title">{HERO.artwork.title}</span>
          <span className="placard-style">{HERO.artwork.detail}</span>
        </figcaption>
      </figure>
      <div className="hero-text">
        <p className="eyebrow">{HERO.eyebrow}</p>
        <h1 className="hero-title">{HERO.title}</h1>
        <p className="hero-subtitle">{HERO.subtitle}</p>
        <Ornament />
        <ScrollPaper className="hero-scroll">
          <p className="hero-intro">{HERO.intro}</p>
          <p className="scroll-note">{HERO.exhibition}</p>
        </ScrollPaper>
        <div className="hero-actions">
          <a href="#collection" className="button">瀏覽典藏</a>
          <a href={HERO.link} target="_blank" rel="noreferrer">展覽介紹 ↗</a>
        </div>
      </div>
    </section>
  )
}

export default function Gallery() {
  const [categories, setCategories] = useState([])
  const [works, setWorks] = useState(null)
  const [error, setError] = useState('')
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const activeCategory = params.get('category') ?? ''
  const kind = params.get('kind') ?? ''

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data ?? []))
  }, [])

  useEffect(() => {
    let query = supabase
      .from('paintings')
      .select('id, title, image_path, video_url, year, dimensions, created_at, categories(name)')
      .order('created_at', { ascending: false })
    if (activeCategory) query = query.eq('category_id', activeCategory)
    if (kind === 'video') query = query.not('video_url', 'is', null)
    if (kind === 'image') query = query.is('video_url', null)
    query.then(({ data, error }) => {
      if (error) setError(error.message)
      setWorks(data ?? [])
    })
  }, [activeCategory, kind])

  // 點擊畫作：先讓畫框擺盪一下，再進入作品頁
  function openWork(e, id) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || prefersReducedMotion()) return
    e.preventDefault()
    swing(e.currentTarget.querySelector('.frame'))
    setTimeout(() => navigate(`/paintings/${id}`), 450)
  }

  function update(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <main className="container">
      {!activeCategory && !kind && <Hero />}

      <header className="page-title" id="collection">
        <p className="eyebrow">Collezione</p>
        <h1>典藏作品</h1>
        <Ornament />
        <p className="tagline">每一筆色彩，都是一段時光的收藏。</p>
      </header>

      <nav className="filters" aria-label="篩選">
        <div className="filter-row">
          {KINDS.map((k) => (
            <button key={k.value} className={kind === k.value ? 'tab active' : 'tab'} onClick={() => update('kind', k.value)}>
              {k.label}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <button className={!activeCategory ? 'chip active' : 'chip'} onClick={() => update('category', '')}>
            所有風格
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={activeCategory === String(c.id) ? 'chip active' : 'chip'}
              onClick={() => update('category', String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      {error && <p className="error">{error}</p>}
      {works === null ? (
        <p className="muted center">載入中…</p>
      ) : works.length === 0 ? (
        <p className="muted center">這裡還沒有作品。</p>
      ) : (
        <div className="salon">
          {works.map((w, i) => (
            <Link
              key={w.id}
              to={`/paintings/${w.id}`}
              className="salon-item"
              style={{ '--i': i }}
              onClick={(e) => openWork(e, w.id)}
            >
              <div className="frame">
                <div className="frame-mat">
                  <WorkThumb work={w} />
                </div>
              </div>
              <div className="placard">
                <span className="placard-no">N° {toRoman(w.id)}</span>
                <span className="placard-title">{w.title}</span>
                <span className="placard-style">{[w.year, w.dimensions].filter(Boolean).join(' · ') || w.categories?.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
