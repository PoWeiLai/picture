// 已知作品資料（取自國際環宇時報〈許培璟以油彩寫鄉土　從光影與記憶描繪生命溫度〉）。
// 用於：未設定 Supabase 時的預覽模式；以及 supabase/seed.sql 的初始資料。
// image_path 以 / 開頭代表放在 public/ 資料夾的圖片。

export const CATEGORIES = [
  { id: 1, name: '水彩', sort_order: 1 },
  { id: 2, name: '油畫', sort_order: 2 },
  { id: 3, name: '素描', sort_order: 3 },
  { id: 4, name: '國畫', sort_order: 4 },
  { id: 5, name: '其他', sort_order: 99 },
]

export const WORKS = [
  {
    id: 1,
    title: '秋天裡的露穗',
    description:
      '以秋日景致為描繪主題。金門隨風搖曳的金黃高粱，在藍天下低垂著飽滿的穗，鳥兒穿梭其間，' +
      '將童年故鄉的記憶片段，重新連結成一片溫暖的秋色。',
    category_id: 2,
    image_path: '/works/autumn-dew-ears.jpg',
    video_url: null,
    year: 2023,
    medium: '油畫',
    dimensions: '60P（130 × 89 cm）',
    created_at: '2023-06-02T00:00:00Z',
  },
  {
    id: 2,
    title: '瓜架下的光陰',
    description:
      '將視線帶入農家生活。瓜架下垂掛的瓜果與悠然漫步的雞隻，' +
      '在光影變化與細節描繪中，捕捉農家生活真摯而樸實的片刻。',
    category_id: 2,
    image_path: '/works/gourd-trellis.jpg',
    video_url: null,
    year: 2025,
    medium: '油畫',
    dimensions: '10F（53 × 45.5 cm）',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 3,
    title: '棲於光中的節律',
    description:
      '透過光影與生命意象，寄託生命延續與希望。小鳥佇立於盛放的向日葵之上，' +
      '在柔和的天光裡，傳達自然萬物的溫柔與生命的韻律。',
    category_id: 2,
    image_path: '/works/rhythm-in-light.jpg',
    video_url: null,
    year: 2026,
    medium: '油畫',
    dimensions: '10F（53 × 45.5 cm）',
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 4,
    title: '牆下日常',
    description:
      '從紅磚牆與雞群等鄉間景物出發，呈現生活中自然、安定的節奏。' +
      '不刻意追求華麗敘事，而是從日常細節出發，讓容易被忽略的風景，化為值得細細品味的藝術語言。',
    category_id: 2,
    image_path: '/works/under-the-wall.jpg',
    video_url: null,
    year: 2026,
    medium: '油畫',
    dimensions: '40M（100 × 65 cm）',
    created_at: '2026-01-03T00:00:00Z',
  },
  {
    id: 5,
    title: '醉憶金門・展場紀錄',
    description: '於「醉憶金門」油畫創作個展展場，與作品一同留下的影像紀錄。',
    category_id: 2,
    image_path: '/works/video-cover.jpg',
    video_url: 'https://drive.google.com/file/d/1mC5hx7M7kJaN0lqoQFzigUY7NW_indcd/view',
    year: null,
    medium: '',
    dimensions: '',
    created_at: '2026-09-26T00:00:00Z',
  },
]
