import { Link } from 'react-router-dom'
import Ornament from '../components/Ornament'
import { useSiteContent } from '../lib/siteContent'
import { imageUrl } from '../lib/supabase'

// 媒體報導（新的放上面）：新增一篇就在這裡加一筆。摘要與重點用自己的話寫，不要整篇轉貼（報社有版權）
const PRESS = [
  {
    title: '走過白衣歲月，晚來畫出生命的光',
    subtitle: '專訪油畫家許培璟',
    source: '臺灣時報',
    date: '2026.10.06',
    reporter: '記者黃福鎮',
    image: '/works/under-the-wall.jpg',
    imageCaption: '〈牆下日常〉，報導中提到獲名家許義郎收藏',
    quote: '不只是「畫得像」，更在於「畫出感情」。',
    summary:
      '曾任台中榮總急重症護理師，走過人生半程才重拾童年的畫筆，一路進修到國立屏東大學視覺藝術研究所。' +
      '報導細數她從金門高粱到澎湖海景的創作，以及近年在各地的展覽與得獎。',
    highlights: [
      '2024 第七屆康堤盃社會組銀獎〈秋天裡的露穗〉',
      '2025 第八屆康堤盃金獎〈舐犢情深〉',
      '2025 澎湖水族館「情繫浯島、菊島」展覽',
    ],
    url: 'https://www.taiwantimes.com.tw/app-container/app-content/new/new-content-detail?blogId=blog-9a5cd936-a269-4352-b951-787e05cf352e&currentCategory=7',
  },
  {
    title: '許培璟護理師變畫家　澎湖水族館浯島菊島畫展',
    subtitle: '「情繫浯島、菊島–靜謐．自然．美的詩意」',
    source: '中央社',
    date: '2025.04.20',
    image: '/works/xiyu-lighthouse-dusk.jpg',
    imageCaption: '〈西嶼燈塔的黃昏〉',
    quote: '細膩的筆觸與色彩變化，呈現澎湖與金門之美。',
    summary:
      '重症病房護理師出身，離開職場後重拾童年興趣。幼年隨父親在金門住了十年，' +
      '把心中的金門聚落、白沙灘與澎湖的碧海藍天畫成這次在澎湖水族館的展覽。',
    highlights: ['2025.4.20 起於澎湖水族館展出，展期至 9 月底', '油畫、蠟畫及混合媒材'],
    url: 'https://www.cna.com.tw/news/acul/202504200132.aspx',
  },
]

// 「2023　某某個展　地點」→ 年份與內容分開顯示；沒有年份的照原樣
function splitYear(text) {
  const m = text.match(/^(\d{4})[\s　]+(.*)$/)
  return m ? { year: m[1], rest: m[2] } : { year: '', rest: text }
}

// 主打展覽與媒體報導共用的卡片：左邊畫作、右邊文字，兩者排版一致
function StoryCard({ image, caption, tag, meta, title, subtitle, quote, summary, highlights, link, linkText }) {
  return (
    <article className="panel story-card">
      {image && (
        <figure className="story-figure">
          <div className="frame">
            <div className="frame-mat">
              <img src={image} alt={caption ?? title} />
            </div>
          </div>
          {caption && <figcaption className="muted">{caption}</figcaption>}
        </figure>
      )}
      <div className="story-text">
        <p className="story-meta">
          <span className="story-tag">{tag}</span>
          {meta}
        </p>
        <h3>{title}</h3>
        {subtitle && <p className="story-subtitle">{subtitle}</p>}
        {quote && <blockquote className="story-quote">{quote}</blockquote>}
        {summary && <p className="story-summary">{summary}</p>}
        {highlights?.length > 0 && (
          <ul className="story-highlights">
            {highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>
        )}
        {link && <a href={link} target="_blank" rel="noreferrer" className="button">{linkText} ↗</a>}
      </div>
    </article>
  )
}

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

      <section className="exhibit-section">
        <h2 className="exhibit-heading">主打展覽</h2>
        <StoryCard
          image={hero.image && imageUrl(hero.image)}
          caption={hero.artwork?.title && `〈${hero.artwork.title}〉${hero.artwork.detail ? ' ' + hero.artwork.detail : ''}`}
          tag="個展"
          meta={hero.exhibition}
          title={hero.title}
          subtitle={hero.subtitle}
          summary={hero.intro}
          link={hero.link}
          linkText="展覽介紹"
        />
      </section>

      <section className="exhibit-section">
        <h2 className="exhibit-heading">媒體報導</h2>
        {PRESS.map((p) => (
          <StoryCard
            key={p.url}
            image={p.image}
            caption={p.imageCaption}
            tag={p.source}
            meta={[p.date, p.reporter].filter(Boolean).join(' · ')}
            title={p.title}
            subtitle={`—${p.subtitle}`}
            quote={p.quote}
            summary={p.summary}
            highlights={p.highlights}
            link={p.url}
            linkText="閱讀完整報導"
          />
        ))}
      </section>

      <p className="center exhibit-video">
        <Link to="/?kind=video#collection" className="button">觀看展覽報導影片</Link>
      </p>

      {exhibitions.length > 0 && (
        <section className="exhibit-section">
          <h2 className="exhibit-heading">展覽經歷</h2>
          <ul className="panel exhibit-list">
            {exhibitions.map((e, i) => {
              const { year, rest } = splitYear(e)
              return (
                <li key={i}>
                  <span className="exhibit-year">{year}</span>
                  <span>{rest}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
