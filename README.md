# 許培璟的畫廊

展示媽媽畫作的網站：依風格分類瀏覽，朋友註冊後可以留言評論，只有媽媽（管理員）能上傳與管理畫作。

技術：React + Vite 前端，Supabase（登入、資料庫、圖片儲存）。

## 功能

- **畫作牆**：所有人都能瀏覽，可依風格分類篩選
- **畫作頁**：大圖、說明、評論區；登入後可留言，可刪除自己的評論
- **帳號**：Email + 密碼註冊登入，帳戶設定可改顯示名稱與密碼
- **管理頁**（僅媽媽）：批次匯入畫作圖片（可拖曳多張）、以網址匯入影片（YouTube / Vimeo / .mp4）、管理風格分類、刪除作品與任何評論
- **首頁封面**：文字與圖片在 `src/siteConfig.js` 和 `public/hero.jpg` 修改

> 如果之前已經執行過舊版 `schema.sql`，請再執行 `supabase/migrations/002_videos.sql` 以支援影片。

## 第一次設定

1. 到 [supabase.com](https://supabase.com) 註冊並建立新專案（免費方案即可）。
2. 在專案後台 **SQL Editor** 貼上 `supabase/schema.sql` 的全部內容並執行。
3. 到 **Project Settings → API**，複製 Project URL 和 `anon` public key。
4. 把 `.env.example` 複製成 `.env.local`，填入上面兩個值。
5. 到 **Authentication → URL Configuration**，把 Site URL 設成網站網址（本機開發用 `http://localhost:5173`）。
6. 執行：
   ```
   npm install
   npm run dev
   ```
7. 讓媽媽在網站上註冊帳號並完成 Email 驗證，再到 SQL Editor 執行（email 換成她的）：
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'mom@example.com');
   ```
   重新整理後，導覽列會出現「管理」。

## 部署

`npm run build` 會產生 `dist/`，可以部署到 Vercel、Netlify 或 Cloudflare Pages（免費）。
記得在部署平台設定 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 環境變數，
並把 Supabase 的 Site URL 改成正式網址。因為用了前端路由，需要設定所有路徑都回傳 `index.html`
（Vercel / Cloudflare Pages 預設即可；Netlify 需加 `_redirects` 檔：`/* /index.html 200`）。
