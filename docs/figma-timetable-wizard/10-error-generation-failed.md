# 에러 — 생성실패 (Generation failed / network error)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3061-9550
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3061:9550`
- Frame: `에러_생성실패`, 393×852

## What it contains

Structurally the same shell as the empty state (same `AppBar`, same `Bottom_CTA` slot), but
a different `Illust`/text/CTA combination for a hard error rather than a no-match result:

- `AppBar`: back chevron + "추천 시간표" title (identical to empty state).
- `Illust`: 120×120 slot with a large "!" glyph.
- Text: "시간표를 만들지 못했어요" (title) / "네트워크 상태를 확인하고 다시 시도해주세요"
  (subtitle) — this is framed as a network failure specifically.
- `Bottom_CTA`: "다시 시도" (retry) — re-triggers generation, unlike the empty state's
  "조건 완화하기" which routes back into the wizard.

This is very likely the state you land in from the [05-generating.md](./05-generating.md)
screen's 10s timeout / on any request failure. Worth sharing a common `Body_Error` /
`Body_Empty` layout primitive (icon + title + subtitle + optional card) between this and
09, since only the illustration, copy, and CTA differ.

## Raw metadata (get_metadata)

```xml
<frame id="3061:9550" name="에러_생성실패" x="4530" y="6997" width="393" height="852">
  <instance id="3061:9551" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <instance id="3061:9585" name="iPhone-status-bar(lower)" x="0" y="820" width="393" height="32" />
  <frame id="3061:9588" name="AppBar" x="0" y="44" width="393" height="68">
    <frame id="3061:9589" name="Icon_Back" x="20" y="10" width="40" height="40">
      <text id="3061:9590" name="‹" x="15.5" y="0.5" width="9" height="39" />
    </frame>
    <text id="3061:9591" name="추천 시간표" x="68" y="15" width="305" height="30" />
  </frame>
  <frame id="3061:9592" name="Body_Error" x="0" y="200" width="393" height="260">
    <frame id="3061:9593" name="Illust" x="136.5" y="40" width="120" height="120">
      <text id="3061:9594" name="!" x="52.5" y="30" width="15" height="60" />
    </frame>
    <frame id="3061:9595" name="Text" x="16" y="180" width="361" height="56">
      <text id="3061:9596" name="시간표를 만들지 못했어요" x="0" y="0" width="361" height="27" />
      <text id="3061:9597" name="네트워크 상태를 확인하고 다시 시도해주세요" x="0" y="35" width="361" height="21" />
    </frame>
  </frame>
  <frame id="3061:9598" name="Bottom_CTA" x="0" y="748" width="393" height="72">
    <frame id="3061:9599" name="Btn_Retry" x="20" y="8" width="353" height="56">
      <text id="3061:9600" name="다시 시도" x="145" y="16" width="63" height="24" />
    </frame>
  </frame>
</frame>
```
