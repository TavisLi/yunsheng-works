# 允生作品｜代理協作規範

- 專案文件與 issue 預設使用繁體中文，除非使用者另有指定。
- 修改產品行為前，先閱讀根目錄 `CONTEXT.md` 與相關 `docs/adr/`。
- 只處理明確要求的範圍；支付、訂單或內容授權等敏感邊界不得由代理自行擴張。
- 完成變更前，至少執行與使用者流程相對應的最高層行為測試與正式建置。

## Agent skills

### Issue tracker

Issues 與 PRD 統一追蹤於 GitHub repository `TavisLi/-`；外部 pull request 不作為 triage 需求入口。詳見 `docs/agents/issue-tracker.md`。

### Triage labels

使用預設 `needs-*`、`ready-for-*` 與 `wontfix` 標籤。詳見 `docs/agents/triage-labels.md`。

### Domain docs

本專案採 single-context；閱讀根目錄 `CONTEXT.md` 與相關 `docs/adr/`。詳見 `docs/agents/domain.md`。
