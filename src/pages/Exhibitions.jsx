import { Link } from 'react-router-dom'
import Ornament from '../components/Ornament'
import { useSiteContent } from '../lib/siteContent'

// 媒體報導：新增一篇就在這裡加一筆
const PRESS = [
  {
    title: "走過白衣歲月，晚來畫出生命的光—專訪油畫家許培璟",
    source: "臺灣時報",
    url: "https://www.taiwantimes.com.tw/app-container/app-content/new/new-content-detail?blogId=blog-9a5cd936-a269-4352-b951-787e05cf352e&currentCategory=7",
  },
]

// 「藝無界、美相遇」：展覽專區，內容在後台「藝無界、美相遇」編輯（主打展覽與展覽經歷）
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

      <section className="exhibit-list">
        <h3>媒體報導</h3>
        <ul className="honours">
          {PRESS.map((p) => (
            <li key={p.url}>
              <a href={p.url} target="_blank" rel="noreferrer">{p.title} ↗</a>
              <span className="muted">（{p.source}）</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="center">
        <Link to="/?kind=video#collection" className="button">觀看展覽報導影片</Link>
      </p>
    </main>
  )
}
