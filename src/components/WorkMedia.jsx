import { imageUrl } from '../lib/supabase'
import { parseVideo } from '../lib/video'

function PlayBadge() {
  return (
    <span className="play-badge" aria-label="影片">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
    </span>
  )
}

// 列表用的縮圖：圖片 → 影片封面 → YouTube 縮圖 → 影片檔第一格 → 佔位圖
export function WorkThumb({ work }) {
  const video = work.video_url ? parseVideo(work.video_url) : null
  let media
  if (work.image_path) {
    media = <img src={imageUrl(work.image_path)} alt={work.title} loading="lazy" />
  } else if (video?.thumbnail) {
    media = <img className="video-thumb" src={video.thumbnail} alt={work.title} loading="lazy" />
  } else if (video?.provider === 'file') {
    media = <video className="video-thumb" src={`${video.url}#t=0.5`} preload="metadata" muted playsInline />
  } else {
    media = <div className="video-thumb placeholder">影 片</div>
  }
  return (
    <div className="thumb">
      {media}
      {video && <PlayBadge />}
    </div>
  )
}

// 作品頁的主要呈現：有影片就播放影片，否則顯示大圖
export function WorkPlayer({ work }) {
  const video = work.video_url ? parseVideo(work.video_url) : null
  if (video?.provider === 'file') {
    return (
      <video
        className="player"
        src={video.url}
        poster={work.image_path ? imageUrl(work.image_path) : undefined}
        controls
        playsInline
      />
    )
  }
  if (video) {
    return (
      <div className="player embed">
        <iframe
          src={video.embedUrl}
          title={work.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }
  return <img className="artwork" src={imageUrl(work.image_path)} alt={work.title} />
}
