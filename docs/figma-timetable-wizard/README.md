# 시간표마법사 (Timetable Wizard) — Figma research

Source Figma file: `INTIP (Copy)` — fileKey `6vRWpqOQ9pMJyMMr2558kf`
https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-

Pulled via Figma MCP (`get_metadata`) on 2026-08-01 while scoping implementation from the
`intip-mobile-app` repo. That repo turned out to be a pure WebView shell with no native UI
system, so implementation belongs here instead. Each file below has the raw node metadata
(names, layout tree, positions) for one screen. **Metadata only** — no code reference, design
tokens, or screenshot yet. Before implementing a screen, call `get_design_context` on its
nodeId (see individual files) to get the React reference code + tokens + screenshot.

## Flow

A 3-step wizard that generates candidate timetables from student-picked conditions, shows a
loading state, then recommendation results (with detail/save/overwrite sub-flows) or an
empty/error state.

| # | Screen | nodeId | File |
|---|--------|--------|------|
| 1 | 시간표마법사 (section title, not a real screen) | `3069:9555` | [01-title.md](./01-title.md) |
| 2 | Step 1 — 기본조건 (semester, target credits slider, must-have courses) | `3054:9211` | [02-step1-basic-conditions.md](./02-step1-basic-conditions.md) |
| 3 | Step 2 — 선호조건 (preference checkboxes C-01~C-06) | `3055:9246` | [03-step2-preference-conditions.md](./03-step2-preference-conditions.md) |
| 4 | Step 3 — 제외조건 (drag-select time grid to exclude, exclude-course search) | `3057:9281` | [04-step3-exclusion-conditions.md](./04-step3-exclusion-conditions.md) |
| 5 | 생성중 (loading, spinner + rotating copy) | `3057:9468` | [05-generating.md](./05-generating.md) |
| 6 | 추천결과 (3 result cards A/B/C, reasons, "자세히 보기") | `3058:9351` | [06-recommendation-results.md](./06-recommendation-results.md) |
| 7 | 저장옵션 바텀시트 (save as new / overwrite existing) | `3060:9419` | [07-save-options-bottomsheet.md](./07-save-options-bottomsheet.md) |
| 8 | 추천시간표 상세 (full grid + reasons + course list + save CTA) | `3059:9386` | [08-recommended-timetable-detail.md](./08-recommended-timetable-detail.md) |
| 9 | 빈상태 — 결과없음 (no timetable matched, conflicting conditions) | `3061:9485` | [09-empty-no-results.md](./09-empty-no-results.md) |
| 10 | 에러 — 생성실패 (network/generation error, retry) | `3061:9550` | [10-error-generation-failed.md](./10-error-generation-failed.md) |
| 11 | 덮어쓰기 확인모달 (destructive overwrite confirmation) | `3060:9477` | [11-overwrite-confirm-modal.md](./11-overwrite-confirm-modal.md) |
| 12 | AppBar (sub-component, "시안 A" detail header w/ credit badge) | `3059:9421` | [12-appbar-component.md](./12-appbar-component.md) |

## Shared components referenced across screens (check for reuse)

- `Nav_Back` instance (screens 2, 3, 4, 8) — back header with step counter (`1/3`, `2/3`) or
  action slot (`다시 만들기`, save button).
- `Bottom_CTA` instance (screens 2, 3, 4) — sticky bottom primary button.
- `Step_Indicator` (screens 2, 3, 4) — 3-segment progress bar.
- `iPhone-status-bar(upper)` / `(lower)` — status bar chrome, likely excluded from actual
  implementation (web/PWA chrome differs from the Figma iPhone frame).
- AppBar (screen 12) is the header used standalone on screens 9, 10, and reused inside the
  detail screen (8).
