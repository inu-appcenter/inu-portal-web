# 빈상태 — 결과없음 (Empty state — no matching timetable)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3061-9485
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3061:9485`
- Frame: `빈상태_결과없음`, 393×852

## What it contains

- `AppBar` (inline here, not the shared instance): back chevron + "추천 시간표" title, no
  badge (compare [12-appbar-component.md](./12-appbar-component.md), which has a badge —
  the AppBar looks like a slot-based component where the trailing badge is optional/only
  present when there's a result to summarize).
- `Illust`: 120×120 illustration slot, labeled "횃불이" (INTIP's mascot character name —
  reuse the existing mascot illustration asset rather than re-exporting from Figma if one
  already exists in this repo's `resources`/`public`).
- Text: "조건에 맞는 시간표를 못 찾았어요" (title) / "조건을 조금만 풀면 결과가 나올 수 있어요"
  (subtitle).
- `Conflict_Card`: "⚠ 서로 충돌하는 조건" — bulleted list of the specific conditions that
  conflicted (e.g. "오전 수업 없음 (10:30 이후 시작)", "야간 수업 제외 (18:00 이후 제외)",
  "금요일 공강") + explanatory line "세 조건을 동시에 만족하는 조합이 없어요." This implies
  the generation logic needs to report *which* conditions were mutually exclusive, not just
  "no results."
- `Bottom_CTA`: "조건 완화하기" (relax conditions) — presumably routes back into the wizard
  steps with the conflicting conditions pre-highlighted for editing.

## Raw metadata (get_metadata)

```xml
<frame id="3061:9485" name="빈상태_결과없음" x="4087" y="6997" width="393" height="852">
  <instance id="3061:9486" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <instance id="3061:9520" name="iPhone-status-bar(lower)" x="0" y="820" width="393" height="32" />
  <frame id="3061:9523" name="AppBar" x="0" y="44" width="393" height="68">
    <frame id="3061:9524" name="Icon_Back" x="20" y="10" width="40" height="40">
      <text id="3061:9525" name="‹" x="15.5" y="0.5" width="9" height="39" />
    </frame>
    <text id="3061:9526" name="추천 시간표" x="68" y="15" width="305" height="30" />
  </frame>
  <frame id="3061:9527" name="Body_Empty" x="0" y="140" width="393" height="451">
    <frame id="3061:9528" name="Illust" x="136.5" y="40" width="120" height="120">
      <text id="3061:9529" name="횃불이" x="43" y="51" width="34" height="18" />
    </frame>
    <frame id="3061:9530" name="Text" x="16" y="180" width="361" height="56">
      <text id="3061:9531" name="조건에 맞는 시간표를 못 찾았어요" x="0" y="0" width="361" height="27" />
      <text id="3061:9532" name="조건을 조금만 풀면 결과가 나올 수 있어요" x="0" y="35" width="361" height="21" />
    </frame>
    <frame id="3061:9533" name="Conflict_Card" x="16" y="256" width="361" height="171">
      <frame id="3061:9534" name="Head" x="16" y="16" width="329" height="21">
        <text id="3061:9535" name="⚠" x="0" y="0" width="13" height="20" />
        <text id="3061:9536" name="서로 충돌하는 조건" x="19" y="0" width="310" height="21" />
      </frame>
      <frame id="3061:9537" name="Item" x="16" y="47" width="329" height="20">
        <text id="3061:9538" name="·" x="0" y="0" width="8" height="20" />
        <text id="3061:9539" name="오전 수업 없음 (10:30 이후 시작)" x="16" y="0" width="313" height="20" />
      </frame>
      <frame id="3061:9540" name="Item" x="16" y="77" width="329" height="20">
        <text id="3061:9541" name="·" x="0" y="0" width="8" height="20" />
        <text id="3061:9542" name="야간 수업 제외 (18:00 이후 제외)" x="16" y="0" width="313" height="20" />
      </frame>
      <frame id="3061:9543" name="Item" x="16" y="107" width="329" height="20">
        <text id="3061:9544" name="·" x="0" y="0" width="8" height="20" />
        <text id="3061:9545" name="금요일 공강" x="16" y="0" width="313" height="20" />
      </frame>
      <text id="3061:9546" name="세 조건을 동시에 만족하는 조합이 없어요." x="16" y="137" width="329" height="18" />
    </frame>
  </frame>
  <frame id="3061:9547" name="Bottom_CTA" x="0" y="748" width="393" height="72">
    <frame id="3061:9548" name="Btn_Relax" x="20" y="8" width="353" height="56">
      <text id="3061:9549" name="조건 완화하기" x="130.5" y="16" width="92" height="24" />
    </frame>
  </frame>
</frame>
```
