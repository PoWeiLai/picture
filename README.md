# 許培璟的畫廊

展示媽媽畫作的網站：依風格分類瀏覽，朋友註冊後可以留言評論，只有媽媽（管理員）能上傳與管理畫作。

技術：React + Vite 前端，Supabase（登入、資料庫、圖片儲存）。

## 功能

- **畫作牆**：所有人都能瀏覽，可依風格分類篩選
- **畫作頁**：大圖、說明、評論區；登入後可留言，可刪除自己的評論
- **帳號**：Email + 密碼註冊登入，帳戶設定可改顯示名稱與密碼
- **後台** `/admin`（僅管理員）：總覽、作品（匯入圖片／影片、搜尋、完整編輯）、分類（含排序）、畫室照片、留言管理、會員管理（設定管理員）、網站內容（首頁封面與畫家頁文字、圖片）
- **網站內容預設值**：後台尚未修改前，首頁封面與畫家頁使用 `src/siteConfig.js` 的內容

> 如果之前已經執行過舊版 `schema.sql`，請依序執行 `supabase/migrations/` 裡尚未執行的檔案。

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

網站部署在 [Render](https://render.com)（免費的靜態網站方案），設定都寫在 `render.yaml`。

1. 把專案推上 GitHub。
2. 在 Render 後台選 **New → Blueprint**，連接 GitHub 並選這個儲存庫，按 **Apply**。
3. 接上 Supabase 後，到 Render 服務的 **Environment** 填入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，
   重新部署一次；並把 Supabase 的 Site URL 改成 Render 給的正式網址。

之後每次推送到 `main` 分支，Render 都會自動重新部署。
