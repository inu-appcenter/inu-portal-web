import { useMemo, useState, type UIEvent } from "react";
import styled from "styled-components";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import BottomSheet from "@/components/common/BottomSheet";
import Modal from "@/components/common/Modal";
import Skeleton from "@/components/common/Skeleton";
import { useHeader } from "@/context/HeaderContext";
import { ROUTES } from "@/constants/routes";
import {
  POLL_INTERVAL,
  usePollDetail,
  usePollLatestResult,
  usePollRevision,
} from "@/hooks/useSchedulePoll";
import { usePollNoticeToasts } from "@/hooks/usePollNoticeToasts";
import { buildLoginRedirect, usePollLoggedIn } from "@/hooks/usePollAuth";
import { buttonReset } from "@/components/mobile/timetable/wizard/ui/tokens";
import PollGridFrame, {
  POLL_RESULT_BLOCK_OPACITY,
  PollBlock,
  PollGridCell,
} from "@/components/mobile/schedulePoll/PollGrid";
import {
  blockPosition,
  findRuns,
  stackedOpacity,
} from "@/components/mobile/schedulePoll/pollBlockLayout";
import SendTargetSheet from "@/components/mobile/schedulePoll/SendTargetSheet";
import {
  PollBadge,
  PollBody,
  PollBottomBar,
  PollCard,
  PollNotice,
  PollPage,
  PollPrimaryButton,
  PollSecondaryButton,
  PollCandidateLabel,
} from "@/components/mobile/schedulePoll/PollUi";
import type { PollColumn, PollResult } from "@/types/schedulePolls";
import {
  SLOT_MINUTES,
  formatColumnName,
  formatColumnsSummary,
  formatDuration,
  formatShareResultMessage,
  getPollGridShape,
  isDateKey,
  minutesToTime,
  parseDateKey,
  popcount,
  resolvePollLink,
  timeToMinutes,
} from "@/utils/schedulePoll";
import {
  getPollErrorCode,
  getPollErrorMessage,
} from "@/utils/schedulePollError";
import { getPollSharedRoomIds } from "@/utils/schedulePollStorage";
import { showToast } from "@/utils/toast";
import { typography } from "@/styles/typography";

/** 범례에 보여 줄 겹침 단계 수. 전원 가능은 따로 진한 블록으로 보여 준다 */
const LEGEND_STEPS = 3;

/** 한 화면에 꽉 차게 보이는 열 수와 옆 열이 살짝 보이는 폭 (PollGrid의 가로 스크롤 규칙과 같다) */
const VISIBLE_COLUMNS = 7;
const PEEK_COLUMNS = 0.5;
const TIME_LABEL_WIDTH = 24;

/** 보이는 열의 기간 문구. 일회성은 '11월 2일 – 6일', 정기는 '월·수·금' */
const formatVisibleRange = (columns: PollColumn[]) => {
  if (columns.length === 0) return "";
  if (!isDateKey(columns[0].key)) return formatColumnsSummary(columns);
  const first = parseDateKey(columns[0].key);
  const last = parseDateKey(columns[columns.length - 1].key);
  const head = `${first.getMonth() + 1}월 ${first.getDate()}일`;
  if (columns.length === 1) return head;
  return first.getMonth() === last.getMonth()
    ? `${head} – ${last.getDate()}일`
    : `${head} – ${last.getMonth() + 1}월 ${last.getDate()}일`;
};

/**
 * 결과 (Figma E. 결과). 히트맵과 추천 후보 3개를 보여 주고, 고른 후보를 채팅방에 공유한다.
 * 결과는 등록·수정마다 새 버전이 생기므로 리비전 폴링으로 최신 버전을 따라간다.
 */
