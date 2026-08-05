# ADR-0001：雙語網址與 Reader Identity

- 狀態：採用
- 日期：2026-07-20
- 關聯：GitHub Issue #3 及 2026-07-19 的需求調整留言

## 背景

「允生作品」需同時面向繁體中文與簡體中文讀者，並在現有 Sign in with ChatGPT 之外提供 Email 與手機號密碼帳號。身份擴充不得把同一讀者的閱讀進度、購買記錄與未來權益分裂到平行帳號。

Issue 留言取代了原 PRD 的驗證信與自助重設要求：本階段不寄送 Email／SMS 驗證碼，密碼修改或忘記密碼由可設定的人工客服 Email 協助。

## 決策

### 語系與網址

- 正式語系固定為 `zh-Hant` 與 `zh-Hans`，公開網址使用對應前綴。
- 無前綴舊網址依語系 cookie、`Accept-Language`、繁體預設的順序導向；查詢參數保留。
- `proxy.ts` 將語系寫入請求 header 與一年期間的第一方 cookie。根佈局用此 header 設定文件 `lang`。
- 公開頁面提供 canonical、`hreflang=zh-Hant`、`hreflang=zh-Hans` 與 `x-default`。切換器保留當前作品、章節或場景路徑。
- 閱讀進度仍以 Work、Chapter 與段落 ID 識別，不新增 locale 維度。

### 內容邊界

- UI 文案、作品前導與已選取場景使用明確的雙語資料。
- 公開簡體宣傳內容帶有 editorial version，且建置時驗證必要欄位、段落與章節對應數量；缺漏即終止建置。
- 簡體第一章在作者／編輯審核前維持 `preparing`，請求不會回傳機器轉換的完整正文。
- Work、Chapter 與段落 ID 跨語系穩定，不因轉換文字建立新識別。

### 帳號與密碼

- `reader_accounts` 是內部讀者主體；`reader_identities` 儲存 ChatGPT、Email 或 E.164 手機 alias；密碼憑證與 session 分表儲存。
- 中國大陸入口提供 Email 與手機密碼帳號；其他地區另保留 Sign in with ChatGPT。
- 手機號未經 SMS 驗證，只是登入 alias，不表示已驗證手機所有權。
- ChatGPT 身份只依供應商外部識別匹配，既有 migration 也完整保留該識別；絕不因匿名輸入的同名 Email 自動合併帳號。
- 已登入 Reader 可明確新增未被占用的 Email 或手機登入。帳號已有密碼時必須重新輸入目前密碼；尚未設定密碼的 ChatGPT Reader 才會建立新憑證。所有登入方式仍指向同一 Reader account。
- 密碼使用 PBKDF2-HMAC-SHA-256、600,000 次迭代、每筆 16 bytes 隨機 salt、版本化參數與部署密鑰 `AUTH_PASSWORD_PEPPER`。資料庫不儲存明文密碼、pepper 或 session token。
- 第一方 session 預設 30 天，cookie 使用 `HttpOnly`、`Secure`、`SameSite=Lax`；資料庫只儲存 token hash，登出時撤銷。
- 註冊與登入在 D1 使用 15 分鐘視窗，分別限制來源與帳號指紋；回應不暴露另一個帳號的資料。

### 人工客服與行銷偏好

- 不建立 OTP、驗證信、SMS sender 或自助密碼重設。密碼協助預設寄往 `txli@icloud.com`，可以 `READER_SUPPORT_EMAIL` 調整。客服不得索取現有或新密碼明文。
- 新註冊的行銷偏好依留言預設開啟，表單顯著提供取消勾選，並儲存通知版本與時間。既有帳號遷移時一律保持不接收。
- 帳號頁提供免費、隨時取消的偏好更新。本階段沒有建立任何行銷寄送功能；未來實際寄送前必須另行法遵審查。

## 結果與取捨

- 一般登入不產生 Email／SMS 按次費用，但密碼遺失的處理時間與身份核對成本轉移給人工客服。
- 未驗證手機 alias 的便利性高於所有權保證，介面不得將它標示為 verified phone。
- 簡體第一章會比 UI 與場景晚上線，以換取審校與手稿安全邊界。

## 部署條件

- 套用 Drizzle migrations 後驗證既有 Reader account、Reader state、Purchase record 與 entitlement 列數不變。
- 正式開放密碼註冊前，必須設定長度足夠的 `AUTH_PASSWORD_PEPPER`，並以正式 Worker 測量 600,000 次 PBKDF2 延遲。
- 如未能完成上述資料與 secret 檢查，不應部署或關閉 Issue #3。
