import { useCallback, useState } from 'react'
import Lightbox from './Lightbox'
import Ornament from './Ornament'

// 生活點滴頁上方的「熱蠟畫」介紹：熱蠟小知識，加上基底蠟製作 → 封板 → 繪畫的過程照片
const STEPS = [
  { title: '一、基底蠟製作', note: '把丹瑪樹脂、蜂蠟與巴西棕櫚蠟加熱融化，調成作畫用的基底蠟。', photos: ['base-1', 'base-2'] },
  { title: '二、封板', note: '趁熱把基底蠟刷上木板，封好畫板表面。', photos: ['seal-1', 'seal-2'] },
  { title: '三、繪畫過程', note: '將色蠟融化上色，再用火槍加熱讓顏色融合、堆疊出層次。', photos: ['paint-1', 'paint-2', 'paint-3', 'paint-4'] },
]

const PHOTOS = STEPS.flatMap((s) =>
  s.photos.map((name, i) => ({ id: name, image_path: `/wax/${name}.jpg`, caption: `${s.title.slice(2)} ${i + 1}` })),
)

export default function WaxProcess() {
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <section className="wax-process">
      <header className="page-title">
        <p className="eyebrow">Encaustic Painting</p>
        <h2 className="wax-title">熱蠟畫</h2>
        <Ornament />
        <p className="tagline">以蠟為媒材、趁熱作畫，一種跨越兩千年的古老技法。</p>
      </header>

      <div className="panel wax-intro">
        <h3>熱蠟小知識</h3>
        <p>
          蠟畫（Encaustic painting）出現於西元前五世紀，是使用蠟作為主要媒材的一種古老繪畫技法，具有悠久的歷史。西元 1
          世紀，羅馬學者老普林尼在其著作《博物志》中記載了蠟畫的製作與應用方式。現存最古老的蠟畫作品是埃及羅馬時期的「法尤姆木乃伊肖像」。
          然而，隨著中世紀油畫技法的興起，蠟畫逐漸被油畫取代，因為油畫的操作更為便利且適合大規模創作。
        </p>
        <p>蠟畫技法的材料包括：</p>
        <ol>
          <li>丹瑪樹脂</li>
          <li>蜂蠟：作為主要的媒介，提供柔軟性和可塑性。</li>
          <li>巴西棕櫚蠟：提升硬度與抗濕性，使作品能夠保存更長時間不退色。</li>
        </ol>
        <p>
          熱蠟的技法需要將顏料或色粉，與加熱後融化的基礎蠟混合，趁熱蠟尚未冷卻時進行繪製。由於蠟具有快速凝固的特性，創作過程需要精細且快速地操作，技術難度較高，完成後的作品具有豐富的色彩層次和良好的保存性。
        </p>
      </div>

      {STEPS.map((s) => (
        <div key={s.title} className="wax-step">
          <h3>{s.title}</h3>
          <p className="muted">{s.note}</p>
          <div className="wax-photos">
            {s.photos.map((name) => {
              const i = PHOTOS.findIndex((p) => p.id === name)
              return (
                <button key={name} type="button" className="studio-item" data-sound="clink" onClick={() => setOpen(i)}>
                  <div className="frame small-ornate">
                    <div className="frame-mat">
                      <img src={PHOTOS[i].image_path} alt={PHOTOS[i].caption} loading="lazy" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {open !== null && <Lightbox photos={PHOTOS} index={open} onChange={setOpen} onClose={close} />}
    </section>
  )
}
