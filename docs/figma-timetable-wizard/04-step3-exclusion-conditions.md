# Step 3 — 제외조건 (Exclusion conditions)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3057-9281
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3057:9281`
- Frame: `마법사_Step3_제외조건`, 393×852

## What it contains

- `Nav_Back` header, step `2/3`.
- Card 1 — `Card_ExcludeTime`: "수업 넣고 싶지 않은 시간" / "드래그해서 선택하세요" — a
  **drag-select grid** (`Grid_ExcludeTime`), 5 day columns (월~금) × 9 hour rows (9~17),
  each cell a `Cell_{col}_{row}` rounded rect the user drags across to toggle exclusion.
  Legend below shows a swatch + live count ("제외한 시간대 (6칸)").
- Card 2 — `Card_ExcludeCourse`: "빼고 싶은 강의" + a search field (🔍 icon + "강의명 검색"
  placeholder) to exclude specific courses by name.
- `Bottom_CTA` sticky footer (continue to generation).

The drag-select grid is the most complex interaction in the whole flow — likely needs pointer/
touch drag handling with toggle-on-drag semantics (like a calendar multi-select), not just
click-per-cell.

## Raw metadata (get_metadata)

```xml
<frame id="3057:9281" name="마법사_Step3_제외조건" x="1429" y="6997" width="393" height="852">
  <frame id="3057:9324" name="Step_Indicator" x="0" y="112" width="393" height="16">
    <frame id="3057:9325" name="bar0" x="20" y="0" width="113.66666412353516" height="4" />
    <frame id="3057:9326" name="bar1" x="139.66665649414062" y="0" width="113.66667175292969" height="4" />
    <frame id="3057:9327" name="bar2" x="259.33331298828125" y="0" width="113.66667175292969" height="4" />
  </frame>
  <frame id="3057:9328" name="Body" x="0" y="128" width="393" height="676">
    <frame id="3057:9329" name="Card_ExcludeTime" x="16" y="16" width="361" height="517">
      <frame id="3057:9330" name="Head" x="16" y="16" width="329" height="43">
        <text id="3057:9331" name="수업 넣고 싶지 않은 시간" x="0" y="0" width="329" height="23" />
        <text id="3057:9332" name="드래그해서 선택하세요" x="0" y="25" width="329" height="18" />
      </frame>
      <frame id="3057:9333" name="Grid_ExcludeTime" x="16" y="71" width="329" height="400">
        <text id="3057:9334" name="월" x="0" y="0" width="60" height="20" />
        <text id="3057:9335" name="화" x="0" y="0" width="60" height="20" />
        <text id="3057:9336" name="수" x="0" y="0" width="60" height="20" />
        <text id="3057:9337" name="목" x="0" y="0" width="60" height="20" />
        <text id="3057:9338" name="금" x="0" y="0" width="60" height="20" />
        <text id="3057:9339" name="9" x="0" y="28" width="7" height="17" />
        <rounded-rectangle id="3057:9340" name="Cell_0_0" x="29" y="25" width="58" height="38" />
        <rounded-rectangle id="3057:9341" name="Cell_1_0" x="89" y="25" width="58" height="38" />
        <rounded-rectangle id="3057:9342" name="Cell_2_0" x="149" y="25" width="58" height="38" />
        <rounded-rectangle id="3057:9343" name="Cell_3_0" x="209" y="25" width="58" height="38" />
        <rounded-rectangle id="3057:9344" name="Cell_4_0" x="269" y="25" width="58" height="38" />
        <text id="3057:9345" name="10" x="0" y="68" width="13" height="17" />
        <rounded-rectangle id="3057:9346" name="Cell_0_1" x="29" y="65" width="58" height="38" />
        <rounded-rectangle id="3057:9347" name="Cell_1_1" x="89" y="65" width="58" height="38" />
        <rounded-rectangle id="3057:9348" name="Cell_2_1" x="149" y="65" width="58" height="38" />
        <rounded-rectangle id="3057:9349" name="Cell_3_1" x="209" y="65" width="58" height="38" />
        <rounded-rectangle id="3057:9350" name="Cell_4_1" x="269" y="65" width="58" height="38" />
        <text id="3057:9351" name="11" x="0" y="108" width="13" height="17" />
        <rounded-rectangle id="3057:9352" name="Cell_0_2" x="29" y="105" width="58" height="38" />
        <rounded-rectangle id="3057:9353" name="Cell_1_2" x="89" y="105" width="58" height="38" />
        <rounded-rectangle id="3057:9354" name="Cell_2_2" x="149" y="105" width="58" height="38" />
        <rounded-rectangle id="3057:9355" name="Cell_3_2" x="209" y="105" width="58" height="38" />
        <rounded-rectangle id="3057:9356" name="Cell_4_2" x="269" y="105" width="58" height="38" />
        <text id="3057:9357" name="12" x="0" y="148" width="13" height="17" />
        <rounded-rectangle id="3057:9358" name="Cell_0_3" x="29" y="145" width="58" height="38" />
        <rounded-rectangle id="3057:9359" name="Cell_1_3" x="89" y="145" width="58" height="38" />
        <rounded-rectangle id="3057:9360" name="Cell_2_3" x="149" y="145" width="58" height="38" />
        <rounded-rectangle id="3057:9361" name="Cell_3_3" x="209" y="145" width="58" height="38" />
        <rounded-rectangle id="3057:9362" name="Cell_4_3" x="269" y="145" width="58" height="38" />
        <text id="3057:9363" name="13" x="0" y="188" width="13" height="17" />
        <rounded-rectangle id="3057:9364" name="Cell_0_4" x="29" y="185" width="58" height="38" />
        <rounded-rectangle id="3057:9365" name="Cell_1_4" x="89" y="185" width="58" height="38" />
        <rounded-rectangle id="3057:9366" name="Cell_2_4" x="149" y="185" width="58" height="38" />
        <rounded-rectangle id="3057:9367" name="Cell_3_4" x="209" y="185" width="58" height="38" />
        <rounded-rectangle id="3057:9368" name="Cell_4_4" x="269" y="185" width="58" height="38" />
        <text id="3057:9369" name="14" x="0" y="228" width="13" height="17" />
        <rounded-rectangle id="3057:9370" name="Cell_0_5" x="29" y="225" width="58" height="38" />
        <rounded-rectangle id="3057:9371" name="Cell_1_5" x="89" y="225" width="58" height="38" />
        <rounded-rectangle id="3057:9372" name="Cell_2_5" x="149" y="225" width="58" height="38" />
        <rounded-rectangle id="3057:9373" name="Cell_3_5" x="209" y="225" width="58" height="38" />
        <rounded-rectangle id="3057:9374" name="Cell_4_5" x="269" y="225" width="58" height="38" />
        <text id="3057:9375" name="15" x="0" y="268" width="13" height="17" />
        <rounded-rectangle id="3057:9376" name="Cell_0_6" x="29" y="265" width="58" height="38" />
        <rounded-rectangle id="3057:9377" name="Cell_1_6" x="89" y="265" width="58" height="38" />
        <rounded-rectangle id="3057:9378" name="Cell_2_6" x="149" y="265" width="58" height="38" />
        <rounded-rectangle id="3057:9379" name="Cell_3_6" x="209" y="265" width="58" height="38" />
        <rounded-rectangle id="3057:9380" name="Cell_4_6" x="269" y="265" width="58" height="38" />
        <text id="3057:9381" name="16" x="0" y="308" width="13" height="17" />
        <rounded-rectangle id="3057:9382" name="Cell_0_7" x="29" y="305" width="58" height="38" />
        <rounded-rectangle id="3057:9383" name="Cell_1_7" x="89" y="305" width="58" height="38" />
        <rounded-rectangle id="3057:9384" name="Cell_2_7" x="149" y="305" width="58" height="38" />
        <rounded-rectangle id="3057:9385" name="Cell_3_7" x="209" y="305" width="58" height="38" />
        <rounded-rectangle id="3057:9386" name="Cell_4_7" x="269" y="305" width="58" height="38" />
        <text id="3057:9387" name="17" x="0" y="348" width="13" height="17" />
        <rounded-rectangle id="3057:9388" name="Cell_0_8" x="29" y="345" width="58" height="38" />
        <rounded-rectangle id="3057:9389" name="Cell_1_8" x="89" y="345" width="58" height="38" />
        <rounded-rectangle id="3057:9390" name="Cell_2_8" x="149" y="345" width="58" height="38" />
        <rounded-rectangle id="3057:9391" name="Cell_3_8" x="209" y="345" width="58" height="38" />
        <rounded-rectangle id="3057:9392" name="Cell_4_8" x="269" y="345" width="58" height="38" />
      </frame>
      <frame id="3057:9393" name="Legend" x="16" y="483" width="118" height="18">
        <rounded-rectangle id="3057:9394" name="Rectangle" x="0" y="2" width="14" height="14" />
        <text id="3057:9395" name="제외한 시간대 (6칸)" x="20" y="0" width="98" height="18" />
      </frame>
    </frame>
    <frame id="3057:9396" name="Card_ExcludeCourse" x="16" y="545" width="361" height="115">
      <text id="3057:9397" name="빼고 싶은 강의" x="16" y="16" width="329" height="23" />
      <frame id="3057:9398" name="Search_Field" x="16" y="51" width="329" height="48">
        <text id="3057:9399" name="🔍" x="16" y="14" width="13" height="20" />
        <text id="3057:9400" name="강의명 검색" x="37" y="13.5" width="276" height="21" />
      </frame>
    </frame>
  </frame>
  <instance id="3077:9580" name="Bottom_CTA" x="0" y="748" width="393" height="72" />
  <instance id="3077:9610" name="Nav_Back" x="0" y="0" width="393" height="112">
    <frame id="0:8" name="Header" x="12" y="64" width="365" height="40">
      <instance id="0:9" name="Back_Button" x="0" y="0" width="40" height="40" />
      <text id="0:15" name="title" x="40" y="0" width="285" height="40" />
      <slot id="0:16" name="Icons_Container" x="325" y="0" width="40" height="40">
        <text id="0:17" name="2/3" x="7" y="8" width="26" height="24" />
      </slot>
    </frame>
  </instance>
  <instance id="3057:9282" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <instance id="3057:9316" name="iPhone-status-bar(lower)" x="0" y="820" width="393" height="32" />
</frame>
```
