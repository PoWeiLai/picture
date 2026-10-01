import { Link } from 'react-router-dom'
import Ornament from '../components/Ornament'
import { useSiteContent } from '../lib/siteContent'

// 「藝無界、美相遇」：展覽專區，內容沿用後台「網站內容」的封面展覽與展覽經歷
export default function Exhibitions() {
  const { hero, artist } = useSiteContent()
  const exhibitions = artist.exhibitions ?? []

  return (
    <main className="container">
      <header className="page-title">
        <p className="eyebrow">Mostre</p>
        <h1>藝無界、美相遇</h1>
        <Ornament />
        <p className="tagline">走出畫室，讓作品與每一位觀者相遇。</p>
      </header>

      <section className="exhibit-feature">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h2>{hero.title}</h2>
        {hero.subtitle && <p className="exhibit-subtitle">{hero.subtitle}</p>}
        {hero.exhibition && <p className="muted">{hero.exhibition}</p>}
        {hero.intro && <p>{hero.intro}</p>}
        {hero.link && (
          <a href={hero.link} target="_blank" rel="noreferrer">展覽介紹 ↗</a>
        )}
      </section>

      {exhibitions.length > 0 && (
        <section className="exhibit-list">
          <h3>展覽經歷</h3>
          <ul className="honours">
            {exhibitions.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </section>
      )}

      <p className="center">
        <Link to="/?kind=video#collection" className="button">觀看展覽報導影片</Link>
      </p>
    </main>
  )
}
