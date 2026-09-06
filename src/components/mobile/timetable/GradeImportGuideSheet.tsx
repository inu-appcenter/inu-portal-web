import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { ClipboardPaste } from "lucide-react";
import Icon from "@/components/common/Icon";
import CapsuleButton from "@/components/common/CapsuleButton";
// 실제 스마트캠퍼스 앱 홈 화면 스크린샷. 이름/소속은 이미 더미 데이터("김유니")로
// 바꿔둔 캡처본이라 실사용자 개인정보가 아니다 — 다른 스크린샷으로 교체할 때도
// 반드시 더미 데이터로 가린 캡처만 사용할 것.
import { gradeImportInuAppMain as inuMainScreenshot } from "@/resources/assets/illustrations/features";

interface GradeImportGuideSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * "성적 붙여넣기" 사용법 튜토리얼.
 * 학교 스마트캠퍼스 앱 화면을 모방한 목업이며, 실제 개인정보 노출을 막기 위해
 * 이름/성적은 전부 더미 데이터("김유니")를 사용한다.
 */

// --- 더미 데이터 (이름 "김유니"는 inuapp-main.jpg 스크린샷 안에 이미 반영돼 있다) ---
const DUMMY_ROWS = [
  { name: "자료구조와알고리즘", code: "IAA6021", credit: 3, grade: "A+", isuName: "전공핵심", isuFldName: "전공핵심" },
  { name: "확률및통계", code: "0003321", credit: 3, grade: "B+", isuName: "균형교양", isuFldName: "수리와정보" },
  { name: "데이터베이스설계", code: "IAA6042", credit: 3, grade: "A0", isuName: "전공심화", isuFldName: "전공심화" },
  { name: "캡스톤디자인Ⅰ", code: "0012390", credit: 2, grade: "A+", isuName: "전공심화", isuFldName: "전공심화" },
  { name: "운영체제", code: "IAA6018", credit: 3, grade: "C+", isuName: "전공핵심", isuFldName: "전공핵심" },
  { name: "인공지능개론", code: "IAA6091", credit: 3, grade: "A0", isuName: "전공심화", isuFldName: "전공심화" },
  { name: "스포츠와건강", code: "0001122", credit: 1, grade: "P", isuName: "기초교양", isuFldName: "-" },
];

const SEMESTER_ROWS = [
  { label: "2026 · 1학기", credit: 18, gpa: "3.79" },
  { label: "2025 · 2학기", credit: 17, gpa: "3.65" },
  { label: "2025 · 1학기", credit: 18, gpa: "3.52" },
];

const PASTE_PREVIEW_TEXT = [
  "2026년 1학기 과목별 성적",
  "교과목명/과목코드\t학점\t등급\t이수구분\t이수영역",
  ...DUMMY_ROWS.map(
    (r) => `${r.name} / ${r.code}\t${r.credit}\t${r.grade}\t${r.isuName}\t${r.isuFldName}`,
  ),
].join("\n");

const STEPS = [
  {
    title: "① 스마트캠퍼스 앱에서 성적조회로 이동해요",
    desc: "학교 스마트캠퍼스 앱을 열고 INU 서비스에서 성적조회를 눌러주세요.",
  },
  {
    title: "② 취득성적 표를 아래로 스크롤해요",
    desc: "취득성적 탭에서 아래로 내리면 학기별 과목 성적표가 나와요.",
  },
  {
    title: "③ 표를 꾹 눌러 드래그한 뒤 복사해요",
    desc: "과목별 성적 표를 손가락으로 꾹 눌러 드래그해 선택하고 복사하기를 눌러주세요. 표 제목이나 위쪽 요약이 같이 선택돼도, \"모두 선택\"으로 화면을 통째로 복사해도 괜찮아요.",
  },
  {
    title: "④ 여기로 돌아와 붙여넣고 불러오기를 눌러요",
    desc: "복사한 내용을 성적 붙여넣기 칸에 그대로 붙여넣으면 과목이 자동으로 채워져요.",
  },
];

