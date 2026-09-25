import { useState } from 'react'
import { pageFlip } from '../lib/sounds'
import { toRoman } from '../lib/video'

// 皮革封面的書：紙頁以左側書脊為軸翻動。
// pages: [{ title, content }]；點頁面右半邊往後翻、左半邊往前翻。
export default function Book({ pages }) {
  const [index, setIndex] = useState(0)
  const last = pages.length - 1

  function go(next) {
    if (next < 0 || next > last || next === index) return
    pageFlip()
    setIndex(next)
  }

  function onPageClick(e) {
    // 點到頁面內的連結或按鈕時不翻頁
    if (e.target.closest('a, button')) return
    const rect = e.currentTarget.getBoundingClientRect()
    go(e.clientX - rect.left > rect.width / 2 ? index + 1 : index - 1)
  }

  return (
    <div className="book">
      <div className="book-cover">
        <div className="book-pages">
          {pages.map((page, i) => (
            <article
              key={page.title}
              className={`book-page ${i < index ? 'turned' : ''} ${i === index ? 'current' : ''}`}
              style={{ zIndex: i < index ? i : pages.length * 2 - i }}
              onClick={onPageClick}
              aria-hidden={i !== index}
            >
              <h2 className="book-title">{page.title}</h2>
              <div className="book-body">{page.content}</div>
              <span className="book-folio">— {toRoman(i + 1)} —</span>
            </article>
          ))}
        </div>
      </div>
      <nav className="book-nav" aria-label="翻頁">
        <button type="button" className="link-button" data-sound="none" onClick={() => go(index - 1)} disabled={index === 0}>
          ← 上一頁
        </button>
        <span className="muted">{index + 1} / {pages.length}</span>
        <button type="button" className="link-button" data-sound="none" onClick={() => go(index + 1)} disabled={index === last}>
          下一頁 →
        </button>
      </nav>
    </div>
  )
}
