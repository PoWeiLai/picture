import { Link } from 'react-router-dom'
import Ornament from '../components/Ornament'
import Book from '../components/Book'
import { swing } from '../lib/motion'
import { imageUrl } from '../lib/supabase'
import { useSiteContent } from '../lib/siteContent'

function bookPages(artist) {
  const [first, ...rest] = artist.paragraphs ?? []
  return [
    {
      title: '創作理念',
      content: (
        <>
          <p className="about-lead">{artist.lead}</p>
          {first && <p>{first}</p>}
        </>
      ),
    },
    {
      title: '光影與記憶',
      content: (
        <>
          {rest.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {artist.quote && <blockquote className="about-quote">{artist.quote}</blockquote>}
        </>
      ),
    },
    {
      title: '獲獎與展覽',
      content: (
        <>
          <h3>獲獎</h3>
          <ul className="honours">
            {(artist.awards ?? []).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
          <h3>展覽經歷</h3>
          <ul className="honours">
            {(artist.exhibitions ?? []).map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </>
      ),
    },
  ]
}

export default function About() {
  const { artist } = useSiteContent()

  return (
    <main className="container">
      <header className="page-title">
        <p className="eyebrow">L'Artista</p>
        <h1>畫家 {artist.name}</h1>
        <Ornament />
      </header>

      <section className="about">
        <figure className="about-portrait">
          <div className="frame oval hang" onClick={(e) => swing(e.currentTarget)}>
            <div className="frame-mat">
              <img src={imageUrl(artist.portrait)} alt={artist.name} />
            </div>
          </div>
          <figcaption className="placard">
            <span className="placard-title">{artist.name}</span>
            <span className="placard-style">{artist.education}</span>
          </figcaption>
        </figure>

        <Book pages={bookPages(artist)} />
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
