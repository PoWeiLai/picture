import { useState } from 'react'

// 點擊選檔或拖曳圖片進來；onFiles 收到的只會是圖片檔
export default function Dropzone({ onFiles, hint }) {
  const [dragging, setDragging] = useState(false)

  function accept(fileList) {
    const images = [...fileList].filter((f) => f.type.startsWith('image/'))
    if (images.length) onFiles(images)
  }

  return (
    <label
      className={dragging ? 'dropzone dragging' : 'dropzone'}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        accept(e.dataTransfer.files)
      }}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          accept(e.target.files)
          e.target.value = ''
        }}
      />
      <span className="dropzone-title">點此選擇圖片，或把圖片拖曳到這裡</span>
      {hint && <span className="muted">{hint}</span>}
    </label>
  )
}