export default function SchedulePollResultPage() {
  const { pollId: pollIdParam = "" } = useParams<{ pollId: string }>();
  const pollId = Number(pollIdParam);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = usePollLoggedIn();

  const pollQuery = usePollDetail(isLoggedIn ? pollId : null);
  const { data: revision } = usePollRevision(isLoggedIn ? pollId : null, {
    intervalMs: POLL_INTERVAL.STATUS,
  });
  const resultQuery = usePollLatestResult(pollId, { enabled: isLoggedIn });
  const poll = pollQuery.data;
  const result = resultQuery.data;

  usePollNoticeToasts(pollId, revision, { onResultPage: true });

  const headerRight = useMemo(
    () => (
      <HeaderButton
        type="button"
        onClick={() => navigate(ROUTES.SCHEDULE_POLL.STATUS(pollId))}
      >
        참여 현황
      </HeaderButton>
    ),
    [navigate, pollId],
  );
  useHeader({
    title: poll?.title ?? "시간 맞추기",
    hasback: true,
    rightArea: headerRight,
    rightAreaNotCircle: true,
  });

  if (!isLoggedIn) {
    return (
      <Navigate
        replace
        to={buildLoginRedirect(ROUTES.LOGIN, location.pathname)}
      />
    );
  }

  if (pollQuery.isLoading || resultQuery.isLoading) {
    return (
      <PollPage>
        <PollBody>
          <Skeleton variant="card" height={53} />
          <Skeleton variant="card" height={420} />
          <Skeleton variant="card" height={82} />
        </PollBody>
      </PollPage>
    );
  }

  if (!poll || !result) {
    const error = resultQuery.error ?? pollQuery.error;
    const code = getPollErrorCode(error);
    // 등록하지 않은 사람은 결과를 볼 수 없다. 입력 화면으로 유도한다.
    if (code === "NOT_PARTICIPANT") {
      return (
        <PollPage>
          <PollNotice
            title="일정을 등록하면 결과를 볼 수 있어요"
            description="가능한 시간을 알려 주면 바로 겹치는 시간을 보여 드려요"
          >
            <PollPrimaryButton
              type="button"
              onClick={() =>
                navigate(ROUTES.SCHEDULE_POLL.INPUT(pollId), { replace: true })
              }
            >
              내 일정 입력하기
            </PollPrimaryButton>
          </PollNotice>
        </PollPage>
      );
    }
    if (code === "RESULT_NOT_READY") {
      return <Navigate replace to={ROUTES.SCHEDULE_POLL.STATUS(pollId)} />;
    }
    return (
      <PollPage>
        <PollNotice
          title={getPollErrorMessage(error, "결과를 불러오지 못했어요")}
        >
          {code === null && (
            <PollPrimaryButton
              type="button"
              onClick={() => {
                void pollQuery.refetch();
                void resultQuery.refetch();
              }}
            >
              다시 시도
            </PollPrimaryButton>
          )}
        </PollNotice>
      </PollPage>
    );
  }

  return (
    <PollResultView
      pollId={pollId}
      title={poll.title}
      linkUrl={resolvePollLink(poll.linkUrl)}
      result={result}
      isClosed={(revision?.status ?? poll.status) === "CLOSED"}
      onStale={() => resultQuery.refetch()}
    />
  );
}

interface PollResultViewProps {
  pollId: number;
  title: string;
  linkUrl: string;
  result: PollResult;
  isClosed: boolean;
  onStale: () => void;
}

