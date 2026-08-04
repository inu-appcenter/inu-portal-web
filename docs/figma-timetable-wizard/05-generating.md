# 생성중 (Generating loading state)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3057-9468
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3057:9468`
- Frame: `마법사_생성중`, 393×852

## What it contains

Centered loading state, no header/back nav:

- `Spinner` (72×72) over an `Ellipse` track — likely a circular progress/spinner animation.
- Copy: "시간표를 조합하는 중" (title) / "조건에 맞는 강의를 찾고 있어요" (subtitle).
- `Rotation_Note`: "문구 로테이션 2초 간격 · 최대 대기 10초" — this is a **designer
  annotation describing behavior**, not on-screen copy: the subtitle text should rotate every
  2s, and the whole loading state should time out / transition after a 10s max wait (likely
  to the error state, `10-error-generation-failed.md`, on timeout/failure).
- `Btn_Cancel` — "취소" button pinned near the bottom to abort generation.

## Raw metadata (get_metadata)

```xml
<frame id="3057:9468" name="마법사_생성중" x="1872" y="6997" width="393" height="852">
  <instance id="3057:9469" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <instance id="3057:9503" name="iPhone-status-bar(lower)" x="0" y="820" width="393" height="32" />
  <frame id="3057:9506" name="Loading_Center" x="0" y="330" width="393" height="213">
    <frame id="3057:9507" name="Spinner" x="160.5" y="0" width="72" height="72" />
    <frame id="3057:9509" name="Copy" x="0" y="96" width="393" height="56">
      <text id="3057:9510" name="시간표를 조합하는 중" x="0" y="0" width="393" height="27" />
      <text id="3057:9511" name="조건에 맞는 강의를 찾고 있어요" x="0" y="35" width="393" height="21" />
    </frame>
    <frame id="3057:9512" name="Rotation_Note" x="90.5" y="176" width="212" height="37">
      <text id="3057:9513" name="문구 로테이션 2초 간격 · 최대 대기 10초" x="14" y="10" width="184" height="17" />
    </frame>
  </frame>
  <ellipse id="3057:9508" name="Ellipse" x="160.5" y="330" width="72" height="72" />
  <frame id="3057:9514" name="Cancel" x="0" y="740" width="393" height="60">
    <frame id="3057:9515" name="Btn_Cancel" x="136.5" y="8" width="120" height="44">
      <text id="3057:9516" name="취소" x="46" y="10.5" width="28" height="23" />
    </frame>
  </frame>
</frame>
```
