import { useCallback, useEffect, useState } from 'react'
import { supabase, imageUrl, formatDate } from '../lib/supabase'
import Ornament from '../components/Ornament'
import Lightbox from '../components/Lightbox'
import WaxProcess from '../components/WaxProcess'
import { ALBUMS } from '../lib/albums'

// 照片牆：album 為 daily（生活點滴）或 setup（布展活動）
export default function Studio({ album = 'daily' }) {
  const info = ALBUMS[album]
  const [photos, setPhotos] = useState(null)
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])

  useEffect(() => {
    supabase
      .from('studio_photos')
      .select('*')
      .eq('album', album)
      .order('created_at', { ascending: false })
      .then(({ data }) => setPhotos(data ?? []))
  }, [album])

  return (
    <main className="container">
      <header className="page-title">
        <p className="eyebrow">{info.eyebrow}</p>
        <h1>{info.title}</h1>
        <Ornament />
        <p className="tagline">{info.tagline}</p>
      </header>

      {album === 'daily' && <WaxProcess />}

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
              onClick={() => setOpen(i)}
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
