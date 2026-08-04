# Step 2 — 선호조건 (Preference conditions)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3055-9246
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3055:9246`
- Frame: `마법사_Step2_선호조건`, 393×852

## What it contains

Heading: "원하는 조건을 골라주세요 (중복 선택 가능)" — multi-select checkbox cards, C-01
through C-06:

- **C-01** 공강 많은 시간표 — simple checkbox card, unchecked in this snapshot.
- **C-02** 특정 요일 공강 — checked; expands to a day-of-week picker row (월/화/수/목/금).
- **C-03** 오전 수업 없는 시간표 — checked; expands to `Dropdown_StartTime` (e.g. "10:30 이후
  시작") + an inline warning banner ("⚠ 선택한 조건으로는 시간표가 안 나올 수 있어요") shown
  conditionally.
- **C-04** 야간 수업 제외 — simple checkbox card, unchecked.
- **C-05** 연강 적은 시간표 — simple checkbox card, unchecked.
- **C-06** 통학 시간 피하기 — simple checkbox card, unchecked.

So there are two card variants: a plain toggle card, and an "expandable" card (C-02, C-03)
that reveals extra controls only when checked. The inline warning under C-03 is a pattern
worth reusing anywhere a condition combo might yield zero results.

`Nav_Back` header shows step `1/3` in the raw metadata below — that looks like a data
snapshot artifact in the Figma file (should be `2/3` for this step); verify against the live
file / `get_design_context` rather than trusting this number.

`Bottom_CTA` sticky footer button as in step 1.

## Raw metadata (get_metadata)

```xml
<frame id="3055:9246" name="마법사_Step2_선호조건" x="986" y="6997" width="393" height="852">
  <frame id="3055:9289" name="Step_Indicator" x="0" y="112" width="393" height="16">
    <frame id="3055:9290" name="bar0" x="20" y="0" width="113.66666412353516" height="4" />
    <frame id="3055:9291" name="bar1" x="139.66665649414062" y="0" width="113.66667175292969" height="4" />
    <frame id="3055:9292" name="bar2" x="259.33331298828125" y="0" width="113.66667175292969" height="4" />
  </frame>
  <frame id="3055:9293" name="Body" x="0" y="128" width="393" height="724">
    <text id="3055:9294" name="원하는 조건을 골라주세요 (중복 선택 가능)" x="16" y="16" width="227" height="20" />
    <frame id="3055:9295" name="Card_C-01" x="16" y="46" width="361" height="74">
      <frame id="3055:9296" name="Head" x="16" y="16" width="329" height="42">
        <frame id="3055:9297" name="Checkbox" x="0" y="10" width="22" height="22" />
        <frame id="3055:9298" name="TextWrap" x="34" y="0" width="295" height="42">
          <text id="3055:9299" name="공강 많은 시간표" x="0" y="0" width="295" height="23" />
          <text id="3055:9300" name="C-01" x="0" y="25" width="23" height="17" />
        </frame>
      </frame>
    </frame>
    <frame id="3055:9301" name="Card_C-02" x="16" y="130" width="361" height="130">
      <frame id="3055:9302" name="Head" x="16" y="16" width="329" height="42">
        <frame id="3055:9303" name="Checkbox" x="0" y="10" width="22" height="22">
          <text id="3055:9304" name="✓" x="6.5" y="2" width="9" height="18" />
        </frame>
        <frame id="3055:9305" name="TextWrap" x="34" y="0" width="295" height="42">
          <text id="3055:9306" name="특정 요일 공강" x="0" y="0" width="295" height="23" />
          <text id="3055:9307" name="C-02" x="0" y="25" width="23" height="17" />
        </frame>
      </frame>
      <frame id="3055:9308" name="Days" x="16" y="70" width="329" height="44">
        <frame id="3055:9309" name="Day_월" x="0" y="0" width="59.400001525878906" height="44">
          <text id="3055:9310" name="월" x="23.200000762939453" y="11.5" width="13" height="21" />
        </frame>
        <frame id="3055:9311" name="Day_화" x="67.4000015258789" y="0" width="59.400001525878906" height="44">
          <text id="3055:9312" name="화" x="23.200000762939453" y="11.5" width="13" height="21" />
        </frame>
        <frame id="3055:9313" name="Day_수" x="134.8000030517578" y="0" width="59.40000534057617" height="44">
          <text id="3055:9314" name="수" x="23.200002670288086" y="11.5" width="13" height="21" />
        </frame>
        <frame id="3055:9315" name="Day_목" x="202.20001220703125" y="0" width="59.400001525878906" height="44">
          <text id="3055:9316" name="목" x="23.200000762939453" y="11.5" width="13" height="21" />
        </frame>
        <frame id="3055:9317" name="Day_금" x="269.6000061035156" y="0" width="59.400001525878906" height="44">
          <text id="3055:9318" name="금" x="23.200000762939453" y="11.5" width="13" height="21" />
        </frame>
      </frame>
    </frame>
    <frame id="3055:9319" name="Card_C-03" x="16" y="270" width="361" height="186">
      <frame id="3055:9320" name="Head" x="16" y="16" width="329" height="42">
        <frame id="3055:9321" name="Checkbox" x="0" y="10" width="22" height="22">
          <text id="3055:9322" name="✓" x="6.5" y="2" width="9" height="18" />
        </frame>
        <frame id="3055:9323" name="TextWrap" x="34" y="0" width="295" height="42">
          <text id="3055:9324" name="오전 수업 없는 시간표" x="0" y="0" width="295" height="23" />
          <text id="3055:9325" name="C-03" x="0" y="25" width="23" height="17" />
        </frame>
      </frame>
      <frame id="3055:9326" name="Dropdown_StartTime" x="16" y="70" width="329" height="48">
        <text id="3055:9327" name="10:30 이후 시작" x="16" y="13.5" width="291" height="21" />
        <text id="3055:9328" name="▾" x="307" y="13.5" width="6" height="21" />
      </frame>
      <frame id="3055:9329" name="Warning_Inline" x="16" y="130" width="329" height="40">
        <text id="3055:9330" name="⚠" x="12" y="10" width="13" height="20" />
        <text id="3055:9331" name="선택한 조건으로는 시간표가 안 나올 수 있어요" x="33" y="10" width="284" height="18" />
      </frame>
    </frame>
    <frame id="3055:9332" name="Card_C-04" x="16" y="466" width="361" height="74">
      <frame id="3055:9333" name="Head" x="16" y="16" width="329" height="42">
        <frame id="3055:9334" name="Checkbox" x="0" y="10" width="22" height="22" />
        <frame id="3055:9335" name="TextWrap" x="34" y="0" width="295" height="42">
          <text id="3055:9336" name="야간 수업 제외" x="0" y="0" width="295" height="23" />
          <text id="3055:9337" name="C-04" x="0" y="25" width="23" height="17" />
        </frame>
      </frame>
    </frame>
    <frame id="3055:9338" name="Card_C-05" x="16" y="550" width="361" height="74">
      <frame id="3055:9339" name="Head" x="16" y="16" width="329" height="42">
        <frame id="3055:9340" name="Checkbox" x="0" y="10" width="22" height="22" />
        <frame id="3055:9341" name="TextWrap" x="34" y="0" width="295" height="42">
          <text id="3055:9342" name="연강 적은 시간표" x="0" y="0" width="295" height="23" />
          <text id="3055:9343" name="C-05" x="0" y="25" width="23" height="17" />
        </frame>
      </frame>
    </frame>
    <frame id="3055:9344" name="Card_C-06" x="16" y="634" width="361" height="74">
      <frame id="3055:9345" name="Head" x="16" y="16" width="329" height="42">
        <frame id="3055:9346" name="Checkbox" x="0" y="10" width="22" height="22" />
        <frame id="3055:9347" name="TextWrap" x="34" y="0" width="295" height="42">
          <text id="3055:9348" name="통학 시간 피하기" x="0" y="0" width="295" height="23" />
          <text id="3055:9349" name="C-06" x="0" y="25" width="23" height="17" />
        </frame>
      </frame>
    </frame>
  </frame>
  <instance id="3077:9575" name="Bottom_CTA" x="0" y="748" width="393" height="72" />
  <instance id="3077:9599" name="Nav_Back" x="0" y="0" width="393" height="112">
    <frame id="0:8" name="Header" x="12" y="64" width="365" height="40">
      <instance id="0:9" name="Back_Button" x="0" y="0" width="40" height="40" />
      <text id="0:15" name="title" x="40" y="0" width="285" height="40" />
      <slot id="0:16" name="Icons_Container" x="325" y="0" width="40" height="40">
        <text id="0:17" name="1/3" x="7" y="8" width="26" height="24" />
      </slot>
    </frame>
  </instance>
  <instance id="3055:9247" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <instance id="3055:9281" name="iPhone-status-bar(lower)" x="0" y="820" width="393" height="32" />
</frame>
```
