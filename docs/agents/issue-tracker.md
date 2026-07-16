# Issue tracker：GitHub

本專案的 Issues 與 PRD 發佈於 GitHub repository `TavisLi/-`。由於本機 Sites 專案未設定 GitHub remote，所有 GitHub CLI 操作均應明確傳入 `--repo TavisLi/-`。

## 慣例

- 建立 issue：`gh issue create --repo TavisLi/- --title "..." --body-file <file>`
- 讀取 issue：`gh issue view <number> --repo TavisLi/- --comments`
- 列出 issue：`gh issue list --repo TavisLi/- --state open`
- 留言：`gh issue comment <number> --repo TavisLi/- --body "..."`
- 新增或移除標籤：`gh issue edit <number> --repo TavisLi/- --add-label "..."`／`--remove-label "..."`
- 關閉 issue：`gh issue close <number> --repo TavisLi/- --comment "..."`

## Pull request 作為需求入口

外部 pull request 不作為需求 triage 入口。Pull request 屬於實作與審查流程，不自動併入 issue 需求分流。

## 發佈規則

當工程技能要求發佈 PRD 或工作項目時，建立 GitHub Issue。未特別標示 pull request 的 `#編號` 一律視為 issue。
