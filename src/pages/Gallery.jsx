import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase, imageUrl } from '../lib/supabase'
import { WorkThumb } from '../components/WorkMedia'
import Ornament from '../components/Ornament'
import { useSiteContent } from '../lib/siteContent'
import ScrollPaper from '../components/ScrollPaper'
import PenText from '../components/PenText'

function Hero() {
  const { hero: HERO } = useSiteContent()
  // 封面文字依序用鋼筆寫出：標題 → 副標 → 介紹 → 展期
  const [step, setStep] = useState(0)
  const next = (n) => () => setStep((s) => Math.max(s, n))
  return (
    <section className="hero">
      <figure className="hero-art">
        <div className="frame large hang">
          <div className="frame-mat">
            <img src={imageUrl(HERO.image)} alt={HERO.artwork.title} />
          </div>
        </div>
        <figcaption className="placard">
          <span className="placard-title">{HERO.artwork.title}</span>
          <span className="placard-style">{HERO.artwork.detail}</span>
        </figcaption>
      </figure>
      <div className="hero-text">
        <p className="eyebrow">{HERO.eyebrow}</p>
        <PenText as="h1" className="hero-title" text={HERO.title} speed={320} onDone={next(1)} />
        <PenText className="hero-subtitle" text={HERO.subtitle} speed={110} start={step >= 1} onDone={next(2)} />
        <Ornament />
        <ScrollPaper className="hero-scroll">
          <PenText className="hero-intro" text={HERO.intro} speed={60} start={step >= 2} onDone={next(3)} />
          <PenText className="scroll-note" text={HERO.exhibition} speed={50} start={step >= 3} />
        </ScrollPaper>
        <div className="hero-actions">
          <a href="#collection" className="button">瀏覽典藏</a>
          {HERO.link && <a href={HERO.link} target="_blank" rel="noreferrer">展覽介紹 ↗</a>}
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
  const activeCategory = params.get('category') ?? ''
  // 導覽列的「影片」帶 ?kind=video；「作品」只顯示畫作
  const isVideo = params.get('kind') === 'video'

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data ?? []))
  }, [])

  useEffect(() => {
    let query = supabase
      .from('paintings')
      .select('id, title, image_path, video_url, year, dimensions, created_at, categories(name)')
      .order('created_at', { ascending: false })
    if (activeCategory) query = query.eq('category_id', activeCategory)
    query = isVideo ? query.not('video_url', 'is', null) : query.is('video_url', null)
    query.then(({ data, error }) => {
      if (error) setError(error.message)
      setWorks(data ?? [])
    })
  }, [activeCategory, isVideo])

  function update(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <main className="container">
      {!activeCategory && !isVideo && <Hero />}

      <header className="page-title" id="collection">
        <p className="eyebrow">Collezione</p>
        <h1>{isVideo ? '影片' : '典藏作品'}</h1>
        <Ornament />
        <p className="tagline">每一筆色彩，都是一段時光的收藏。</p>
      </header>

      {!isVideo && (
      <nav className="filters" aria-label="分類">
        <div className="filter-row">
          {/* 再點一次已選的分類就取消篩選，回到全部作品 */}
          {categories.map((c) => (
            <button
              key={c.id}
              className={activeCategory === String(c.id) ? 'chip active' : 'chip'}
              onClick={() => update('category', activeCategory === String(c.id) ? '' : String(c.id))}
              aria-pressed={activeCategory === String(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>
      )}

      {error && <p className="error">{error}</p>}
      {works === null ? (
        <p className="muted center">載入中…</p>
      ) : works.length === 0 ? (
        <p className="muted center">這裡還沒有作品。</p>
      ) : (
        // 一幅作品佔一個畫面、置中由上往下排列；文字介紹只在點進去的作品頁顯示
        <div className="gallery-column">
          {works.map((w) => (
            <Link
              key={w.id}
              to={`/paintings/${w.id}`}
              className="gallery-item"
              aria-label={`${w.title}（點擊觀看介紹）`}
              title="點擊觀看介紹"
            >
              <div className="frame">
                <div className="frame-mat">
                  <WorkThumb work={w} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
