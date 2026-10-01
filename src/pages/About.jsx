import { useState } from 'react'
import { Link } from 'react-router-dom'
import Ornament from '../components/Ornament'
import ScrollPaper from '../components/ScrollPaper'
import PenText from '../components/PenText'
import { imageUrl } from '../lib/supabase'
import { useSiteContent } from '../lib/siteContent'

// 捲軸裡要依序用毛筆寫出的段落：每段寫完才寫下一段
function segments(artist) {
  const list = []
  if (artist.lead) list.push({ key: 'lead', className: 'about-lead', text: artist.lead })
  ;(artist.paragraphs ?? []).forEach((p, i) => list.push({ key: `p${i}`, text: p }))
  if (artist.quote) list.push({ key: 'quote', className: 'about-quote', text: artist.quote })
  if (artist.awards?.length) {
    list.push({ key: 'awards', as: 'h3', text: '獲獎' })
    artist.awards.forEach((a, i) => list.push({ key: `a${i}`, as: 'li', group: 'awards', text: a }))
  }
  if (artist.exhibitions?.length) {
    list.push({ key: 'exhibitions', as: 'h3', text: '展覽經歷' })
    artist.exhibitions.forEach((e, i) => list.push({ key: `e${i}`, as: 'li', group: 'exhibitions', text: e }))
  }
  return list
}

// 把連續的清單項目包進 <ul>
function groupLists(items) {
  const out = []
  for (const item of items) {
    const last = out[out.length - 1]
    if (item.group && last?.group === item.group) last.items.push(item)
    else if (item.group) out.push({ key: `list-${item.key}`, group: item.group, items: [item] })
    else out.push(item)
  }
  return out
}

export default function About() {
  const { artist } = useSiteContent()
  const [opened, setOpened] = useState(false)
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)

  const items = segments(artist)
  const index = Object.fromEntries(items.map((s, i) => [s.key, i]))
  const done = finished || step >= items.length

  function write(s) {
    const i = index[s.key]
    return (
      <PenText
        key={s.key}
        as={s.as ?? 'p'}
        className={s.className ?? ''}
        text={s.text}
        brush
        speed={s.as === 'h3' ? 180 : 55}
        start={opened && step >= i}
        finish={finished}
        onDone={() => setStep((n) => Math.max(n, i + 1))}
      />
    )
  }

  return (
    <main className="container">
      <header className="page-title">
        <p className="eyebrow">L'Artista</p>
        <h1>畫家 {artist.name}</h1>
        <Ornament />
      </header>

      <section className="about">
        <figure className="about-portrait">
          <div className="frame oval hang">
            <div className="frame-mat">
              <img src={imageUrl(artist.portrait)} alt={artist.name} />
            </div>
          </div>
          <figcaption className="placard">
            <span className="placard-title">{artist.name}</span>
            <span className="placard-style">{artist.education}</span>
          </figcaption>
        </figure>

        <div className="about-scroll-wrap">
          <ScrollPaper className="about-scroll" onOpen={() => setOpened(true)}>
            {/* 點一下捲軸內容就把剩下的字全部寫完 */}
            <div
              className="about-brush"
              onClick={() => setFinished(true)}
              title={done ? undefined : '點一下顯示全部文字'}
            >
              {groupLists(items).map((s) =>
                s.items ? <ul key={s.key} className="honours">{s.items.map(write)}</ul> : write(s),
              )}
            </div>
          </ScrollPaper>
          {opened && !done && (
            <p className="center">
              <button type="button" className="link-button" onClick={() => setFinished(true)}>全部顯示 ›</button>
            </p>
          )}
        </div>
      </section>

      <p className="center">
        <Link to="/" className="button">欣賞作品</Link>
      </p>
      {artist.sources?.length > 0 && (
        <p className="muted center sources">
          資料來源：
          {artist.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && '、'}
              <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
            </span>
          ))}
        </p>
      )}
    </main>
  )
}
