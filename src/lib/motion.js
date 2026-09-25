// 畫框擺盪動畫的輔助函式（動畫本身定義在 index.css 的 .swinging）

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

// 讓元素像掛在釘子上一樣擺盪一次；重複點擊會重新開始
export function swing(el) {
  if (!el || prefersReducedMotion()) return
  el.classList.remove('swinging')
  void el.offsetWidth // 強制重新計算，讓動畫可以重播
  el.classList.add('swinging')
  el.addEventListener('animationend', () => el.classList.remove('swinging'), { once: true })
}
