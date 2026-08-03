# 덮어쓰기 확인모달 (Overwrite confirmation modal)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3060-9477
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3060:9477`
- Frame: `마법사_덮어쓰기_확인모달`, 393×852 (modal is 329×182, centered)

## What it contains

Destructive-action confirmation dialog over a dimmed background:

- Text: "기존 강의가 모두 사라져요" (title) / "'시간표 1'에 등록된 강의 6개가 삭제되고 시안
  A로 교체돼요. 되돌릴 수 없어요." (body — the timetable name, course count, and candidate
  label are all interpolated, so this needs to be a templated string, not static copy).
- Buttons: "취소" (cancel) / "덮어쓰기" (confirm overwrite) — side by side, equal width.

Triggered from the save-options bottom sheet
([07-save-options-bottomsheet.md](./07-save-options-bottomsheet.md)) when the user picks
"기존 시간표 덮어쓰기" and confirms save. Confirming here should perform the actual overwrite
and is explicitly called out as irreversible ("되돌릴 수 없어요") — treat as a genuinely
destructive, non-undoable operation in the API design.

## Raw metadata (get_metadata)

```xml
<frame id="3060:9477" name="마법사_덮어쓰기_확인모달" x="3644" y="6997" width="393" height="852">
  <instance id="3060:9478" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <rounded-rectangle id="3060:9512" name="Dim" x="0" y="0" width="393" height="852" />
  <frame id="3060:9513" name="Modal_Overwrite" x="32" y="335" width="329" height="182">
    <frame id="3060:9514" name="Text" x="20" y="24" width="289" height="74">
      <text id="3060:9515" name="기존 강의가 모두 사라져요" x="0" y="0" width="289" height="26" />
      <text id="3060:9516" name="'시간표 1'에 등록된 강의 6개가 삭제되고 시안 A로 교체돼요. 되돌릴 수 없어요." x="0" y="34" width="289" height="40" />
    </frame>
    <frame id="3060:9517" name="Buttons" x="20" y="114" width="289" height="52">
      <frame id="3060:9518" name="Btn_취소" x="0" y="0" width="140.5" height="52">
        <text id="3060:9519" name="취소" x="56.25" y="14.5" width="28" height="23" />
      </frame>
      <frame id="3060:9520" name="Btn_덮어쓰기" x="148.5" y="0" width="140.5" height="52">
        <text id="3060:9521" name="덮어쓰기" x="42.25" y="14.5" width="56" height="23" />
      </frame>
    </frame>
  </frame>
</frame>
```