export default function GradeImportGuideSheet({
  isOpen,
  onClose,
}: GradeImportGuideSheetProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    onClose();
    // 다음에 다시 열었을 때는 처음 단계부터 보여준다.
    setTimeout(() => setStep(0), 200);
  };

  return (
    <>
      <GuideOverlay onClick={handleClose} />
      <GuideSheet>
        <SheetHeader>
          <div className="drag-handle" />
          <div className="title-row">
            <div className="title">복사하는 방법</div>
            <CloseButton onClick={handleClose} aria-label="닫기">
              <Icon name="close-md" size={18} />
            </CloseButton>
          </div>
        </SheetHeader>

        <SheetBody>
          <StepBadge>STEP {step + 1} / {STEPS.length}</StepBadge>
          <StepTitle>{STEPS[step].title}</StepTitle>
          <StepDesc>{STEPS[step].desc}</StepDesc>

          <MockStage>
            {step === 0 && <MockHome />}
            {step === 1 && <MockGradeTop />}
            {step === 2 && <MockGradeSelect />}
            {step === 3 && <MockPasteBack />}
          </MockStage>

          <DotsRow>
            {STEPS.map((_, i) => (
              <Dot key={i} $active={i === step} onClick={() => setStep(i)} />
            ))}
          </DotsRow>

          <DummyNotice>
            튜토리얼에 나오는 이름과 성적은 예시(더미 데이터)예요.
          </DummyNotice>
        </SheetBody>

        <SheetFooter>
          {!isFirst && (
            <PrevButton
              variant="secondary"
              leftIcon={<Icon name="chevron-left" size={16} />}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              이전
            </PrevButton>
          )}
          <NextButton
            variant="primary"
            fullWidth
            rightIcon={!isLast ? <Icon name="chevron-right" size={16} /> : undefined}
            onClick={() =>
              isLast ? handleClose() : setStep((s) => Math.min(STEPS.length - 1, s + 1))
            }
          >
            {isLast ? "확인했어요" : "다음"}
          </NextButton>
        </SheetFooter>
      </GuideSheet>
    </>
  );
}

// ============================================================
// Step 1 — 스마트캠퍼스 홈 화면 목업
// ============================================================
function MockHome() {
  return (
    <PhoneFrame>
      <ScreenshotWrap>
        <img src={inuMainScreenshot} alt="스마트캠퍼스 앱 홈 화면의 성적조회 메뉴" />
        <HighlightRing />
      </ScreenshotWrap>
      <ImageCaption>
        <b>성적조회</b>를 눌러 이동해요
      </ImageCaption>
    </PhoneFrame>
  );
}

// ============================================================
// Step 2 — 성적 페이지 상단(전체성적 요약 + 학기성적) 목업
// ============================================================
function MockGradeTop() {
  return (
    <PhoneFrame>
      <StatusBar />
      <NavyBar>
        <Icon name="chevron-left" size={16} />
        <span>성적</span>
      </NavyBar>
      <TabsRow>
        <Tab $active>취득성적</Tab>
        <Tab>확정전성적</Tab>
      </TabsRow>

      <SectionBar>전체성적</SectionBar>
      <SummaryRow>
        <SummaryCell>
          <b>18</b>
          <span>신청학점</span>
        </SummaryCell>
        <SummaryCell>
          <b>18</b>
          <span>취득학점</span>
        </SummaryCell>
        <SummaryCell>
          <b>3.79</b>
          <span>학기평점</span>
        </SummaryCell>
      </SummaryRow>

      <SectionBar>학기성적</SectionBar>
      <SemTableHeaderRow>
        <span>학기</span>
        <span>취득</span>
        <span>평점</span>
      </SemTableHeaderRow>
      {SEMESTER_ROWS.map((row) => (
        <SemTableRow key={row.label}>
          <span>{row.label}</span>
          <span>{row.credit}</span>
          <span>{row.gpa}</span>
        </SemTableRow>
      ))}

      <SectionBar $peek>2026년 1학기 과목별 성적</SectionBar>
      <ScrollFade />
      <BottomBounceChevron>
        <Icon name="chevron-down" size={14} />
      </BottomBounceChevron>
    </PhoneFrame>
  );
}

