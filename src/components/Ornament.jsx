// 巴洛克風格的渦卷花飾分隔線（左右對稱）
function Scroll() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round">
      <path strokeWidth="1.4" d="M150 18c-10 0-14-9-24-9-9 0-12 8-7 11 4 3 9-1 6-4" />
      <path strokeWidth="1.4" d="M150 18c-10 0-14 9-24 9-9 0-12-8-7-11" />
      <path strokeWidth="1.1" d="M112 18c-10-10-26-12-36-4-6 5-3 13 4 12 5-1 5-7 1-8" />
      <path strokeWidth="1.1" d="M112 18c-12 6-22 12-34 8" />
      <path strokeWidth="0.9" d="M76 16c-14-3-28 0-40 2" />
      <path strokeWidth="0.9" d="M100 12c2-6 8-9 13-7" />
      <circle cx="36" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="28" cy="18" r="1" fill="currentColor" stroke="none" />
    </g>
  )
}

export default function Ornament({ className = '' }) {
  return (
    <svg className={`ornament ${className}`} viewBox="0 0 320 36" aria-hidden="true">
      <Scroll />
      <g transform="translate(320 0) scale(-1 1)">
        <Scroll />
      </g>
      <path d="M160 6c4 5 8 8 8 12s-4 7-8 12c-4-5-8-8-8-12s4-7 8-12z" fill="currentColor" />
      <circle cx="160" cy="18" r="2" fill="var(--bg, #140c0a)" />
      <path d="M160 1v3M160 32v3" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
