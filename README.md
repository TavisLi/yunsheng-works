# 允生作品

「允生作品」是允生的原創小說品牌與網頁閱讀平台。《燦燦烈日下》是第一部公開作品，目前網站提供品牌首頁、作品展示、場景節選、作品前導與第一章免費試讀。

## 目前功能

- 「允生作品」品牌首頁與作品入口
- 《燦燦烈日下》專屬作品展示頁
- 三個附插畫的公開場景節選
- 作品前導與第一章免費試讀
- 支援字體大小、日夜模式與本機閱讀進度的網頁閱讀器
- Sign in with ChatGPT 讀者帳號與跨裝置閱讀狀態同步
- D1 持久化讀者資料與購買記錄唯讀介面
- 未開放章節不向瀏覽器傳送正文的內容保護邊界

本站目前不提供內容後台、線上支付、訂單建立或完整電子書解鎖。購買記錄與購買權益已建立彼此分離的資料模型，但只能由未來受信任的支付流程寫入。完整產品語彙與範圍請閱讀 [`CONTEXT.md`](./CONTEXT.md)。

## 技術架構

網站使用 Next.js App Router、React、TypeScript 與 vinext，建置為 Cloudflare Worker 應用。作品與公開試讀內容由 TypeScript 內容 registry 管理；訪客狀態保存在瀏覽器 `localStorage`，登入後透過 D1 同步至讀者帳號。

詳細的路由、內容模型、安全邊界、建置流程與擴充原則請參考 [`docs/technical-architecture.md`](./docs/technical-architecture.md)。

## 環境需求

- Node.js `>=22.13.0`
- npm（以已提交的 `package-lock.json` 為準）

## 開始開發

```bash
npm install
npm run dev
```

啟動後依終端機顯示的本機網址開啟網站。

## 常用指令

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動 vinext 本機開發環境 |
| `npm run build` | 建立正式 Cloudflare Worker 產物 |
| `npm test` | 正式建置後驗證主要頁面、試讀與內容保護邊界 |
| `npm run lint` | 執行 ESLint |
| `npm run db:generate` | schema 變更後產生 Drizzle migration |

提交變更前至少執行：

```bash
npm test
npm run lint
```

## 主要目錄

```text
app/                    Next.js 路由、頁面、內容模組與閱讀器
build/                  Sites 建置封裝插件
db/                     Drizzle / D1 讀者帳號、閱讀狀態與購買資料
docs/                   技術架構與代理協作文件
drizzle/                D1 schema migration 與 Drizzle metadata
public/                 品牌與作品靜態圖像
tests/                  Worker 層渲染後 HTML 行為測試
worker/                 Cloudflare Worker 入口
.openai/hosting.json    Sites 專案與可選資源綁定設定
```

## 主要公開路由

| 路由 | 用途 |
| --- | --- |
| `/` | 品牌首頁（Brand home） |
| `/works/cancan-lierixia` | 《燦燦烈日下》作品展示頁（Work page） |
| `/works/cancan-lierixia/scenes/[sceneSlug]` | 場景節選詳情 |
| `/read/[workSlug]/[chapterSlug]` | 網頁閱讀器或未開放章節提示 |
| `/account` | 登入後的讀者帳號與購買記錄 |
| `/api/reader-state` | 登入讀者的閱讀狀態查詢與冪等同步 |
| `/api/purchases` | 登入讀者的購買記錄唯讀查詢 |

## 內容與資料邊界

- 公開作品、場景及試讀內容目前在 `app/content/` 維護。
- 未核准公開的章節正文不得出現在伺服器回應或瀏覽器 HTML。
- 未登入時，閱讀器狀態只存在目前裝置；登入後以最近更新時間與 D1 狀態合併並跨裝置同步。
- ChatGPT 身份只用於識別讀者；登入本身不代表擁有購買權益。
- 購買記錄只有唯讀瀏覽器介面，沒有由前端建立交易或權益的寫入路由。
- 草稿場景必須保持草稿標記，不可在未經作者確認時視為完稿正史。

## 協作文件

- [`AGENTS.md`](./AGENTS.md)：代理協作與驗證規範
- [`CONTEXT.md`](./CONTEXT.md)：產品領域術語與現況邊界
- [`docs/technical-architecture.md`](./docs/technical-architecture.md)：技術架構說明書
- [`docs/agents/`](./docs/agents/)：issue tracker、triage 標籤與領域文件說明
