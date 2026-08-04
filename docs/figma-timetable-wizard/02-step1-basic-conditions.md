# Step 1 — 기본조건 (Basic conditions)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3054-9211
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3054:9211`
- Frame: `마법사_Step1_기본조건`, 393×852 (iPhone frame)

## What it contains

- Header: `Nav_Back` instance with step counter `1/3`.
- `Step_Indicator`: 3-segment progress bar (bar0 active, bar1/bar2 inactive).
- Card 1 — 학기 (semester): label + required marker (`*`) + `Dropdown_Term` showing
  `2026-2학기`.
- Card 2 — 목표 학점 (target credits): label showing selected range (`15 ~ 18학점`) + a
  **dual-handle range slider** (`Handle0`/`Handle1` — two draggable ellipses over a track/
  track-active) + scale labels `12학점` … `21학점`.
- Card 3 — 꼭 넣고 싶은 강의 (must-have courses): label + counter (`2 / 6`) + chip list of
  selected courses (each chip has an `×` remove button) + `+ 강의 추가` button to open course
  search/add.
- `Bottom_CTA` instance — sticky footer primary button (continue to step 2).

## Raw metadata (get_metadata)

```xml
<frame id="3054:9211" name="마법사_Step1_기본조건" x="543" y="6997" width="393" height="852">
  <frame id="3054:9254" name="Step_Indicator" x="0" y="112" width="393" height="16">
    <frame id="3054:9255" name="bar0" x="20" y="0" width="113.66666412353516" height="4" />
    <frame id="3054:9256" name="bar1" x="139.66665649414062" y="0" width="113.66667175292969" height="4" />
    <frame id="3054:9257" name="bar2" x="259.33331298828125" y="0" width="113.66667175292969" height="4" />
  </frame>
  <frame id="3054:9258" name="Body" x="0" y="128" width="393" height="492">
    <frame id="3054:9259" name="Card" x="16" y="20" width="361" height="123">
      <frame id="3054:9260" name="Label" x="16" y="18" width="329" height="23">
        <text id="3054:9261" name="학기" x="0" y="0" width="28" height="23" />
        <text id="3054:9262" name="*" x="32" y="0" width="8" height="23" />
      </frame>
      <frame id="3054:9263" name="Dropdown_Term" x="16" y="53" width="329" height="52">
        <text id="3054:9264" name="2026-2학기" x="16" y="14.5" width="291" height="23" />
        <text id="3054:9265" name="▾" x="307" y="15.5" width="6" height="21" />
      </frame>
    </frame>
    <frame id="3054:9266" name="Card" x="16" y="157" width="361" height="133">
      <frame id="3054:9267" name="Label" x="16" y="18" width="329" height="23">
        <text id="3054:9268" name="목표 학점" x="0" y="0" width="246" height="23" />
        <text id="3054:9269" name="15 ~ 18학점" x="250" y="0" width="79" height="23" />
      </frame>
      <frame id="3054:9270" name="Slider" x="16" y="53" width="329" height="32">
        <rounded-rectangle id="3054:9271" name="Track" x="0" y="0" width="329" height="6" />
        <rounded-rectangle id="3054:9272" name="Track_Active" x="329" y="0" width="120" height="6" />
        <ellipse id="3054:9273" name="Handle0" x="449" y="0" width="24" height="24" />
        <ellipse id="3054:9274" name="Handle1" x="473" y="0" width="24" height="24" />
      </frame>
      <frame id="3054:9275" name="Scale" x="16" y="97" width="329" height="18">
        <text id="3054:9276" name="12학점" x="0" y="0" width="293" height="18" />
        <text id="3054:9277" name="21학점" x="293" y="0" width="36" height="18" />
      </frame>
    </frame>
    <frame id="3054:9278" name="Card" x="16" y="304" width="361" height="168">
      <frame id="3054:9279" name="Label" x="16" y="18" width="329" height="23">
        <text id="3054:9280" name="꼭 넣고 싶은 강의" x="0" y="0" width="299" height="23" />
        <text id="3054:9281" name="2 / 6" x="303" y="0" width="26" height="20" />
      </frame>
      <frame id="3054:9282" name="Chips" x="16" y="53" width="329" height="37">
        <frame id="3054:9283" name="Chip" x="0" y="0" width="130" height="37">
          <text id="3054:9284" name="프로그래밍입문" x="14" y="8.5" width="84" height="20" />
          <text id="3054:9285" name="×" x="104" y="8" width="14" height="21" />
        </frame>
        <frame id="3054:9286" name="Chip" x="138" y="0" width="111" height="37">
          <text id="3054:9287" name="대학수학(1)" x="14" y="8.5" width="65" height="20" />
          <text id="3054:9288" name="×" x="85" y="8" width="14" height="21" />
        </frame>
      </frame>
      <frame id="3054:9289" name="Btn_AddCourse" x="16" y="102" width="329" height="48">
        <text id="3054:9290" name="+ 강의 추가" x="131.5" y="13.5" width="66" height="21" />
      </frame>
    </frame>
  </frame>
  <instance id="3077:9570" name="Bottom_CTA" x="0" y="748" width="393" height="72" />
  <instance id="3077:9586" name="Nav_Back" x="0" y="0" width="393" height="112">
    <frame id="0:8" name="Header" x="12" y="64" width="365" height="40">
      <instance id="0:9" name="Back_Button" x="0" y="0" width="40" height="40" />
      <text id="0:15" name="title" x="40" y="0" width="285" height="40" />
      <slot id="0:16" name="Icons_Container" x="325" y="0" width="40" height="40">
        <text id="0:17" name="1/3" x="8.5" y="8" width="23" height="24" />
      </slot>
    </frame>
  </instance>
  <instance id="3054:9212" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <instance id="3054:9246" name="iPhone-status-bar(lower)" x="0" y="820" width="393" height="32" />
</frame>
```
