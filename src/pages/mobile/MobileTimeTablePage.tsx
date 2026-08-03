import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import TimetableGrid from "@/components/mobile/timetable/TimetableGrid";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import ComingSoonModal from "@/components/mobile/common/ComingSoonModal";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { Pencil, Lock, Bell, Palette, Link2, Trash2 } from "lucide-react";
import { useTimetableStore } from "@/stores/useTimetableStore";
import {
  useTimeTables,
  useTimeTableDetail,
  useUpdateTimeTableName,
  useDeleteTimeTable,
} from "@/hooks/useTimeTables";
import CapsuleButton from "@/components/common/CapsuleButton";
import Modal from "@/components/common/Modal";
import InputField from "@/components/common/InputField";
import TimetableThemeBottomSheet from "@/components/mobile/timetable/TimetableThemeBottomSheet";
import TimeTableCreateModal from "@/components/mobile/timetable/TimeTableCreateModal";
import { appBridge, supportsMultiWebView } from "@/utils/appBridgeAdapter";
import { getAppEnvironmentStatus } from "@/utils/getMobilePlatform";

const SIMULATOR_URL = "https://inu-sugang-simulator.pages.dev";

// --- SVG Icons ---
const CaretDownIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="#333D4B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalculatorIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="4"
      y="2"
      width="16"
      height="20"
      rx="2"
      ry="2"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="8"
      y1="6"
      x2="16"
      y2="6"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="16"
      y1="14"
      x2="16"
      y2="18"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="8"
      y1="10"
      x2="8"
      y2="10.01"
      stroke="#0061FF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="10"
      x2="12"
      y2="10.01"
      stroke="#0061FF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="16"
      y1="10"
      x2="16"
      y2="10.01"
      stroke="#0061FF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="8"
      y1="14"
      x2="8"
      y2="14.01"
      stroke="#0061FF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="14"
      x2="12"
      y2="14.01"
      stroke="#0061FF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="8"
      y1="18"
      x2="8"
      y2="18.01"
      stroke="#0061FF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="18"
      x2="12"
      y2="18.01"
      stroke="#0061FF"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarPlusIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="14"
      x2="12"
      y2="18"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="10"
      y1="16"
      x2="14"
      y2="16"
      stroke="#0061FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmptyTimetableIllust = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="60" cy="60" r="52" fill="#F8F9FB" />
    <circle cx="60" cy="60" r="44" fill="#F2F4F6" />

    <circle cx="30" cy="35" r="4" fill="#E5E8EB" />
    <circle cx="92" cy="45" r="5" fill="#E5E8EB" />
    <circle cx="85" cy="85" r="3" fill="#E5E8EB" />

    <g filter="url(#shadow)">
      <rect x="38" y="38" width="44" height="44" rx="8" fill="#FFFFFF" />
      <rect
        x="38"
        y="38"
        width="44"
        height="44"
        rx="8"
        stroke="#E5E8EB"
        strokeWidth="1.5"
      />
      <path d="M38.75 50H81.25" stroke="#E5E8EB" strokeWidth="1.5" />
      <circle cx="48" cy="58" r="2" fill="#E5E8EB" />
      <circle cx="60" cy="58" r="2" fill="#E5E8EB" />
      <circle cx="72" cy="58" r="2" fill="#E5E8EB" />

      <circle cx="48" cy="68" r="2" fill="#E5E8EB" />
      <circle cx="60" cy="68" r="2" fill="url(#blueGrad)" />
      <circle cx="72" cy="68" r="2" fill="#E5E8EB" />
    </g>

    <circle
      cx="76"
      cy="76"
      r="14"
      fill="#3B82F6"
      stroke="#FFFFFF"
      strokeWidth="2.5"
    />
    <path
      d="M76 71V77"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="76" cy="81" r="1" fill="#FFFFFF" />

    <defs>
      <filter
        id="shadow"
        x="32"
        y="34"
        width="56"
        height="56"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feDropShadow
          dx="0"
          dy="2"
          stdDeviation="3"
          floodColor="#000000"
          floodOpacity="0.06"
        />
      </filter>
      <linearGradient
        id="blueGrad"
        x1="58"
        y1="66"
        x2="62"
        y2="70"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#0061FF" />
      </linearGradient>
    </defs>
  </svg>
);

