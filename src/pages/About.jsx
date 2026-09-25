import { Link } from 'react-router-dom'
import { ARTIST } from '../siteConfig'
import Ornament from '../components/Ornament'

export default function About() {
  return (
    <main className="container">
      <header className="page-title">
        <p className="eyebrow">L'Artista</p>
        <h1>畫家 {ARTIST.name}</h1>
        <Ornament />
      </header>

      <section className="about">
        <figure className="about-portrait">
          <div className="frame oval">
            <div className="frame-mat">
              <img src={ARTIST.portrait} alt={ARTIST.name} />
            </div>
          </div>
          <figcaption className="placard">
            <span className="placard-title">{ARTIST.name}</span>
            <span className="placard-style">{ARTIST.education}</span>
          </figcaption>
        </figure>

        <div className="about-text">
          <p className="about-lead">{ARTIST.lead}</p>
          {ARTIST.paragraphs.map((p) => (
            <p key={p.slice(0, 12)}>{p}</p>
          ))}
          <blockquote className="about-quote">{ARTIST.quote}</blockquote>
        </div>
      </section>

      <section className="about-columns">
        <div className="panel">
          <h2>獲獎</h2>
          <ul className="honours">
            {ARTIST.awards.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
        <div className="panel">
          <h2>展覽經歷</h2>
          <ul className="honours">
            {ARTIST.exhibitions.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      </section>

      <p className="center">
        <Link to="/" className="button">欣賞作品</Link>
      </p>
      <p className="muted center sources">
        資料來源：
        {ARTIST.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && '、'}
            <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
          </span>
        ))}
      </p>
    </main>
  )
}