// ============================================================
// Step 3 — 과목별 성적 표 드래그 선택 + 복사 목업 (핵심 단계)
// ============================================================
function MockGradeSelect() {
  return (
    <PhoneFrame>
      <StatusBar />
      <NavyBar>
        <Icon name="chevron-left" size={16} />
        <span>성적</span>
      </NavyBar>
      <TabsRow>
        <Tab $active>취득성적</Tab>
        <Tab>확정전성적</Tab>
      </TabsRow>

      <SectionBar>2026년 1학기 과목별 성적</SectionBar>

      <CourseTableWrap>
        <ContextMenuBubble>
          <span>복사하기</span>
          <i />
          <span>번역</span>
          <i />
          <span>웹 검색</span>
          <Icon name="chevron-right" size={10} />
        </ContextMenuBubble>

        <CourseHeaderRow>
          <span className="name">교과목명/과목코드</span>
          <span>학점</span>
          <span>등급</span>
        </CourseHeaderRow>
        <DragHandleDot />
        {DUMMY_ROWS.map((row) => (
          <CourseRow key={row.code} $selected>
            <span className="name">
              {row.name} / {row.code}
            </span>
            <span>{row.credit}</span>
            <span>{row.grade}</span>
          </CourseRow>
        ))}
        <DragFingerHint />
      </CourseTableWrap>
    </PhoneFrame>
  );
}

