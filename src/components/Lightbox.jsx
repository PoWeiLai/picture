import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { imageUrl, formatDate } from '../lib/supabase'
import { wind } from '../lib/sounds'

// 放大檢視照片：← → 切換、Esc 或點背景關閉
export default function Lightbox({ photos, index, onChange, onClose }) {
  const photo = photos[index]
  const hasMany = photos.length > 1

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && hasMany) step(1)
      if (e.key === 'ArrowLeft' && hasMany) step(-1)
    }
    function step(d) {
      wind()
      onChange((index + d + photos.length) % photos.length)
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [index, photos.length, hasMany, onChange, onClose])

  const go = (d) => onChange((index + d + photos.length) % photos.length)

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.caption || '照片'} onClick={onClose}>
      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <div key={photo.id} className="frame large hang">
          <div className="frame-mat">
            <img src={imageUrl(photo.image_path)} alt={photo.caption} />
          </div>
        </div>
        {(photo.caption || photo.taken_on) && (
          <figcaption className="placard">
            {photo.caption && <span className="placard-title">{photo.caption}</span>}
            {photo.taken_on && <span className="placard-style">{formatDate(photo.taken_on)}</span>}
          </figcaption>
        )}
      </figure>
      {hasMany && (
        <>
          <button type="button" className="lightbox-arrow prev" data-sound="wind" aria-label="上一張" onClick={(e) => { e.stopPropagation(); go(-1) }}>‹</button>
          <button type="button" className="lightbox-arrow next" data-sound="wind" aria-label="下一張" onClick={(e) => { e.stopPropagation(); go(1) }}>›</button>
        </>
      )}
      <button type="button" className="lightbox-close" aria-label="關閉" onClick={onClose}>×</button>
    </div>,
    document.body,
  )
}