const MobileTimeTablePage = () => {
  const navigate = useNavigate();
  const [isModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameInputVal, setRenameInputVal] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { selectedSemester, activeTimetableId, timetables } =
    useTimetableStore();

  // 서버 시간표 목록 조회 및 스토어 동기화
  useTimeTables();
  const updateNameMutation = useUpdateTimeTableName();
  const deleteMutation = useDeleteTimeTable();

  // Find active timetable for the selected semester
  const activeTimetable = useMemo(() => {
    const list = timetables.filter((t) => t.semester === selectedSemester);
    if (list.length === 0) return null;
    return (
      list.find((t) => t.id === activeTimetableId) ||
      list.find((t) => t.isRepresentative) ||
      list[0]
    );
  }, [timetables, selectedSemester, activeTimetableId]);

  // 활성 시간표의 상세(요소 포함) 조회 및 그리드 이벤트 동기화
  useTimeTableDetail(activeTimetable?.id);

  const activeTitle = activeTimetable ? activeTimetable.name : "시간표";
  const appEnvironment = getAppEnvironmentStatus();
  const shouldOpenSimulatorInNewWebView =
    supportsMultiWebView() && appEnvironment === "NEW_APP";

  const headerRight = useMemo(
    () => (
      <HeaderRightArea>
        <IconButton onClick={() => navigate(ROUTES.TIMETABLE.EDIT)}>
          <Pencil size={22} color="#1C1C1E" />
        </IconButton>
      </HeaderRightArea>
    ),
    [navigate],
  );

  const headerTitle = useMemo(() => {
    return (
      <HeaderTitleContainer onClick={() => navigate(ROUTES.TIMETABLE.LIST)}>
        <HeaderMainTitle>{activeTitle}</HeaderMainTitle>
        <HeaderTermWrapper>
          <HeaderTermText>{selectedSemester}</HeaderTermText>
          <CaretDownIcon />
        </HeaderTermWrapper>
      </HeaderTitleContainer>
    );
  }, [selectedSemester, activeTitle, navigate]);

  const timetableMenuItems = useMemo(() => {
    if (!activeTimetable) return [];

    return [
      {
        label: "시간표 이름 변경",
        icon: <Pencil size={20} />,
        onClick: () => {
          setRenameInputVal(activeTimetable.name);
          setIsRenameModalOpen(true);
        },
      },
      {
        label: "시간표 공개 범위 선택",
        icon: <Lock size={20} />,
        onClick: () => {
          navigate(ROUTES.TIMETABLE.VISIBILITY);
        },
      },
      {
        label: "강의 알림 설정",
        icon: <Bell size={20} />,
        onClick: () => {
          navigate(ROUTES.MYPAGE.NOTIFICATION);
        },
      },
      {
        label: "시간표 테마 설정",
        icon: <Palette size={20} />,
        onClick: () => {
          setIsThemeSheetOpen(true);
        },
      },
      {
        label: "내 시간표 공유",
        icon: <Link2 size={20} />,
        onClick: () => {
          navigator.clipboard.writeText(
            window.location.origin +
              ROUTES.TIMETABLE.ROOT +
              `?id=${activeTimetable.id}`,
          );
          alert("시간표 링크가 클립보드에 복사되었습니다.");
        },
      },
      {
        label: "시간표 삭제",
        icon: <Trash2 size={20} color="#FF3B30" />,
        onClick: () => {
          setIsDeleteModalOpen(true);
        },
      },
    ];
  }, [
    activeTimetable,
    navigate,
    setIsRenameModalOpen,
    setRenameInputVal,
    setIsDeleteModalOpen,
    setIsThemeSheetOpen,
  ]);

  useHeader({
    title: headerTitle,
    showAlarm: false,
    hasback: false,
    rightArea: headerRight,
    menuItems: timetableMenuItems,
  });

  const handleGradeCalculatorClick = () => {
    navigate(ROUTES.TIMETABLE.CALCULATOR);
  };

  return (
    <MobileTimeTablePageWrapper>
      <ComingSoonModal
        isOpen={isModalOpen}
        onClose={() => navigate(ROUTES.HOME, { replace: true })}
      />

      <TimeTableCreateModal
        isOpen={isCreateModalOpen}
        initialSemester={selectedSemester}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {activeTimetable && (
        <>
          <Modal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            title="시간표 이름 변경"
            primaryButton={{
              text: "변경",
              variant: "brand",
              onClick: () => {
                if (!renameInputVal.trim()) return;
                updateNameMutation.mutate(
                  {
                    timeTableId: activeTimetable.id,
                    timeTableName: renameInputVal.trim(),
                  },
                  {
                    onSuccess: () => {
                      setIsRenameModalOpen(false);
                    },
                    onError: (error: any) => {
                      alert(
                        error.response?.data?.msg ||
                          "시간표 이름 변경에 실패했습니다.",
                      );
                    },
                  },
                );
              },
              disabled: !renameInputVal.trim() || updateNameMutation.isPending,
            }}
            secondaryButton={{
              text: "취소",
              onClick: () => setIsRenameModalOpen(false),
            }}
          >
            <InputField
              label="시간표 이름"
              value={renameInputVal}
              onChange={setRenameInputVal}
              placeholder="시간표 이름을 입력하세요"
            />
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="시간표 삭제"
            description={`"${activeTimetable.name}" 시간표를 삭제하면\n복구할 수 없습니다. 삭제하시겠습니까?`}
            primaryButton={{
              text: "삭제",
              variant: "danger",
              onClick: () => {
                if (deleteMutation.isPending) return;
                deleteMutation.mutate(activeTimetable.id, {
                  onSuccess: () => {
                    setIsDeleteModalOpen(false);
                  },
                  onError: (error: any) => {
                    alert(
                      error.response?.data?.msg ||
                        "시간표 삭제에 실패했습니다.",
                    );
                  },
                });
              },
            }}
            secondaryButton={{
              text: "취소",
              onClick: () => setIsDeleteModalOpen(false),
            }}
          />

          <TimetableThemeBottomSheet
            open={isThemeSheetOpen}
            onOpenChange={setIsThemeSheetOpen}
            timetableId={activeTimetable.id}
          />
        </>
      )}

      {activeTimetable ? (
        <TimetableGrid
          events={activeTimetable.events}
          theme={activeTimetable.theme}
        />
      ) : (
        <NoTimetableContainer>
          <NoTimetableContent>
            <EmptyTimetableIllust />
            <NoTimetableTextGroup>
              <NoTimetableTitle>등록된 시간표가 없어요</NoTimetableTitle>
              <NoTimetableDescription>
                {selectedSemester} 시간표를 만들어볼까요?
              </NoTimetableDescription>
            </NoTimetableTextGroup>
          </NoTimetableContent>
          <CapsuleButton
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            // style={{ width: "100%", maxWidth: "353px" }}
          >
            시간표 생성하기
          </CapsuleButton>
        </NoTimetableContainer>
      )}

      <SemesterInfoLine>
        <ScoreArea>
          <div className="type1">
            <span>전공 9</span>
            <span>교양 9</span>
          </div>
          <div className="type2">총 18학점</div>
        </ScoreArea>
      </SemesterInfoLine>

      <ButtonGroup>
        <ButtonRow>
          <MenuCard onClick={() => navigate(ROUTES.FRIEND.LIST)}>
            <MenuCardTitleRow>
              <MenuCardTitle>친구</MenuCardTitle>
              <IconSlot>
                <UsersIcon />
              </IconSlot>
            </MenuCardTitleRow>
            <MenuCardDescription>공강 시간을 비교해 보세요</MenuCardDescription>
          </MenuCard>

          <MenuCard onClick={handleGradeCalculatorClick}>
            <MenuCardTitleRow>
              <MenuCardTitle>학점계산기</MenuCardTitle>
              <IconSlot>
                <CalculatorIcon />
              </IconSlot>
            </MenuCardTitleRow>
            <MenuCardDescription>예상 학점을 계산해 보세요</MenuCardDescription>
          </MenuCard>
        </ButtonRow>

        <MenuCard
          onClick={() =>
            shouldOpenSimulatorInNewWebView
              ? appBridge.navigateTo(SIMULATOR_URL)
              : navigate(ROUTES.TIMETABLE.SIMULATOR)
          }
          $fullWidth
        >
          <MenuCardTitleRow>
            <MenuCardTitle>모의 수강신청 (수강신청 시뮬레이터)</MenuCardTitle>
            <IconSlot>
              <CalendarPlusIcon />
            </IconSlot>
          </MenuCardTitleRow>
          <MenuCardDescription>
            수강신청 전 시간표를 미리 짜 보세요
          </MenuCardDescription>
        </MenuCard>
      </ButtonGroup>
    </MobileTimeTablePageWrapper>
  );
};

