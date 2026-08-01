# 저장옵션 바텀시트 (Save options bottom sheet)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3060-9419
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3060:9419`
- Frame: `마법사_저장옵션_바텀시트`, 393×852 (bottom sheet is 409 tall, docked at y=443)

## What it contains

Modal bottom sheet over a dimmed background (`Dim` overlay):

- Drag handle (`HandleWrap`).
- Title: "어떻게 저장할까요?"
- Two radio options (`Options`):
  1. "새 시간표로 저장" — "시안 A가 새 시간표로 추가돼요"
  2. "기존 시간표 덮어쓰기" — "선택한 시간표의 강의가 전부 바뀌어요"
- Conditionally shown `Dropdown_Target_Wrap` (only relevant when "덮어쓰기" is selected):
  "덮어쓸 시간표" label + `Dropdown_Target` showing e.g. "시간표 1 (2026-2학기)".
- `Btn_Save` — "저장" primary button.

Choosing "기존 시간표 덮어쓰기" + a target, then hitting 저장, should lead to the destructive
confirm modal (`11-overwrite-confirm-modal.md`) before actually overwriting.

## Raw metadata (get_metadata)

```xml
<frame id="3060:9419" name="마법사_저장옵션_바텀시트" x="3201" y="6997" width="393" height="852">
  <instance id="3060:9420" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <rounded-rectangle id="3060:9454" name="Dim" x="0" y="0" width="393" height="852" />
  <frame id="3060:9455" name="BottomSheet" x="0" y="443" width="393" height="409">
    <frame id="3060:9456" name="HandleWrap" x="20" y="10" width="353" height="10">
      <rounded-rectangle id="3060:9457" name="Rectangle" x="156.5" y="0" width="40" height="4" />
    </frame>
    <text id="3060:9458" name="어떻게 저장할까요?" x="20" y="34" width="353" height="27" />
    <frame id="3060:9459" name="Options" x="20" y="75" width="353" height="152">
      <frame id="3060:9460" name="Option" x="0" y="0" width="353" height="71">
        <frame id="3060:9461" name="Radio" x="16" y="23.5" width="24" height="24" />
        <frame id="3060:9462" name="Text" x="52" y="14" width="285" height="43">
          <text id="3060:9463" name="새 시간표로 저장" x="0" y="0" width="285" height="23" />
          <text id="3060:9464" name="시안 A가 새 시간표로 추가돼요" x="0" y="25" width="285" height="18" />
        </frame>
      </frame>
      <frame id="3060:9465" name="Option" x="0" y="81" width="353" height="71">
        <frame id="3060:9466" name="Radio" x="16" y="23.5" width="24" height="24" />
        <frame id="3060:9467" name="Text" x="52" y="14" width="285" height="43">
          <text id="3060:9468" name="기존 시간표 덮어쓰기" x="0" y="0" width="285" height="23" />
          <text id="3060:9469" name="선택한 시간표의 강의가 전부 바뀌어요" x="0" y="25" width="285" height="18" />
        </frame>
      </frame>
    </frame>
    <frame id="3060:9470" name="Dropdown_Target_Wrap" x="20" y="241" width="353" height="78">
      <text id="3060:9471" name="덮어쓸 시간표" x="0" y="0" width="353" height="20" />
      <frame id="3060:9472" name="Dropdown_Target" x="0" y="26" width="353" height="52">
        <text id="3060:9473" name="시간표 1 (2026-2학기)" x="16" y="14.5" width="315" height="23" />
        <text id="3060:9474" name="▾" x="331" y="15.5" width="6" height="21" />
      </frame>
    </frame>
    <frame id="3060:9475" name="Btn_Save" x="20" y="333" width="353" height="56">
      <text id="3060:9476" name="저장" x="161.5" y="16" width="30" height="24" />
    </frame>
  </frame>
</frame>
```
