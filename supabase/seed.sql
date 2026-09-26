-- 初始作品資料（選用）：在執行 schema.sql 之後執行，會把四幅已知作品加入網站。
-- 圖片放在網站的 public/works/ 資料夾，不需另外上傳。
insert into public.paintings (title, description, category_id, image_path, year, medium, dimensions, created_at)
select v.title, v.description, (select id from public.categories where name = '油畫'), v.image_path, v.year, '油畫', v.dimensions, v.created_at::timestamptz
from (values
  ('秋天裡的露穗',
   '以秋日景致為描繪主題。金門隨風搖曳的金黃高粱，在藍天下低垂著飽滿的穗，鳥兒穿梭其間，將童年故鄉的記憶片段，重新連結成一片溫暖的秋色。',
   '/works/autumn-dew-ears.jpg', 2023, '60P（130 × 89 cm）', '2023-06-02'),
  ('瓜架下的光陰',
   '將視線帶入農家生活。瓜架下垂掛的瓜果與悠然漫步的雞隻，在光影變化與細節描繪中，捕捉農家生活真摯而樸實的片刻。',
   '/works/gourd-trellis.jpg', 2025, '10F（53 × 45.5 cm）', '2025-01-01'),
  ('棲於光中的節律',
   '透過光影與生命意象，寄託生命延續與希望。小鳥佇立於盛放的向日葵之上，在柔和的天光裡，傳達自然萬物的溫柔與生命的韻律。',
   '/works/rhythm-in-light.jpg', 2026, '10F（53 × 45.5 cm）', '2026-01-02'),
  ('牆下日常',
   '從紅磚牆與雞群等鄉間景物出發，呈現生活中自然、安定的節奏。不刻意追求華麗敘事，而是從日常細節出發，讓容易被忽略的風景，化為值得細細品味的藝術語言。',
   '/works/under-the-wall.jpg', 2026, '40M（100 × 65 cm）', '2026-01-03')
) as v(title, description, image_path, year, dimensions, created_at);

-- 影片作品（Google 雲端硬碟）
insert into public.paintings (title, description, category_id, video_url, image_path, medium)
values ('醉憶金門・展場紀錄', '於「醉憶金門」油畫創作個展展場，與作品一同留下的影像紀錄。', (select id from public.categories where name = '油畫'),
        'https://drive.google.com/file/d/1mC5hx7M7kJaN0lqoQFzigUY7NW_indcd/view', '/works/video-cover.jpg', '');

-- 畫室日常（示範照片，可在管理頁刪除或替換）
insert into public.studio_photos (image_path, caption, taken_on) values
  ('/about/artist.jpg', '畫家許培璟', null),
  ('/works/video-cover.jpg', '「醉憶金門」油畫創作個展展場', '2023-06-02');