export default MobileTimeTablePage;

const MobileTimeTablePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: var(--header-height, 56px) ${MOBILE_PAGE_GUTTER}
    calc(var(--nav-height, 100px) + 40px);

  @media ${DESKTOP_MEDIA} {
    padding: var(--header-height, 56px) 0 40px;
  }
`;

const SemesterInfoLine = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  margin-top: 8px;
  padding: 0 8px;
`;

const ScoreArea = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;

  .type1 {
    color: #6b7280;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }
  .type2 {
    color: var(--text-secondary);
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
  }
`;

const HeaderRightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
`;

const HeaderTitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
  cursor: pointer;
  height: 40px;
`;

const HeaderMainTitle = styled.span`
  font-family: Pretendard;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.2px;
  color: var(--text-secondary, #333d4b);
`;

const HeaderTermWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2px;
  padding-bottom: 2px;
  margin-top: 6px;
`;

const HeaderTermText = styled.span`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-secondary, #333d4b);
  white-space: nowrap;
`;

const NoTimetableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  width: 100%;
  height: 480px;
  border-radius: 20px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-base, #ffffff);
  box-sizing: border-box;
  padding: 40px 20px;
  //margin-bottom: 24px;
`;

const NoTimetableContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
`;

const NoTimetableTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const NoTimetableTitle = styled.h3`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 20px;
  line-height: 32px;
  color: var(--text-primary, #333d4b);
  margin: 0;
  text-align: center;
`;

const NoTimetableDescription = styled.p`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-secondary, #6b7684);
  margin: 0;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 24px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  width: 100%;
`;

const MenuCard = styled.div<{ $fullWidth?: boolean }>`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  padding: 16px 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: ${({ $fullWidth }) => ($fullWidth ? "1" : "1 0 0")};
  min-width: 0;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-sizing: border-box;

  &:hover {
    background-color: var(--bg-muted, #f1f3f5);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const MenuCardTitleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

const MenuCardTitle = styled.span`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const MenuCardDescription = styled.p`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-secondary, #6b7684);
  margin: 0;
  width: 100%;
  word-break: keep-all;
`;