// ============================================================
// Step 4 — 학점계산기 성적 붙여넣기 화면으로 돌아와 붙여넣기 목업
// ============================================================
function MockPasteBack() {
  return (
    <PhoneFrame>
      <StatusBar />
      <LightHeaderRow>
        <Icon name="chevron-left" size={16} color="#333d4b" />
        <span>성적 붙여넣기</span>
        <span style={{ width: 16 }} />
      </LightHeaderRow>

      <PasteHint>
        <ClipboardPaste size={12} />
        복사한 표를 아래에 붙여넣으세요
      </PasteHint>

      <PastePreviewBox>
        {PASTE_PREVIEW_TEXT.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </PastePreviewBox>

      <ImportButtonMock>불러오기</ImportButtonMock>

      <ResultToast>
        <Icon name="circle-check" size={12} />
        {DUMMY_ROWS.length}개 과목을 찾았어요
      </ResultToast>
    </PhoneFrame>
  );
}

// ============================================================
// Styled — 시트 뼈대
// ============================================================
const GuideOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 2100;
`;

const GuideSheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-base, #ffffff);
  border-radius: 24px 24px 0 0;
  max-height: 92vh;
  z-index: 2101;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s cubic-bezier(0.1, 0.76, 0.55, 0.94);

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const SheetHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px 8px;
  flex-shrink: 0;

  .drag-handle {
    width: 36px;
    height: 4px;
    background-color: var(--border-default, #e5e8eb);
    border-radius: 2px;
    margin-bottom: 12px;
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary, #333d4b);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 0;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  color: var(--text-tertiary, #8b95a1);
  cursor: pointer;
  outline: none;
`;

// min-height:0이 없으면 폰 목업(PhoneFrame, 440px 고정)이 시트를 max-height 밖으로 밀어
// 내서 하단이 잘리고 스크롤도 생기지 않는다. GradeImportSheet의 SheetBody와 같은 이유.
const SheetBody = styled.div`
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 4px 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-height: 0;
`;

const StepBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-brand, #0061ff);
  letter-spacing: 0.2px;
`;

const StepTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #333d4b);
  text-align: center;
`;

const StepDesc = styled.p`
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 17px;
  color: var(--text-tertiary, #8b95a1);
  text-align: center;
  max-width: 280px;
`;

const MockStage = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: 100%;
`;

const DotsRow = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? "16px" : "6px")};
  height: 6px;
  border-radius: 999px;
  border: none;
  padding: 0;
  cursor: pointer;
  background-color: ${({ $active }) =>
    $active ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)"};
  transition: all 0.2s ease;
`;

const DummyNotice = styled.p`
  margin: 6px 0 0;
  font-size: 11px;
  color: var(--text-disabled, #b0b8c1);
  text-align: center;
`;

const SheetFooter = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--border-default, #e5e8eb);
`;

// fullWidth(width:100%)를 형제 버튼과 같은 flex 행에 두면 폭 계산이 100%+100%로
// 겹쳐서 좁은 "이전" 쪽이 줄바꿈될 만큼 찌그러진다. flex-basis를 명시해 나눠 갖게 한다.
const PrevButton = styled(CapsuleButton)`
  flex-shrink: 0;
  white-space: nowrap;
`;

const NextButton = styled(CapsuleButton)`
  flex: 1;
`;

// ============================================================
// Styled — 폰 목업 뼈대(공통)
// ============================================================
const PhoneFrame = styled.div`
  width: 240px;
  height: 440px;
  flex-shrink: 0;
  border: 8px solid #1c1c1e;
  border-radius: 34px;
  overflow: hidden;
  position: relative;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
`;

const StatusBar = styled.div`
  height: 20px;
  flex-shrink: 0;
  background-color: #ffffff;

  &::before {
    content: "9:09";
    display: block;
    font-size: 9px;
    font-weight: 600;
    color: #111;
    padding: 4px 0 0 12px;
  }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
`;

const pulseRing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 97, 255, 0.35); }
  70% { box-shadow: 0 0 0 6px rgba(0, 97, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 97, 255, 0); }
`;

// ---- Step 1 전용(실제 앱 스크린샷 + 하이라이트) ----
const ScreenshotWrap = styled.div`
  position: relative;
  width: 100%;
  /* 스크린샷 원본에서 헤더~서비스 그리드 2줄 정도까지만 보이도록 잘라낸다. */
  height: 310px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    display: block;
    width: 100%;
    height: auto;
  }
`;

// 스크린샷 속 "성적조회" 아이콘 위치(원본 기준 약 x:605~765, y:995~1200 /
// 1125x1453 보이는 영역 대비 %)에 맞춘 좌표. 다른 캡처로 바꾸면 값도 다시 재야 한다.
const HighlightRing = styled.div`
  position: absolute;
  left: 53%;
  top: 63%;
  width: 16%;
  height: 16%;
  border-radius: 16px;
  border: 2px solid #0061ff;
  animation: ${pulseRing} 1.6s ease-out infinite;
  pointer-events: none;
`;

const ImageCaption = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  color: #333d4b;
  text-align: center;

  b {
    color: #0061ff;
    margin-right: 2px;
  }
`;

// ---- Step 2/3 공통(성적 페이지) ----
const NavyBar = styled.div`
  height: 30px;
  flex-shrink: 0;
  background-color: #14336b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 6px;

  svg {
    position: absolute;
    left: 10px;
  }

  span {
    font-size: 12px;
    font-weight: 600;
  }
`;

const TabsRow = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const Tab = styled.div<{ $active?: boolean }>`
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 10px;
  font-weight: ${({ $active }) => ($active ? 700 : 400)};
  color: ${({ $active }) => ($active ? "#ffffff" : "#6b7684")};
  background-color: ${({ $active }) => ($active ? "#14336b" : "#e9ebee")};
`;

const SectionBar = styled.div<{ $peek?: boolean }>`
  background-color: #ececec;
  color: #55606b;
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  padding: 5px 0;
  flex-shrink: 0;
  opacity: ${({ $peek }) => ($peek ? 0.6 : 1)};
`;

const SummaryRow = styled.div`
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid #eef0f2;
`;

const SummaryCell = styled.div`
  flex: 1;
  text-align: center;
  padding: 6px 0;
  border-right: 1px solid #eef0f2;
  display: flex;
  flex-direction: column;
  gap: 1px;

  &:last-child {
    border-right: none;
  }

  b {
    font-size: 12px;
    color: #333d4b;
  }
  span {
    font-size: 8px;
    color: #8b95a1;
  }
`;

const SemTableHeaderRow = styled.div`
  display: flex;
  flex-shrink: 0;
  background-color: #f5f6f7;
  padding: 4px 10px;

  span {
    flex: 1;
    font-size: 8px;
    color: #8b95a1;
    text-align: center;
  }
`;

const SemTableRow = styled.div`
  display: flex;
  flex-shrink: 0;
  padding: 5px 10px;
  border-bottom: 1px solid #f1f3f5;

  span {
    flex: 1;
    font-size: 9px;
    color: #333d4b;
    text-align: center;
  }
`;

const ScrollFade = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #ffffff 90%);
  pointer-events: none;
`;

const BottomBounceChevron = styled.div`
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  color: var(--text-brand, #0061ff);
  animation: ${bounce} 1.1s ease-in-out infinite;
`;

// ---- Step 3 전용 ----
const CourseTableWrap = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

const CourseHeaderRow = styled.div`
  display: flex;
  background-color: #f5f6f7;
  padding: 4px 8px;

  span {
    font-size: 8px;
    color: #8b95a1;
    text-align: center;
    flex: 1;
  }
  .name {
    flex: 2;
    text-align: left;
  }
`;

const CourseRow = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border-bottom: 1px solid #f1f3f5;
  background-color: ${({ $selected }) => ($selected ? "rgba(0, 97, 255, 0.12)" : "transparent")};

  span {
    font-size: 8.5px;
    color: #333d4b;
    text-align: center;
    flex: 1;
  }
  .name {
    flex: 2;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const DragHandleDot = styled.div`
  position: absolute;
  top: 24px;
  left: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #0061ff;
  z-index: 2;

  &::after {
    content: "";
    position: absolute;
    top: 8px;
    left: 3px;
    width: 2px;
    height: 130px;
    background-color: #0061ff;
    opacity: 0.5;
  }
`;

const ContextMenuBubble = styled.div`
  position: absolute;
  top: 24px;
  right: 8px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #3a3a3c;
  color: #ffffff;
  border-radius: 8px;
  padding: 5px 6px;
  font-size: 7.5px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);

  i {
    width: 1px;
    height: 8px;
    background-color: rgba(255, 255, 255, 0.35);
    font-style: normal;
  }
`;

const dragMove = keyframes`
  0% { transform: translate(30px, 20px); opacity: 0.9; }
  100% { transform: translate(140px, 130px); opacity: 0.6; }
`;

const DragFingerHint = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(0, 97, 255, 0.5);
  border: 2px solid #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  animation: ${dragMove} 1.4s ease-in-out infinite alternate;
  z-index: 4;
  pointer-events: none;
`;

// ---- Step 4 전용 ----
const LightHeaderRow = styled.div`
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #f1f3f5;

  span {
    font-size: 11px;
    font-weight: 600;
    color: #333d4b;
  }
`;

const PasteHint = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 10px 4px;
  padding: 6px 8px;
  border-radius: 8px;
  background-color: #f8f9fb;
  font-size: 8.5px;
  color: #6b7684;
  flex-shrink: 0;
`;

const PastePreviewBox = styled.div`
  margin: 0 10px;
  padding: 6px 8px;
  border: 1px solid #0061ff;
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 7px;
  line-height: 11px;
  color: #333d4b;
  flex: 1;
  overflow: hidden;
  font-family: "SFMono-Regular", Consolas, monospace;
`;

const ImportButtonMock = styled.div`
  margin: 8px 10px 0;
  padding: 7px 0;
  border-radius: 999px;
  background-color: #0061ff;
  color: #ffffff;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  animation: ${pulseRing} 1.6s ease-out infinite;
`;

const ResultToast = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 6px 10px 8px;
  padding: 5px 0;
  border-radius: 8px;
  background-color: #f0fdf4;
  color: #16a34a;
  font-size: 8.5px;
  font-weight: 600;
  flex-shrink: 0;
`;
