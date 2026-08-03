# 추천시간표 상세 (Recommended timetable detail)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3059-9386
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3059:9386`
- Frame: `마법사_추천시간표_상세`, 393×1500 (tall scrolling page)

Header used on this screen is the standalone `AppBar` component — see
[12-appbar-component.md](./12-appbar-component.md) for its own metadata ("시안 A" title +
credit/course badge, no step counter, back chevron).

## What it contains

- `Card_Timetable` → `TimeTable_Grid`: the **full** weekly grid (not the thumbnail from the
  results screen) — day headers (월~금), hour rows (9~17) with horizontal/vertical rule
  lines, and course `Block`s positioned by day/time, each showing course name + room
  (e.g. "프로그래밍입문" / "07-407").
- `Card_Reasons`: "이 시간표를 추천한 이유" — same reason-list pattern as the results screen,
  but each item now has a two-line body: bold headline ("금요일 공강") + explanatory subtext
  ("선택한 조건 그대로 충족했어요"). `✓` for met, `!` for caveat.
- `Card_CourseList`: "강의 목록" — full course roster as tappable rows (`Row_Course`), each
  with a colored left accent bar, course name, meta line (day/time · room · credits, e.g.
  "월 10:00~11:30 · 07-407 · 3학점"), and a `›` chevron (presumably opens course detail).
- `Bottom_CTA`: "이 시간표 저장" — opens the save-options bottom sheet
  ([07-save-options-bottomsheet.md](./07-save-options-bottomsheet.md)).

## Raw metadata (get_metadata)

```xml
<frame id="3059:9386" name="마법사_추천시간표_상세" x="2758" y="6997" width="393" height="1500">
  <instance id="3059:9387" name="iPhone-status-bar(upper)" x="0" y="0" width="393" height="44" />
  <frame id="3059:9427" name="Body" x="0" y="112" width="393" height="1388">
    <frame id="3059:9428" name="Card_Timetable" x="16" y="16" width="361" height="554">
      <frame id="3059:9429" name="TimeTable_Grid" x="12" y="12" width="337" height="530">
        <text id="3059:9430" name="월" x="26" y="2" width="62.20000076293945" height="18" />
        <text id="3059:9431" name="화" x="88.19921875" y="2" width="62.20000076293945" height="18" />
        <text id="3059:9432" name="수" x="150.3984375" y="2" width="62.20000076293945" height="18" />
        <text id="3059:9433" name="목" x="212.6015625" y="2" width="62.20000076293945" height="18" />
        <text id="3059:9434" name="금" x="274.80078125" y="2" width="62.20000076293945" height="18" />
        <text id="3059:9435" name="9" x="0" y="18" width="6" height="15" />
        <rounded-rectangle id="3059:9436" name="Rectangle" x="26" y="24" width="311" height="1" />
        <text id="3059:9437" name="10" x="0" y="72" width="12" height="15" />
        <rounded-rectangle id="3059:9438" name="Rectangle" x="26" y="78" width="311" height="1" />
        <text id="3059:9439" name="11" x="0" y="126" width="12" height="15" />
        <rounded-rectangle id="3059:9440" name="Rectangle" x="26" y="132" width="311" height="1" />
        <text id="3059:9441" name="12" x="0" y="180" width="12" height="15" />
        <rounded-rectangle id="3059:9442" name="Rectangle" x="26" y="186" width="311" height="1" />
        <text id="3059:9443" name="13" x="0" y="234" width="12" height="15" />
        <rounded-rectangle id="3059:9444" name="Rectangle" x="26" y="240" width="311" height="1" />
        <text id="3059:9445" name="14" x="0" y="288" width="12" height="15" />
        <rounded-rectangle id="3059:9446" name="Rectangle" x="26" y="294" width="311" height="1" />
        <text id="3059:9447" name="15" x="0" y="342" width="12" height="15" />
        <rounded-rectangle id="3059:9448" name="Rectangle" x="26" y="348" width="311" height="1" />
        <text id="3059:9449" name="16" x="0" y="396" width="12" height="15" />
        <rounded-rectangle id="3059:9450" name="Rectangle" x="26" y="402" width="311" height="1" />
        <text id="3059:9451" name="17" x="0" y="450" width="12" height="15" />
        <rounded-rectangle id="3059:9452" name="Rectangle" x="26" y="456" width="311" height="1" />
        <rounded-rectangle id="3059:9453" name="Rectangle" x="88.19921875" y="24" width="1" height="486" />
        <rounded-rectangle id="3059:9454" name="Rectangle" x="150.3984375" y="24" width="1" height="486" />
        <rounded-rectangle id="3059:9455" name="Rectangle" x="212.6015625" y="24" width="1" height="486" />
        <rounded-rectangle id="3059:9456" name="Rectangle" x="274.80078125" y="24" width="1" height="486" />
        <frame id="3059:9457" name="Block" x="27.5" y="79" width="59.20000076293945" height="79">
          <text id="3059:9458" name="프로그래밍입문" x="4" y="4" width="51.20000076293945" height="24" />
          <text id="3059:9459" name="07-407" x="4" y="29" width="51.20000076293945" height="11" />
        </frame>
        <frame id="3059:9460" name="Block" x="27.5" y="241" width="59.20000076293945" height="79">
          <text id="3059:9461" name="자기설계세미나" x="4" y="4" width="51.20000076293945" height="24" />
          <text id="3059:9462" name="12-402" x="4" y="29" width="51.20000076293945" height="11" />
        </frame>
        <frame id="3059:9463" name="Block" x="89.69921875" y="133" width="59.20000076293945" height="79">
          <text id="3059:9464" name="소셜커뮤니케이션" x="4" y="4" width="51.20000076293945" height="24" />
          <text id="3059:9465" name="12-404" x="4" y="29" width="51.20000076293945" height="11" />
        </frame>
        <frame id="3059:9466" name="Block" x="89.69921875" y="349" width="59.20000076293945" height="79">
          <text id="3059:9467" name="대학수학(1)" x="4" y="4" width="51.20000076293945" height="12" />
          <text id="3059:9468" name="07-407" x="4" y="17" width="51.20000076293945" height="11" />
        </frame>
        <frame id="3059:9469" name="Block" x="151.8984375" y="106" width="59.20000076293945" height="79">
          <text id="3059:9470" name="컴퓨터공학개론" x="4" y="4" width="51.20000076293945" height="24" />
          <text id="3059:9471" name="07-407" x="4" y="29" width="51.20000076293945" height="11" />
        </frame>
        <frame id="3059:9472" name="Block" x="151.8984375" y="241" width="59.20000076293945" height="79">
          <text id="3059:9473" name="Academic English" x="4" y="4" width="51.20000076293945" height="24" />
          <text id="3059:9474" name="12-402" x="4" y="29" width="51.20000076293945" height="11" />
        </frame>
        <frame id="3059:9475" name="Block" x="214.1015625" y="133" width="59.20000076293945" height="79">
          <text id="3059:9476" name="창의적사고와문제해결" x="4" y="4" width="51.20000076293945" height="24" />
          <text id="3059:9477" name="12-304" x="4" y="29" width="51.20000076293945" height="11" />
        </frame>
      </frame>
    </frame>
    <frame id="3059:9478" name="Card_Reasons" x="16" y="582" width="361" height="247">
      <text id="3059:9479" name="이 시간표를 추천한 이유" x="16" y="16" width="329" height="23" />
      <frame id="3059:9480" name="Item_Reason" x="16" y="49" width="329" height="38">
        <text id="3059:9481" name="✓" x="0" y="0" width="10" height="20" />
        <frame id="3059:9482" name="Text" x="18" y="0" width="311" height="38">
          <text id="3059:9483" name="금요일 공강" x="0" y="0" width="311" height="19" />
          <text id="3059:9484" name="선택한 조건 그대로 충족했어요" x="0" y="20" width="311" height="18" />
        </frame>
      </frame>
      <frame id="3059:9485" name="Item_Reason" x="16" y="97" width="329" height="38">
        <text id="3059:9486" name="✓" x="0" y="0" width="10" height="20" />
        <frame id="3059:9487" name="Text" x="18" y="0" width="311" height="38">
          <text id="3059:9488" name="오전 수업 1개" x="0" y="0" width="311" height="19" />
          <text id="3059:9489" name="가장 이른 수업이 10:30에 시작해요" x="0" y="20" width="311" height="18" />
        </frame>
      </frame>
      <frame id="3059:9490" name="Item_Reason" x="16" y="145" width="329" height="38">
        <text id="3059:9491" name="✓" x="0" y="0" width="10" height="20" />
        <frame id="3059:9492" name="Text" x="18" y="0" width="311" height="38">
          <text id="3059:9493" name="연강 최대 2개" x="0" y="0" width="311" height="19" />
          <text id="3059:9494" name="3연강 이상 구간이 없어요" x="0" y="20" width="311" height="18" />
        </frame>
      </frame>
      <frame id="3059:9495" name="Item_Reason" x="16" y="193" width="329" height="38">
        <text id="3059:9496" name="!" x="0" y="0" width="5" height="20" />
        <frame id="3059:9497" name="Text" x="13" y="0" width="316" height="38">
          <text id="3059:9498" name="야간 수업 1개 포함" x="0" y="0" width="316" height="19" />
          <text id="3059:9499" name="목요일 18:00 수업을 뺄 경우 15학점을 못 채워요" x="0" y="20" width="316" height="18" />
        </frame>
      </frame>
    </frame>
    <frame id="3059:9500" name="Card_CourseList" x="16" y="841" width="361" height="523">
      <text id="3059:9501" name="강의 목록" x="16" y="16" width="329" height="23" />
      <frame id="3059:9502" name="Row_Course" x="16" y="47" width="329" height="60">
        <rounded-rectangle id="3059:9503" name="Rectangle" x="0" y="14" width="4" height="32" />
        <frame id="3059:9504" name="Text" x="14" y="10" width="300" height="40">
          <text id="3059:9505" name="프로그래밍입문" x="0" y="0" width="300" height="20" />
          <text id="3059:9506" name="월 10:00~11:30 · 07-407 · 3학점" x="0" y="22" width="300" height="18" />
        </frame>
        <text id="3059:9507" name="›" x="324" y="18" width="5" height="24" />
      </frame>
      <frame id="3059:9508" name="Row_Course" x="16" y="115" width="329" height="60">
        <rounded-rectangle id="3059:9509" name="Rectangle" x="0" y="14" width="4" height="32" />
        <frame id="3059:9510" name="Text" x="14" y="10" width="300" height="40">
          <text id="3059:9511" name="자기설계세미나" x="0" y="0" width="300" height="20" />
          <text id="3059:9512" name="월 13:00~14:30 · 12-402 · 3학점" x="0" y="22" width="300" height="18" />
        </frame>
        <text id="3059:9513" name="›" x="324" y="18" width="5" height="24" />
      </frame>
      <frame id="3059:9514" name="Row_Course" x="16" y="183" width="329" height="60">
        <rounded-rectangle id="3059:9515" name="Rectangle" x="0" y="14" width="4" height="32" />
        <frame id="3059:9516" name="Text" x="14" y="10" width="300" height="40">
          <text id="3059:9517" name="소셜커뮤니케이션" x="0" y="0" width="300" height="20" />
          <text id="3059:9518" name="화 11:00~12:30 · 12-404 · 3학점" x="0" y="22" width="300" height="18" />
        </frame>
        <text id="3059:9519" name="›" x="324" y="18" width="5" height="24" />
      </frame>
      <frame id="3059:9520" name="Row_Course" x="16" y="251" width="329" height="60">
        <rounded-rectangle id="3059:9521" name="Rectangle" x="0" y="14" width="4" height="32" />
        <frame id="3059:9522" name="Text" x="14" y="10" width="300" height="40">
          <text id="3059:9523" name="대학수학(1)" x="0" y="0" width="300" height="20" />
          <text id="3059:9524" name="화 15:00~16:30 · 07-407 · 3학점" x="0" y="22" width="300" height="18" />
        </frame>
        <text id="3059:9525" name="›" x="324" y="18" width="5" height="24" />
      </frame>
      <frame id="3059:9526" name="Row_Course" x="16" y="319" width="329" height="60">
        <rounded-rectangle id="3059:9527" name="Rectangle" x="0" y="14" width="4" height="32" />
        <frame id="3059:9528" name="Text" x="14" y="10" width="300" height="40">
          <text id="3059:9529" name="컴퓨터공학개론" x="0" y="0" width="300" height="20" />
          <text id="3059:9530" name="수 10:30~12:00 · 07-407 · 3학점" x="0" y="22" width="300" height="18" />
        </frame>
        <text id="3059:9531" name="›" x="324" y="18" width="5" height="24" />
      </frame>
      <frame id="3059:9532" name="Row_Course" x="16" y="387" width="329" height="60">
        <rounded-rectangle id="3059:9533" name="Rectangle" x="0" y="14" width="4" height="32" />
        <frame id="3059:9534" name="Text" x="14" y="10" width="300" height="40">
          <text id="3059:9535" name="Academic English" x="0" y="0" width="300" height="20" />
          <text id="3059:9536" name="수 13:00~14:30 · 12-402 · 3학점" x="0" y="22" width="300" height="18" />
        </frame>
        <text id="3059:9537" name="›" x="324" y="18" width="5" height="24" />
      </frame>
      <frame id="3059:9538" name="Row_Course" x="16" y="455" width="329" height="60">
        <rounded-rectangle id="3059:9539" name="Rectangle" x="0" y="14" width="4" height="32" />
        <frame id="3059:9540" name="Text" x="14" y="10" width="300" height="40">
          <text id="3059:9541" name="창의적사고와문제해결" x="0" y="0" width="300" height="20" />
          <text id="3059:9542" name="목 11:00~12:30 · 12-304 · 3학점" x="0" y="22" width="300" height="18" />
        </frame>
        <text id="3059:9543" name="›" x="324" y="18" width="5" height="24" />
      </frame>
    </frame>
  </frame>
  <frame id="3059:9544" name="Bottom_CTA" x="0" y="1428" width="393" height="72">
    <frame id="3059:9545" name="Btn_Save" x="20" y="8" width="353" height="56">
      <text id="3059:9546" name="이 시간표 저장" x="128.5" y="16" width="96" height="24" />
    </frame>
  </frame>
  <instance id="3077:9632" name="Nav_Back" x="0" y="0" width="393" height="112">
    <frame id="0:62" name="Header" x="12" y="64" width="365" height="40">
      <instance id="0:63" name="Back_Button" x="0" y="0" width="40" height="40" />
      <text id="0:69" name="title" x="40" y="0" width="218" height="40" />
      <slot id="0:70" name="Icons_Container" x="258" y="0" width="107" height="40">
        <instance id="0:71" name="button" x="0" y="2" width="107" height="36" />
      </slot>
    </frame>
  </instance>
</frame>
```
