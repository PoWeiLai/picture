import { useCallback, useEffect, useState } from 'react'
import { supabase, imageUrl, formatDate } from '../lib/supabase'
import { swing } from '../lib/motion'
import Ornament from '../components/Ornament'
import Lightbox from '../components/Lightbox'

export default function Studio() {
  const [photos, setPhotos] = useState(null)
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])

  useEffect(() => {
    supabase
      .from('studio_photos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setPhotos(data ?? []))
  }, [])

  function show(e, i) {
    swing(e.currentTarget.querySelector('.frame'))
    setTimeout(() => setOpen(i), 300)
  }

  return (
    <main className="container">
      <header className="page-title">
        <p className="eyebrow">Lo Studio</p>
        <h1>畫室日常</h1>
        <Ornament />
        <p className="tagline">畫布之外，那些拿起畫筆的平凡日子。</p>
      </header>

      {photos === null ? (
        <p className="muted center">載入中…</p>
      ) : photos.length === 0 ? (
        <p className="muted center">還沒有照片。</p>
      ) : (
        <div className="salon studio-wall">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="salon-item studio-item"
              style={{ '--i': i }}
              data-sound="clink"
              onClick={(e) => show(e, i)}
            >
              <div className="frame small-ornate">
                <div className="frame-mat">
                  <img src={imageUrl(p.image_path)} alt={p.caption} loading="lazy" />
                </div>
              </div>
              {(p.caption || p.taken_on) && (
                <span className="placard">
                  {p.caption && <span className="placard-title">{p.caption}</span>}
                  {p.taken_on && <span className="placard-style">{formatDate(p.taken_on)}</span>}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open !== null && photos?.[open] && (
        <Lightbox photos={photos} index={open} onChange={setOpen} onClose={close} />
      )}
    </main>
  )
}
