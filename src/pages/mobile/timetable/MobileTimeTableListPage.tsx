import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import { useNavigate } from "react-router-dom";
import {
  useTimetableStore,
  flushTimetableStoreSync,
  Timetable,
} from "@/stores/useTimetableStore";
import { ROUTES } from "@/constants/routes";
import { useMemo, useCallback, useState } from "react";
import Icon from "@/components/common/Icon";
import { ClassItem } from "@/components/mobile/timetable/TimetableGrid";
import TimeTableCreateModal from "@/components/mobile/timetable/TimeTableCreateModal";
import Modal from "@/components/common/Modal";
import InputField from "@/components/common/InputField";
import {
  useTimeTables,
  useUpdateTimeTablePrimary,
  useUpdateTimeTableName,
  useDeleteTimeTable,
} from "@/hooks/useTimeTables";
import { useSemesters } from "@/hooks/useSemesters";
import { formatSemester, pickCurrentSemester } from "@/utils/semester";
import { mixpanelTrack } from "@/utils/mixpanel";

// Icons
const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="#333D4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#FFD60A" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={filled ? "#FFD60A" : "#B0B8C1"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getTimetableCredits = (events: ClassItem[]) => {
  const seenItemIds = new Set<number>();

  return events.reduce((total, item) => {
    if (item.itemId) {
      if (seenItemIds.has(item.itemId)) return total;
      seenItemIds.add(item.itemId);
    }

    const credits = item.credits || 0;
    return credits > 0 ? total + credits : total;
  }, 0);
};

export default function MobileTimeTableListPage() {
  const navigate = useNavigate();
  const { timetables, setSemester, setActiveTimetable } = useTimetableStore();

  // 서버 시간표 목록 조회 및 스토어 동기화
  useTimeTables();
  const { semesters: serverSemesters } = useSemesters();
  const updatePrimaryMutation = useUpdateTimeTablePrimary();
  const updateNameMutation = useUpdateTimeTableName();
  const deleteMutation = useDeleteTimeTable();

  // 이름 변경/삭제(#252). 그리드 화면(MobileTimeTablePage)에는 있었지만 여러
  // 시간표를 한 눈에 보는 이 목록 화면에는 관리 동작이 아예 없었다 - 같은
  // mutation을 그대로 재사용한다.
  const [renameTarget, setRenameTarget] = useState<Timetable | null>(null);
  const [renameInputVal, setRenameInputVal] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Timetable | null>(null);

  const openRenameModal = (t: Timetable) => {
    setRenameInputVal(t.name);
    setRenameTarget(t);
  };

  const handleRenameConfirm = () => {
    if (!renameTarget || !renameInputVal.trim()) return;
    updateNameMutation.mutate(
      { timeTableId: renameTarget.id, timeTableName: renameInputVal.trim() },
      {
        onSuccess: () => {
          mixpanelTrack.timetableActionCompleted("이름 변경", {
            semester: renameTarget.semester,
          });
          setRenameTarget(null);
        },
        onError: (error: any) => {
          alert(error.response?.data?.msg || "시간표 이름 변경에 실패했습니다.");
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget || deleteMutation.isPending) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        mixpanelTrack.timetableActionCompleted("삭제", {
          semester: deleteTarget.semester,
          course_count: deleteTarget.events.length,
        });
        setDeleteTarget(null);
      },
      onError: (error: any) => {
        alert(error.response?.data?.msg || "시간표 삭제에 실패했습니다.");
      },
    });
  };

  const handleSetPrimary = (t: Timetable) => {
    if (t.isRepresentative || updatePrimaryMutation.isPending) return;
    updatePrimaryMutation.mutate(t.id, {
      onSuccess: () => {
        setSemester(t.semester);
        setActiveTimetable(t.id);
        mixpanelTrack.timetableActionCompleted("대표 설정", {
          semester: t.semester,
          course_count: t.events.length,
        });
      },
      onError: (error: any) => {
        alert(error.response?.data?.msg || "대표 시간표 변경에 실패했습니다.");
      },
    });
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalSemester, setAddModalSemester] = useState("");

  const semesters = useMemo(
    () => serverSemesters.map((s) => formatSemester(s.year, s.term)),
    [serverSemesters],
  );

  const openAddModal = useCallback((semester: string) => {
    setAddModalSemester(semester);
    setIsAddModalOpen(true);
  }, []);

  const handleAddClick = useCallback(() => {
    // 목록(semesters[0])이 아니라 serverSemesters에서 진행중(OPEN) 학기를 직접
    // 고른다 — 다음 학기가 미리 등록돼 있으면 semesters[0]이 아직 아무 시간표도
    // 없어야 정상인 미래 학기가 될 수 있다(#235).
    const preferred = pickCurrentSemester(serverSemesters);
    if (!preferred) return;
    mixpanelTrack.timetableFeatureClicked("시간표 생성", "시간표 목록");
    openAddModal(formatSemester(preferred.year, preferred.term));
  }, [openAddModal, serverSemesters]);

  const headerRight = useMemo(() => (
    <IconButton onClick={handleAddClick}>
      <PlusIcon />
    </IconButton>
  ), [handleAddClick]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useHeader({
    title: "시간표 목록",
    hasback: true,
    onBack: handleBack,
    immersive: true,
    pageBgColor: "#f8f9fb",
    rightArea: headerRight
  });

  const handleSelectTimetable = (t: Timetable) => {
    mixpanelTrack.timetableFeatureClicked("시간표 선택", "시간표 목록", {
      semester: t.semester,
      course_count: t.events.length,
      is_representative: t.isRepresentative,
    });
    setSemester(t.semester);
    setActiveTimetable(t.id);
    // 멀티 웹뷰에서 이 목록은 별도 웹뷰이고 아래 navigate는 곧바로 네이티브에
    // goHome을 보내 이 웹뷰를 접는다. 선택 결과는 broadcastSync로만 시간표 탭
    // 웹뷰에 도달하므로(쿼리스트링은 goHome이 경로만 넘겨 버려진다), 병합을
    // 건너뛰고 이동 직전에 즉시 내보낸다.
    flushTimetableStoreSync();
    // id를 함께 넘겨 URL이 바로 이 시간표를 가리키게 함 (새로고침 시 복원용)
    navigate(`${ROUTES.TIMETABLE.ROOT}?id=${t.id}`, { replace: true });
  };

  return (
    <PageWrapper>
      <ListContainer>
        {semesters.map((sem) => {
          const list = timetables.filter((t) => t.semester === sem);
          const hasTimetable = list.length > 0;
          return (
            <TimeTableListCard
              key={sem}
              $isClickable={!hasTimetable}
              onClick={
                hasTimetable
                  ? undefined
                  : () => openAddModal(sem)
              }
              role={!hasTimetable ? "button" : undefined}
              tabIndex={!hasTimetable ? 0 : undefined}
              onKeyDown={
                !hasTimetable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openAddModal(sem);
                      }
                    }
                  : undefined
              }
            >
              <SemesterHeaderRow>
                <SemesterTitle>{sem}</SemesterTitle>
                <SemesterAddButton
                  type="button"
                  aria-label={`${sem} 시간표 추가`}
                  onClick={(e) => {
                    e.stopPropagation();
                    mixpanelTrack.timetableFeatureClicked("시간표 생성", "학기 섹션", {
                      semester: sem,
                    });
                    openAddModal(sem);
                  }}
                >
                  <Icon name="add-plus-sm" size={20} />
                </SemesterAddButton>
              </SemesterHeaderRow>
              {hasTimetable ? (
                <ScheduleListWrapper>
                  {list.map((t) => (
                    <ScheduleRow key={t.id} onClick={() => handleSelectTimetable(t)}>
                      <ScheduleName>{t.name}</ScheduleName>
                      <TimetableMeta>
                        <CreditBadge>{getTimetableCredits(t.events)}학점</CreditBadge>
                        <RowIconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            openRenameModal(t);
                          }}
                          aria-label="이름 변경"
                        >
                          <Icon name="edit-pencil-01" size={16} />
                        </RowIconButton>
                        <RowIconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(t);
                          }}
                          aria-label="삭제"
                        >
                          <Icon name="trash-full" size={16} />
                        </RowIconButton>
                        <StarButton onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(t);
                        }}>
                          <StarIcon filled={t.isRepresentative} />
                        </StarButton>
                      </TimetableMeta>
                    </ScheduleRow>
                  ))}
                </ScheduleListWrapper>
              ) : (
                <EmptySemesterWrapper>
                  등록된 시간표가 없습니다.
                </EmptySemesterWrapper>
              )}
            </TimeTableListCard>
          );
        })}
      </ListContainer>

      <TimeTableCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialSemester={addModalSemester}
      />

      <Modal
        isOpen={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="시간표 이름 변경"
        primaryButton={{
          text: "변경",
          variant: "brand",
          onClick: handleRenameConfirm,
          disabled: !renameInputVal.trim() || updateNameMutation.isPending,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setRenameTarget(null),
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
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="시간표 삭제"
        description={`"${deleteTarget?.name ?? ""}" 시간표를 삭제하면\n복구할 수 없습니다. 삭제하시겠습니까?`}
        primaryButton={{
          text: "삭제",
          variant: "danger",
          onClick: handleDeleteConfirm,
          disabled: deleteMutation.isPending,
        }}
        secondaryButton={{
          text: "취소",
          onClick: () => setDeleteTarget(null),
        }}
      />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: calc(var(--header-height, 56px) + 20px) ${MOBILE_PAGE_GUTTER} calc(var(--nav-height, 0px) + 40px);
  box-sizing: border-box;
  background-color: var(--bg-subtle, #f8f9fb);
  min-height: 100vh;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

const TimeTableListCard = styled.div<{ $isClickable?: boolean }>`
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  ${({ $isClickable }) =>
    $isClickable &&
    `
    &:hover {
      border-color: var(--border-brand, #0061ff);
      box-shadow: 0 4px 16px rgba(0, 97, 255, 0.08);
      transform: translateY(-1px);
    }
  `}
`;

const SemesterHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 6px 16px;
  border-bottom: solid 1px var(--border-default);
  
`;

const SemesterTitle = styled.div`
  font-family: Pretendard;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
`;

const SemesterAddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  outline: none;
  color: var(--text-secondary, #333d4b);
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--bg-muted, #f1f3f5);
  }

  &:active {
    background-color: var(--bg-disabled, #e5e8eb);
  }
`;

const ScheduleListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 16px 8px 16px;
`;

const ScheduleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ScheduleName = styled.span`
  font-family: Pretendard;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: var(--text-secondary, #333d4b);
`;

const TimetableMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CreditBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-default, #e5e8eb);
  background: var(--bg-muted, #f1f3f5);
  color: var(--text-primary, #333d4b);
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
`;

const StarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
`;

const RowIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  color: var(--text-tertiary, #8b95a1);
`;

const EmptySemesterWrapper = styled.div`
  padding: 16px 16px 20px 16px;
  font-family: Pretendard;
  font-weight: 400;
  font-size: 14px;
  color: var(--text-secondary, #8b95a1);
  text-align: center;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  
  &:active {
    background-color: var(--bg-muted, #f1f3f5);
  }
`;