function PollResultView({
  pollId,
  title,
  linkUrl,
  result,
  isClosed,
  onStale,
}: PollResultViewProps) {
  const total = result.participants.length;
  const shape = useMemo(
    () =>
      getPollGridShape({
        columns: result.columns,
        rangeStart: result.rowStart,
        rangeEnd: minutesToTime(
          timeToMinutes(result.rowStart) + result.rowCount * SLOT_MINUTES,
        ),
      }),
    [result.columns, result.rowStart, result.rowCount],
  );

  // 선택은 결과 버전에 묶인다. 새 버전이 오면 후보가 달라지므로 1순위로 돌아간다.
  const [selection, setSelection] = useState({
    version: result.version,
    rank: 1,
  });
  const selectedRank =
    selection.version === result.version ? selection.rank : 1;
  const [focusedCell, setFocusedCell] = useState<{
    version: number;
    column: number;
    row: number;
  } | null>(null);
  const cell = focusedCell?.version === result.version ? focusedCell : null;
  // 닫히는 동안에도 내용이 남도록 선택한 칸(cell)과 시트 열림 상태를 따로 둔다.
  const [isSlotSheetOpen, setIsSlotSheetOpen] = useState(false);
  // 가로 스크롤 위치 (보이는 열 계산용). 스크롤 전에는 첫 화면 기준.
  const [scrollView, setScrollView] = useState<{
    left: number;
    width: number;
  } | null>(null);
  // 선택한 시간 공유 / 이 시간으로 정하기. 둘 다 같은 결과 공유 API로 채팅방에 보낸다.
  const [shareMode, setShareMode] = useState<"RECOMMEND" | "DECIDE" | null>(
    null,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const top = result.candidates[0];
  const selected =
    result.candidates.find((candidate) => candidate.rank === selectedRank) ??
    top;

  const headline = !top
    ? "겹치는 시간이 아직 없어요"
    : top.allAvailable
      ? `${total}명 모두 되는 시간이에요`
      : `최대 ${top.availableCount}명이 되는 시간이에요`;

  const selectedLabel = selected
    ? formatColumnName(
        result.columns.find((c) => c.key === selected.key),
        selected.key,
      )
    : "";

  const unavailableNames = (mask: number) =>
    result.participants
      .filter((participant) => !((mask >> participant.index) & 1))
      .map((participant) => participant.displayName);

  // 고른 추천 시간을 그리드에도 테두리로 표시한다.
  const selectedColumn = selected
    ? result.columns.findIndex((c) => c.key === selected.key)
    : -1;
  const selectedRange =
    selected && selectedColumn >= 0
      ? {
          column: selectedColumn,
          start:
            (timeToMinutes(selected.start) - shape.rangeStartMin) /
            SLOT_MINUTES,
          end:
            (timeToMinutes(selected.end) - shape.rangeStartMin) / SLOT_MINUTES,
        }
      : null;

  const cellMask = cell ? (result.heatmap[cell.column]?.[cell.row] ?? 0) : 0;
  const cellColumn = cell ? result.columns[cell.column] : undefined;
  const cellStartMin = cell ? shape.rangeStartMin + cell.row * SLOT_MINUTES : 0;
  // 누른 칸이 추천 후보 안에 있으면 그 후보를 공유·확정 대상으로 쓴다.
  const cellCandidate =
    cell && cellColumn
      ? result.candidates.find(
          (candidate) =>
            candidate.key === cellColumn.key &&
            timeToMinutes(candidate.start) <= cellStartMin &&
            cellStartMin < timeToMinutes(candidate.end),
        )
      : undefined;
  const cellTimeRange = cellCandidate
    ? `${cellCandidate.start} – ${cellCandidate.end}`
    : `${minutesToTime(cellStartMin)} – ${minutesToTime(cellStartMin + SLOT_MINUTES)}`;
  const cellAvailable = result.participants.filter(
    (participant) => ((cellMask >> participant.index) & 1) === 1,
  );
  const cellUnavailable = result.participants.filter(
    (participant) => ((cellMask >> participant.index) & 1) === 0,
  );
  const canShareCell = Boolean(cellCandidate) && total >= 2;

  // 보이는 열 범위. 열 폭은 PollGrid의 계산(열 영역 ÷ (7 + 반 칸))을 따른다.
  const columnCount = result.columns.length;
  let firstVisible = 0;
  let lastVisible = Math.min(columnCount, VISIBLE_COLUMNS) - 1;
  if (columnCount > VISIBLE_COLUMNS && scrollView) {
    const columnWidth =
      (scrollView.width - TIME_LABEL_WIDTH) / (VISIBLE_COLUMNS + PEEK_COLUMNS);
    firstVisible = Math.min(
      columnCount - 1,
      Math.max(0, Math.round(scrollView.left / columnWidth)),
    );
    lastVisible = Math.min(columnCount - 1, firstVisible + VISIBLE_COLUMNS - 1);
  }
  const visibleColumns = result.columns.slice(firstVisible, lastVisible + 1);
  // 주 번호: 날짜 열에서 요일이 앞서는 곳이 새 주의 시작이다.
  const weekIndexOf = (index: number) => {
    let week = 0;
    for (let i = 1; i <= index; i += 1) {
      const prev = result.columns[i - 1].key;
      const key = result.columns[i].key;
      if (
        isDateKey(key) &&
        isDateKey(prev) &&
        (parseDateKey(key).getDay() + 6) % 7 <=
          (parseDateKey(prev).getDay() + 6) % 7
      ) {
        week += 1;
      }
    }
    return week;
  };
  const weekCount = columnCount > 0 ? weekIndexOf(columnCount - 1) + 1 : 1;
  const currentWeek = weekIndexOf(firstVisible) + 1;

  return (
    <PollPage>
      <PollBody>
        <Heading>
          <Headline>{headline}</Headline>
          <SubHeadline>
            {formatColumnsSummary(result.columns)} ·{" "}
            {formatDuration(result.durationMode, result.durationMin)} · {total}
            명 제출
            {(result.isFinal || isClosed) && " · 최종 결과"}
          </SubHeadline>
          {top && !top.allAvailable && (
            // 공통 시간이 없을 때는 누가 안 되는지 알려 줘야 조정할 수 있다(PRD 7장 빈 상태).
            <SubHeadline>
              {unavailableNames(top.availableMask).join(", ")}님은 이 시간에
              어려워요
            </SubHeadline>
          )}
        </Heading>

        <Section>
          <SectionTitle>
            추천 시간 <SectionHint>눌러서 하나를 골라요</SectionHint>
          </SectionTitle>
          {result.candidates.length === 0 ? (
            <EmptyCandidates>
              {formatDuration(result.durationMode, result.durationMin)} 연속으로
              겹치는 시간이 없어요. 일정을 조금 넓혀 다시 등록해 보세요.
            </EmptyCandidates>
          ) : (
            <CandidateList role="radiogroup" aria-label="추천 시간">
              {result.candidates.map((candidate) => {
                const isSelected = candidate.rank === selected?.rank;
                return (
                  <CandidateCard
                    key={candidate.rank}
                    as="button"
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    $selected={isSelected}
                    onClick={() =>
                      setSelection({
                        version: result.version,
                        rank: candidate.rank,
                      })
                    }
                  >
                    <CandidateHead>
                      <PollCandidateLabel candidate={candidate} columns={result.columns} />
                      <PollBadge
                        $tone={candidate.allAvailable ? "brand" : "neutral"}
                      >
                        {candidate.availableCount}/{total}명
                      </PollBadge>
                    </CandidateHead>
                    {/* 안 되는 사람도 회색 칩으로 남겨 누가 빠지는지 바로 보이게 한다 */}
                    <NameChips>
                      {result.participants.map((participant) => (
                        <NameChip
                          key={participant.index}
                          $off={
                            ((candidate.availableMask >> participant.index) &
                              1) ===
                            0
                          }
                        >
                          {participant.displayName}
                        </NameChip>
                      ))}
                    </NameChips>
                  </CandidateCard>
                );
              })}
            </CandidateList>
          )}
        </Section>

        <GridSection>
          <RangeRow>
            <RangeTitle>{formatVisibleRange(visibleColumns)}</RangeTitle>
            {weekCount > 1 && (
              <WeekIndicator aria-label={`${weekCount}주 중 ${currentWeek}주`}>
                {currentWeek} / {weekCount}주
              </WeekIndicator>
            )}
          </RangeRow>
          <div
            onScrollCapture={(event: UIEvent<HTMLDivElement>) => {
              const target = event.target as HTMLElement;
              // 그리드 가로 스크롤 영역의 스크롤만 본다
              if (target === event.currentTarget) return;
              setScrollView({
                left: target.scrollLeft,
                width: target.clientWidth,
              });
            }}
          >
            <PollGridFrame
              shape={shape}
              renderColumn={(column) => {
                const masks = result.heatmap[column] ?? [];
                const maskAt = (row: number) => masks[row] ?? 0;
                return (
                  <>
                    {Array.from({ length: shape.rowCount }, (_unused, row) => {
                      const mask = maskAt(row);
                      const minutes =
                        shape.rangeStartMin + (row + 1) * SLOT_MINUTES;
                      const isFocused =
                        isSlotSheetOpen &&
                        cell?.column === column &&
                        cell.row === row;
                      return (
                        <HeatCell
                          key={row}
                          as="button"
                          type="button"
                          aria-label={`${result.columns[column].label} ${minutesToTime(minutes - SLOT_MINUTES)} 가능 ${popcount(mask)}명`}
                          $hourEnd={
                            minutes % 60 === 0 || row === shape.rowCount - 1
                          }
                          $focused={isFocused}
                          onClick={() => {
                            setFocusedCell({
                              version: result.version,
                              column,
                              row,
                            });
                            setIsSlotSheetOpen(true);
                          }}
                        />
                      );
                    })}
                    {/* 참여자마다 입력 화면과 같은 블록을 그려 겹친다. 많이 겹칠수록 진해진다 */}
                    {result.participants.flatMap((participant) =>
                      findRuns(
                        shape.rowCount,
                        (row) => ((maskAt(row) >> participant.index) & 1) === 1,
                      ).map((run) => (
                        <PollBlock
                          key={`p${participant.index}-${run.start}`}
                          style={{
                            ...blockPosition(run.start, run.end),
                            opacity: POLL_RESULT_BLOCK_OPACITY,
                          }}
                        />
                      )),
                    )}
                    {total > 0 &&
                      findRuns(
                        shape.rowCount,
                        (row) => popcount(maskAt(row)) >= total,
                      ).map((run) => (
                        <AllBlock
                          key={`all-${run.start}`}
                          style={blockPosition(run.start, run.end)}
                        >
                          {total}명
                        </AllBlock>
                      ))}
                    {selectedRange?.column === column && (
                      // 고른 추천 시간이 속한 블록(같은 사람들이 되는 연속 구간) 전체를 감싼다
                      <SelectedFrame
                        key={`sel-${selectedRange.start}`}
                        style={(() => {
                          const base = maskAt(selectedRange.start);
                          const run = findRuns(
                            shape.rowCount,
                            (row) =>
                              base !== 0 && (maskAt(row) & base) === base,
                          ).find(
                            (r) =>
                              r.start <= selectedRange.start &&
                              r.end >= selectedRange.end,
                          );
                          return run
                            ? blockPosition(run.start, run.end)
                            : blockPosition(
                                selectedRange.start,
                                selectedRange.end,
                              );
                        })()}
                      />
                    )}
                  </>
                );
              }}
            />
          </div>
          <Legend>
            <span>1명</span>
            {Array.from(
              { length: Math.min(LEGEND_STEPS, Math.max(total - 1, 1)) },
              (_unused, step) => (
                <LegendSwatch
                  key={step}
                  style={{ opacity: stackedOpacity(step + 1) }}
                />
              ),
            )}
            <LegendSwatch $all />
            <span>{total}명 모두</span>
          </Legend>
        </GridSection>
      </PollBody>

      <PollBottomBar>
        <PollSecondaryButton
          type="button"
          disabled={!selected || total < 2}
          onClick={() => setShareMode("RECOMMEND")}
        >
          선택한 시간 공유
        </PollSecondaryButton>
        <PollPrimaryButton
          type="button"
          disabled={!selected || total < 2}
          onClick={() => setIsConfirmOpen(true)}
        >
          이 시간으로 정하기
        </PollPrimaryButton>
      </PollBottomBar>

      <Modal
        isOpen={isConfirmOpen && Boolean(selected)}
        onClose={() => setIsConfirmOpen(false)}
        title="이 시간으로 정할까요?"
        description={
          selected ? (
            <>
              {selectedLabel} {selected.start} ~ {selected.end}
              <br />
              정하면 채팅방에 알려요
            </>
          ) : undefined
        }
        secondaryButton={{
          text: "취소",
          onClick: () => setIsConfirmOpen(false),
        }}
        primaryButton={{
          text: "정하기",
          onClick: () => {
            setIsConfirmOpen(false);
            setShareMode("DECIDE");
          },
        }}
      />

      <BottomSheet
        open={isSlotSheetOpen && cell !== null}
        onOpenChange={setIsSlotSheetOpen}
      >
        <SlotSheet>
          <SlotTitleRow>
            <SlotTitle>
              {formatColumnName(cellColumn, cellColumn?.key ?? "")}{" "}
              {cellTimeRange}
            </SlotTitle>
            <SlotBadge>
              {cellAvailable.length}/{total}명
            </SlotBadge>
          </SlotTitleRow>
          <SlotGroup>
            <SlotGroupTitle>되는 사람 {cellAvailable.length}명</SlotGroupTitle>
            {cellAvailable.length > 0 ? (
              <SlotChips>
                {cellAvailable.map((participant) => (
                  <SlotChip key={participant.index}>
                    {participant.displayName}
                  </SlotChip>
                ))}
              </SlotChips>
            ) : (
              <SlotEmpty>가능한 사람이 없어요</SlotEmpty>
            )}
          </SlotGroup>
          {cellUnavailable.length > 0 && (
            <SlotGroup>
              <SlotGroupTitle $muted>
                안 되는 사람 {cellUnavailable.length}명
              </SlotGroupTitle>
              <SlotChips>
                {cellUnavailable.map((participant) => (
                  <SlotChip key={participant.index} $off>
                    {participant.displayName}
                  </SlotChip>
                ))}
              </SlotChips>
            </SlotGroup>
          )}
          {/* 추천 후보에 속한 칸만 공유·확정할 수 있다(공유 API가 후보 순위 기준) */}
          {canShareCell && (
            <SlotCta>
              <PollSecondaryButton
                type="button"
                onClick={() => {
                  if (!cellCandidate) return;
                  setSelection({
                    version: result.version,
                    rank: cellCandidate.rank,
                  });
                  setIsSlotSheetOpen(false);
                  setShareMode("RECOMMEND");
                }}
              >
                선택한 시간 공유
              </PollSecondaryButton>
              <PollPrimaryButton
                type="button"
                onClick={() => {
                  if (!cellCandidate) return;
                  setSelection({
                    version: result.version,
                    rank: cellCandidate.rank,
                  });
                  setIsSlotSheetOpen(false);
                  setIsConfirmOpen(true);
                }}
              >
                이 시간으로 정하기
              </PollPrimaryButton>
            </SlotCta>
          )}
        </SlotSheet>
      </BottomSheet>

      {selected && (
        <SendTargetSheet
          open={shareMode !== null}
          onOpenChange={(open) => {
            if (!open) setShareMode(null);
          }}
          title={shareMode === "DECIDE" ? "정한 시간 알리기" : "추천 시간 공유"}
          pollId={pollId}
          linkUrl={linkUrl}
          shareText={
            shareMode === "DECIDE"
              ? `[INTIP] ${title} — ${selectedLabel} ${selected.start}~${selected.end}로 정했어요`
              : `[INTIP] ${title} — 추천 시간 ${selectedLabel} ${selected.start}~${selected.end} (${total}명 기준)`
          }
          kind="RESULT"
          resultVersion={result.version}
          candidateRank={selected.rank}
          // 참여 요청 카드를 보낸 방을 미리 골라 둔다.
          preselectedRoomIds={getPollSharedRoomIds(pollId)}
          onSent={(response) => {
            showToast(formatShareResultMessage(response.results, "결과"));
            setShareMode(null);
          }}
          onStale={() => {
            // 그사이 결과가 바뀌었다. 최신 결과를 받아 다시 고르게 한다.
            setShareMode(null);
            onStale();
          }}
        />
      )}
    </PollPage>
  );
}

const HeaderButton = styled.button`
  ${buttonReset}
  padding: 8px 12px;
  color: var(--text-brand);
  white-space: nowrap;
  ${typography.label1}
`;

const Heading = styled.div`
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Headline = styled.h2`
  margin: 0;
  color: var(--text-primary);
  ${typography.title2}
`;

const SubHeadline = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const GridSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeatCell = styled(PollGridCell)<{ $focused: boolean }>`
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  border-top: none;
  border-left: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  ${({ $focused }) =>
    $focused &&
    `
      position: relative;
      z-index: 1;
      /* 블록 위로 올라오므로 배경을 비워 아래 겹침 색이 그대로 보이게 한다 */
      background: transparent;
      outline: 2px solid var(--text-primary);
      outline-offset: -2px;
    `}
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

// 블록과 같은 방식(불투명 채움 + 레이어 opacity)으로 칠해 겹침 농도와 똑같이 보인다.
const LegendSwatch = styled.span<{ $all?: boolean }>`
  width: 22px;
  height: 10px;
  box-sizing: border-box;
  border-radius: 3px;
  background: var(--interactive-primary);
  ${({ $all }) => $all && "border: 1.5px solid var(--border-brand);"}
`;

/** 전원 가능 구간. 겹친 블록 위에 불투명하게 덮어 가장 먼저 눈에 띄게 한다 */
const AllBlock = styled.div`
  position: absolute;
  left: 2px;
  right: 2px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  border: 1.5px solid var(--border-brand);
  background: var(--interactive-primary);
  color: var(--text-inverse);
  pointer-events: none;
  ${typography.caption1}
`;

/** 고른 추천 시간 테두리 */
/* 파란 블록 위에서도 보이도록 흰 간격 + 파란 링을 두르고, 고를 때 한 번 퍼지는 링으로 위치를 알린다
   (시간표 강의 담기 미리보기의 pulse와 같은 방식) */
const SelectedFrame = styled.div`
  position: absolute;
  z-index: 2;
  left: 1px;
  right: 1px;
  box-sizing: border-box;
  border-radius: 7px;
  border: 2px solid var(--bg-base);
  box-shadow: 0 0 0 2px var(--border-brand);
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 9px;
    animation: selectedPulse 1.2s ease-out 2;
  }

  @keyframes selectedPulse {
    0% {
      box-shadow: 0 0 0 0 var(--border-brand);
      opacity: 0.6;
    }
    100% {
      box-shadow: 0 0 0 10px var(--border-brand);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

const RangeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
`;

const RangeTitle = styled.h3`
  margin: 0;
  flex: 1 0 0;
  min-width: 0;
  color: var(--text-primary);
  ${typography.title3}
`;

const WeekIndicator = styled.span`
  flex-shrink: 0;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const SlotSheet = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 0 34px;
`;

const SlotTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SlotTitle = styled.h2`
  margin: 0;
  flex: 1 0 0;
  min-width: 0;
  color: var(--text-primary);
  ${typography.title3}
`;

const SlotBadge = styled.span`
  flex-shrink: 0;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: var(--bg-brand);
  color: var(--text-brand);
  ${typography.label3}
`;

const SlotGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SlotGroupTitle = styled.p<{ $muted?: boolean }>`
  margin: 0;
  color: ${({ $muted }) =>
    $muted ? "var(--text-disabled)" : "var(--text-primary)"};
  ${typography.heading3}
`;

const SlotChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SlotChip = styled.span<{ $off?: boolean }>`
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid
    ${({ $off }) => ($off ? "transparent" : "var(--border-default)")};
  background: ${({ $off }) => ($off ? "var(--bg-disabled)" : "var(--bg-base)")};
  color: ${({ $off }) =>
    $off ? "var(--text-disabled)" : "var(--text-secondary)"};
  ${typography.label3}
`;

const SlotEmpty = styled.p`
  margin: 0;
  color: var(--text-tertiary);
  ${typography.caption1}
`;

const SlotCta = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px 0;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  padding: 0 8px;
  color: var(--text-primary);
  ${typography.heading2}
`;

const EmptyCandidates = styled.p`
  margin: 0;
  padding: 0 8px;
  color: var(--text-tertiary);
  ${typography.body2}
`;

const CandidateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CandidateCard = styled(PollCard)<{ $selected: boolean }>`
  ${buttonReset}
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  border: ${({ $selected }) =>
    $selected
      ? "2px solid var(--border-brand)"
      : "1px solid var(--border-default)"};
  /* 테두리 두께가 바뀌어도 내용이 밀리지 않게 한다 */
  margin: ${({ $selected }) => ($selected ? "-1px" : "0")};
  background: var(--bg-base);
`;

const CandidateHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;


const NameChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const NameChip = styled.span<{ $off: boolean }>`
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid
    ${({ $off }) => ($off ? "var(--bg-disabled)" : "var(--border-default)")};
  background: ${({ $off }) => ($off ? "var(--bg-disabled)" : "var(--bg-base)")};
  color: ${({ $off }) =>
    $off ? "var(--text-disabled)" : "var(--text-secondary)"};
  ${typography.label3}
`;

const SectionHint = styled.span`
  margin-left: 4px;
  color: var(--text-tertiary);
  ${typography.caption1}
`;
