# Yunsheng Works Web — AGENTS.md

適用：本獨立 Git/GitHub repo 全部內容。

此 repo 是已上線的允生作品宣傳網站。它是 production product，不是一般 campaign asset；規劃逐步迭代為 StoryForge 公司對外官網，但目前尚未完成該轉型。

專案文件、issue 與 PR 預設使用繁體中文，除非使用者另有指定。

## 1. Product Priorities

按優先順序：

1. 不洩露鎖章與未公開正文
2. 保持 production 可用性
3. 保持作品／作者資訊與 canon 一致
4. 改善讀者體驗、內容發現與轉化
5. 維持可 review、可測試、可回滾的工程流程
6. 公司官網化只依經批准的產品規格逐步進行，不以治理方向直接擴張本次工程 scope

## 2. Git Workflow

Agent engineering task 優先使用：

```text
task
→ branch / worktree
→ implementation
→ checks
→ review
→ PR
→ approval if production-triggering
→ merge
→ deploy
→ smoke check
```

- 不直接 force push。
- 不 rewrite shared history。
- 不重新初始化 repo。
- 不變更 remote / ownership，除非 Human Approval。
- 多 Agent 可用不同 worktree 並行，但 Codex Orchestrator 決定 merge order。

## 3. Before Coding

先確認 repo 內現有：
- README / architecture docs
- 根目錄 `CONTEXT.md`
- 相關 `docs/adr/`
- package manager
- build command
- test command
- lint command
- deployment config
- environment variable convention

不要從一般 Next.js/Vercel/GitHub 經驗猜測此 repo 一定使用某個框架或 hosting provider；以實際 repository 為準。

本專案採 single-context。修改產品行為前，先閱讀根目錄 `CONTEXT.md` 與相關 `docs/adr/`，並依 `docs/agents/domain.md` 的 domain 規則工作。

Issues 與 PRD 統一追蹤於 GitHub repository `TavisLi/yunsheng-works`；外部 pull request 不作為 triage 需求入口。詳見 `docs/agents/issue-tracker.md`。

使用預設 `needs-*`、`ready-for-*` 與 `wontfix` 標籤。詳見 `docs/agents/triage-labels.md`。

只處理明確要求的範圍；支付、訂單或內容授權等敏感邊界不得由 Agent 自行擴張。

初期電子書支付、訂單、退款與平台結算由 Apple Books 或後續採用的發行平台處理。除非另有已批准規格，本網站不自營金流；既有 purchase / entitlement schema 不代表已具備支付能力。

## 4. Content Safety

不得把以下內容加入可公開頁面或 public preview：

- 鎖章
- 未公開正文
- 未批准摘錄
- 未驗證合作／銷售／讀者數據
- 敏感個資
- campaign draft 誤標為 official

若產品需要顯示作品 excerpt，必須確認來源已批准。

## 5. Engineering Validation

任何實質 code change，按 repo 實際能力執行：

- install/dependency check
- build
- lint
- tests
- typecheck（若存在）
- security / secret check（若存在）
- manual smoke check / browser verification（重要 UI 變更）

不得虛構「測試通過」；只能記錄實際執行結果。

## 6. PR Requirements

PR 至少說明：
- Task ID
- user-visible change
- technical change
- checks run
- screenshots / preview（若安全且適用）
- content/canon impact
- deployment impact
- rollback note for significant changes

## 7. Production Gate

如果 merge 會自動觸發 production deployment，merge 本身需要 Human Approval。

production deploy 前確認：
- build/test pass
- no restricted content
- links/assets valid
- no secret exposure
- rollback path understood

production 後：
- smoke test
- 記錄 deployment / verification evidence（重大變更）

涉及讀者帳號、行銷同意、production data、schema migration、帳號／權益更正時，另受 StoryForge `../../strategy/data-security-policy.md` 與 Data / Product Owner gate 約束。

## 8. Multi-agent Guidance

適合平行：
- feature implementation
- test coverage
- accessibility review
- performance analysis
- SEO/content structure analysis
- independent code review

避免平行：
- 多 Agent 同時改同一 layout / routing core
- 多 Agent 同時改 production config
- 多 Agent 同時 merge/deploy

## 9. Relationship to StoryForge

本 repo 受 StoryForge：
- `../../strategy/approval-policy.md`
- `../../strategy/data-security-policy.md`
- `../../strategy/repository-governance.md`
- `../../strategy/rights-release-policy.md`
- Yunsheng canon / campaign boundaries

約束。

若本 repo 本地規則與 StoryForge 的內容安全／人工審批衝突，以較嚴格的安全與 approval 規則為準。

StoryForge workspace 搬遷不等於本 repo 歷史重建。搬遷時必須保留 `.git`、remote、branch 與 deployment lifecycle，並在搬遷驗收後才把本 repo 納入首次 S2 pilot 的候選範圍。
