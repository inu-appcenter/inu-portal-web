# 추천결과 (Recommendation results)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3058-9351
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3058:9351`
- Frame: `마법사_추천결과`, 393×852 (scrolling body, 1217 tall)

## What it contains

- `Nav_Back` header, action slot shows "다시 만들기" (regenerate) instead of a step counter.
- Heading: "조건에 맞는 시간표 3개를 찾았어요".
- Three `Card_Result_*` cards (시안 A/B/C), each with:
  - Header: label ("시안 A"), optional `Badge` ("추천" — only on the top-ranked card A),
    credit/course-count summary right-aligned ("15학점 · 6과목").
  - `Thumb_Timetable`: a small non-interactive timetable preview — 4 vertical grid lines (5
    day columns) × several `Block` rects positioned by time, i.e. a miniature rendering of
    the same grid used in the detail screen.
  - Divider.
  - `List_Reasons`: 3-4 short reason lines, each prefixed with either `✓` (met condition) or
    `!` (partially met / caveat) — e.g. "금요일 공강", "야간 수업 1개 포함 (목 18:00)".
  - `Footer`: "자세히 보기" (view details) — navigates to the detail screen
    (`08-recommended-timetable-detail.md`) for that candidate.

Card C is shorter (358 vs 384) because it only has 3 reason lines instead of 4.

## Raw metadata (get_metadata)

```xml
<frame id="3058:9351" name="마법사_추천결과" x="2315" y="6997" width="393" height="852">
  <frame id="3058:9394" name="Body" x="0" y="112" width="393" height="1217">
    <text id="3058:9395" name="조건에 맞는 시간표 3개를 찾았어요" x="16" y="16" width="361" height="23" />
    <frame id="3058:9396" name="Card_Result_A" x="16" y="51" width="361" height="384">
      <frame id="3058:9397" name="Header" x="16" y="16" width="329" height="24">
        <text id="3058:9398" name="시안 A" x="0" y="0" width="44" height="24" />
        <frame id="3058:9399" name="Badge" x="52" y="0.5" width="37" height="23">
          <text id="3058:9400" name="추천" x="8" y="3" width="21" height="17" />
        </frame>
        <frame id="3058:9401" name="Spacer" x="97" y="11.5" width="141" height="1" />
        <text id="3058:9402" name="15학점 · 6과목" x="246" y="2" width="83" height="20" />
      </frame>
      <frame id="3058:9403" name="Thumb_Timetable" x="16" y="52" width="329" height="140">
        <rounded-rectangle id="3058:9404" name="GridLine" x="65.80078125" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9405" name="GridLine" x="131.6015625" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9406" name="GridLine" x="197.3984375" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9407" name="GridLine" x="263.19921875" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9408" name="Block" x="2" y="10.769230842590332" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9409" name="Block" x="2" y="43.07692337036133" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9410" name="Block" x="67.80078125" y="21.538467407226562" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9411" name="Block" x="67.80078125" y="64.61538696289062" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9412" name="Block" x="133.6015625" y="16.153839111328125" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9413" name="Block" x="133.6015625" y="43.07691955566406" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9414" name="Block" x="199.3984375" y="21.538467407226562" width="61.79999923706055" height="16.153846740722656" />
      </frame>
      <rounded-rectangle id="3058:9415" name="Divider" x="16" y="204" width="329" height="1" />
      <frame id="3058:9416" name="List_Reasons" x="16" y="217" width="329" height="98">
        <frame id="3058:9417" name="Item_Reason" x="0" y="0" width="329" height="20">
          <text id="3058:9418" name="✓" x="0" y="0" width="10" height="20" />
          <text id="3058:9419" name="금요일 공강" x="18" y="0" width="311" height="20" />
        </frame>
        <frame id="3058:9420" name="Item_Reason" x="0" y="26" width="329" height="20">
          <text id="3058:9421" name="✓" x="0" y="0" width="10" height="20" />
          <text id="3058:9422" name="오전 수업 1개 (10:30 시작)" x="18" y="0" width="311" height="20" />
        </frame>
        <frame id="3058:9423" name="Item_Reason" x="0" y="52" width="329" height="20">
          <text id="3058:9424" name="✓" x="0" y="0" width="10" height="20" />
          <text id="3058:9425" name="연강 최대 2개" x="18" y="0" width="311" height="20" />
        </frame>
        <frame id="3058:9426" name="Item_Reason" x="0" y="78" width="329" height="20">
          <text id="3058:9427" name="!" x="0" y="0" width="5" height="20" />
          <text id="3058:9428" name="야간 수업 1개 포함 (목 18:00)" x="13" y="0" width="316" height="20" />
        </frame>
      </frame>
      <frame id="3058:9429" name="Footer" x="16" y="327" width="329" height="41">
        <text id="3058:9430" name="자세히 보기" x="130.5" y="10" width="68" height="21" />
      </frame>
    </frame>
    <frame id="3058:9431" name="Card_Result_B" x="16" y="447" width="361" height="384">
      <frame id="3058:9432" name="Header" x="16" y="16" width="329" height="24">
        <text id="3058:9433" name="시안 B" x="0" y="0" width="44" height="24" />
        <frame id="3058:9434" name="Spacer" x="52" y="11.5" width="186" height="1" />
        <text id="3058:9435" name="18학점 · 7과목" x="246" y="2" width="83" height="20" />
      </frame>
      <frame id="3058:9436" name="Thumb_Timetable" x="16" y="52" width="329" height="140">
        <rounded-rectangle id="3058:9437" name="GridLine" x="65.80078125" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9438" name="GridLine" x="131.6015625" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9439" name="GridLine" x="197.3984375" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9440" name="GridLine" x="263.19921875" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9441" name="Block" x="2" y="0" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9442" name="Block" x="67.80078125" y="10.76922607421875" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9443" name="Block" x="133.6015625" y="32.30767822265625" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9444" name="Block" x="199.3984375" y="96.923095703125" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9445" name="Block" x="265.19921875" y="21.5384521484375" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9446" name="Block" x="265.19921875" y="64.6153564453125" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9447" name="Block" x="2" y="64.61538696289062" width="61.79999923706055" height="16.153846740722656" />
      </frame>
      <rounded-rectangle id="3058:9448" name="Divider" x="16" y="204" width="329" height="1" />
      <frame id="3058:9449" name="List_Reasons" x="16" y="217" width="329" height="98">
        <frame id="3058:9450" name="Item_Reason" x="0" y="0" width="329" height="20">
          <text id="3058:9451" name="✓" x="0" y="0" width="10" height="20" />
          <text id="3058:9452" name="금요일 공강" x="18" y="0" width="311" height="20" />
        </frame>
        <frame id="3058:9453" name="Item_Reason" x="0" y="26" width="329" height="20">
          <text id="3058:9454" name="✓" x="0" y="0" width="10" height="20" />
          <text id="3058:9455" name="연강 최대 2개" x="18" y="0" width="311" height="20" />
        </frame>
        <frame id="3058:9456" name="Item_Reason" x="0" y="52" width="329" height="20">
          <text id="3058:9457" name="!" x="0" y="0" width="5" height="20" />
          <text id="3058:9458" name="오전 9시 수업 1개 (월 09:00)" x="13" y="0" width="316" height="20" />
        </frame>
        <frame id="3058:9459" name="Item_Reason" x="0" y="78" width="329" height="20">
          <text id="3058:9460" name="!" x="0" y="0" width="5" height="20" />
          <text id="3058:9461" name="야간 수업 1개 포함 (목 18:00)" x="13" y="0" width="316" height="20" />
        </frame>
      </frame>
      <frame id="3058:9462" name="Footer" x="16" y="327" width="329" height="41">
        <text id="3058:9463" name="자세히 보기" x="130.5" y="10" width="68" height="21" />
      </frame>
    </frame>
    <frame id="3058:9464" name="Card_Result_C" x="16" y="843" width="361" height="358">
      <frame id="3058:9465" name="Header" x="16" y="16" width="329" height="24">
        <text id="3058:9466" name="시안 C" x="0" y="0" width="44" height="24" />
        <frame id="3058:9467" name="Spacer" x="52" y="11.5" width="186" height="1" />
        <text id="3058:9468" name="15학점 · 5과목" x="246" y="2" width="83" height="20" />
      </frame>
      <frame id="3058:9469" name="Thumb_Timetable" x="16" y="52" width="329" height="140">
        <rounded-rectangle id="3058:9470" name="GridLine" x="65.80078125" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9471" name="GridLine" x="131.6015625" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9472" name="GridLine" x="197.3984375" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9473" name="GridLine" x="263.19921875" y="0" width="1" height="140" />
        <rounded-rectangle id="3058:9474" name="Block" x="2" y="21.538461685180664" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9475" name="Block" x="67.80078125" y="43.076904296875" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9476" name="Block" x="133.6015625" y="10.76922607421875" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9477" name="Block" x="199.3984375" y="53.84619140625" width="61.79999923706055" height="16.153846740722656" />
        <rounded-rectangle id="3058:9478" name="Block" x="265.19921875" y="32.3077392578125" width="61.79999923706055" height="16.153846740722656" />
      </frame>
      <rounded-rectangle id="3058:9479" name="Divider" x="16" y="204" width="329" height="1" />
      <frame id="3058:9480" name="List_Reasons" x="16" y="217" width="329" height="72">
        <frame id="3058:9481" name="Item_Reason" x="0" y="0" width="329" height="20">
          <text id="3058:9482" name="✓" x="0" y="0" width="10" height="20" />
          <text id="3058:9483" name="오전 수업 없음 (11:00 시작)" x="18" y="0" width="311" height="20" />
        </frame>
        <frame id="3058:9484" name="Item_Reason" x="0" y="26" width="329" height="20">
          <text id="3058:9485" name="✓" x="0" y="0" width="10" height="20" />
          <text id="3058:9486" name="야간 수업 없음" x="18" y="0" width="311" height="20" />
        </frame>
        <frame id="3058:9487" name="Item_Reason" x="0" y="52" width="329" height="20">
          <text id="3058:9488" name="!" x="0" y="0" width="5" height="20" />
          <text id="3058:9489" name="금요일 공강 아님 (금 12:00 수업)" x="13" y="0" width="316" height="20" />
        </frame>
      </frame>
      <frame id="3058:9490" name="Footer" x="16" y="301" width="329" height="41">
        <text id="3058:9491" name="자세히 보기" x="130.5" y="10" width="68" height="21" />
      </frame>
    </frame>
  </frame>
  <instance id="3077:9621" name="Nav_Back" x="0" y="0" width="393" height="112">
    <frame id="0:3" name="Header" x="12" y="64" width="365" height="40">
      <instance id="0:4" name="Back_Button" x="0" y="0" width="40" height="40" />
      <text id="0:10" name="title" x="40" y="0" width="251" height="40" />
      <slot id="0:11" name="Icons_Container" x="291" y="0" width="74" height="40">
        <text id="0:12" name="다시 만들기" x="0" y="8" width="74" height="24" />
      </slot>
    </frame>
  </instance>
  <instance id="3058:9352" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <instance id="3058:9386" name="iPhone-status-bar(lower)" x="0" y="820" width="393" height="32" />
</frame>
```
