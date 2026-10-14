import { useMemo, useState } from "react";
import styled from "styled-components";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
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
  PollGridCell,
} from "@/components/mobile/schedulePoll/PollGrid";
import SendTargetSheet from "@/components/mobile/schedulePoll/SendTargetSheet";
import {
  PollBadge,
  PollBody,
  PollBottomBar,
  PollCard,
  PollNotice,
  PollPage,
  PollPrimaryButton,
} from "@/components/mobile/schedulePoll/PollUi";
import type { PollResult } from "@/types/schedulePolls";
import {
  SLOT_MINUTES,
  formatColumnName,
  formatColumnsSummary,
  formatDuration,
  formatShareResultMessage,
  getPollGridShape,
  minutesToTime,
  namesFromMask,
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

// 가능 인원 비율에 따른 칸 색 (Figma E. 결과의 4단계 범례). 전원 가능은 브랜드 채움색.
const HEAT_LEVELS = [
  "var(--blue-200)",
  "var(--blue-300)",
  "var(--blue-400)",
  "var(--interactive-primary)",
];

const heatColor = (count: number, total: number) => {
  if (count <= 0 || total <= 0) return "var(--bg-base)";
  if (count >= total) return HEAT_LEVELS[3];
  return HEAT_LEVELS[Math.min(2, Math.floor((count / total) * 3))];
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
      return (
        <Navigate replace to={ROUTES.SCHEDULE_POLL.STATUS(pollId)} />
      );
    }
    return (
      <PollPage>
        <PollNotice title={getPollErrorMessage(error, "결과를 불러오지 못했어요")}>
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
  const [selection, setSelection] = useState({ version: result.version, rank: 1 });
  const selectedRank = selection.version === result.version ? selection.rank : 1;
  const [focusedCell, setFocusedCell] = useState<{
    version: number;
    column: number;
    row: number;
  } | null>(null);
  const cell = focusedCell?.version === result.version ? focusedCell : null;
  const [isShareOpen, setIsShareOpen] = useState(false);

  const top = result.candidates[0];
  const selected =
    result.candidates.find((candidate) => candidate.rank === selectedRank) ?? top;

  const headline = !top
    ? "겹치는 시간이 아직 없어요"
    : top.allAvailable
      ? `${total}명 모두 되는 시간이에요`
      : `최대 ${top.availableCount}명이 되는 시간이에요`;

  const unavailableNames = (mask: number) =>
    result.participants
      .filter((participant) => !((mask >> participant.index) & 1))
      .map((participant) => participant.displayName);

  const cellMask = cell ? (result.heatmap[cell.column]?.[cell.row] ?? 0) : 0;
  const cellStart = cell ? shape.rangeStartMin + cell.row * SLOT_MINUTES : 0;

  return (
    <PollPage>
      <PollBody>
        <Heading>
          <Headline>{headline}</Headline>
          <SubHeadline>
            {formatColumnsSummary(result.columns)} ·{" "}
            {formatDuration(result.durationMode, result.durationMin)} 기준 ·{" "}
            {total}명 기준
            {(result.isFinal || isClosed) && " · 최종 결과"}
          </SubHeadline>
          {top && !top.allAvailable && (
            // 공통 시간이 없을 때는 누가 안 되는지 알려 줘야 조정할 수 있다(PRD 7장 빈 상태).
            <SubHeadline>
              {unavailableNames(top.availableMask).join(", ")}님은 이 시간에 어려워요
            </SubHeadline>
          )}
        </Heading>

        <GridSection>
          <PollGridFrame
            shape={shape}
            renderColumn={(column) =>
              Array.from({ length: shape.rowCount }, (_unused, row) => {
                const mask = result.heatmap[column]?.[row] ?? 0;
                const minutes = shape.rangeStartMin + (row + 1) * SLOT_MINUTES;
                const isFocused = cell?.column === column && cell.row === row;
                return (
                  <HeatCell
                    key={row}
                    as="button"
                    type="button"
                    aria-label={`${result.columns[column].label} ${minutesToTime(minutes - SLOT_MINUTES)} 가능 ${popcount(mask)}명`}
                    $hourEnd={minutes % 60 === 0 || row === shape.rowCount - 1}
                    $color={heatColor(popcount(mask), total)}
                    $focused={isFocused}
                    onClick={() =>
                      setFocusedCell(
                        isFocused
                          ? null
                          : { version: result.version, column, row },
                      )
                    }
                  />
                );
              })
            }
          />
          <Legend>
            <span>적음</span>
            {HEAT_LEVELS.map((color) => (
              <LegendSwatch key={color} $color={color} />
            ))}
            <span>{total}명 모두</span>
          </Legend>

          {/* 시안은 칸 옆 말풍선이지만 가로 스크롤 영역에서 잘려, 그리드 아래 고정 패널로 보여 준다 */}
          <CellPanel aria-live="polite">
            {cell ? (
              <>
                <CellPanelTitle>
                  {formatColumnName(
                    result.columns[cell.column],
                    result.columns[cell.column].key,
                  )}{" "}
                  {minutesToTime(cellStart)} ~{" "}
                  {minutesToTime(cellStart + SLOT_MINUTES)}
                </CellPanelTitle>
                <CellPanelNames>
                  {popcount(cellMask) > 0
                    ? `가능 ${popcount(cellMask)}명 · ${namesFromMask(cellMask, result.participants).join(", ")}`
                    : "가능한 사람이 없어요"}
                </CellPanelNames>
                {total - popcount(cellMask) > 0 && (
                  // 불가능한 사람은 이름 대신 인원 수로만 보여 준다(표시 규칙).
                  <CellPanelCaption>
                    불가능 {total - popcount(cellMask)}명
                  </CellPanelCaption>
                )}
              </>
            ) : (
              <CellPanelCaption>
                칸을 누르면 그 시간에 가능한 사람을 볼 수 있어요
              </CellPanelCaption>
            )}
          </CellPanel>
        </GridSection>

        <Section>
          <SectionTitle>추천 시간</SectionTitle>
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
                      <CandidateDay>
                        {formatColumnName(
                          result.columns.find((c) => c.key === candidate.key),
                          candidate.key,
                        )}
                      </CandidateDay>
                      <CandidateTime>
                        {candidate.start} ~ {candidate.end}
                      </CandidateTime>
                      <PollBadge
                        $tone={candidate.allAvailable ? "brand" : "neutral"}
                      >
                        {candidate.availableCount}/{total}명
                      </PollBadge>
                    </CandidateHead>
                    <NameChips>
                      {namesFromMask(
                        candidate.availableMask,
                        result.participants,
                      ).map((name) => (
                        <NameChip key={name} $available>
                          {name}
                        </NameChip>
                      ))}
                      {unavailableNames(candidate.availableMask).map((name) => (
                        <NameChip key={name} $available={false}>
                          {name}
                        </NameChip>
                      ))}
                    </NameChips>
                  </CandidateCard>
                );
              })}
            </CandidateList>
          )}
        </Section>
      </PollBody>

      <PollBottomBar>
        <PollPrimaryButton
          type="button"
          disabled={!selected || total < 2}
          onClick={() => setIsShareOpen(true)}
        >
          채팅방에 공유하기
        </PollPrimaryButton>
      </PollBottomBar>

      {selected && (
        <SendTargetSheet
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
          title="결과 공유"
          pollId={pollId}
          linkUrl={linkUrl}
          shareText={`[INTIP] ${title} — ${formatColumnName(
            result.columns.find((c) => c.key === selected.key),
            selected.key,
          )} ${selected.start}~${selected.end} (${total}명 기준)`}
          kind="RESULT"
          resultVersion={result.version}
          candidateRank={selected.rank}
          // 참여 요청 카드를 보낸 방을 미리 골라 둔다.
          preselectedRoomIds={getPollSharedRoomIds(pollId)}
          onSent={(response) => {
            showToast(formatShareResultMessage(response.results, "결과"));
            setIsShareOpen(false);
          }}
          onStale={() => {
            // 그사이 결과가 바뀌었다. 최신 결과를 받아 다시 고르게 한다.
            setIsShareOpen(false);
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

const HeatCell = styled(PollGridCell)<{ $color: string; $focused: boolean }>`
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  border-top: none;
  border-left: none;
  background: ${({ $color }) => $color};
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  ${({ $focused }) =>
    $focused &&
    `
      position: relative;
      z-index: 1;
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

const LegendSwatch = styled.span<{ $color: string }>`
  width: 22px;
  height: 10px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
`;

const CellPanel = styled(PollCard)`
  min-height: 56px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
`;

const CellPanelTitle = styled.span`
  color: var(--text-primary);
  ${typography.heading3}
`;

const CellPanelNames = styled.span`
  color: var(--text-secondary);
  ${typography.label2}
`;

const CellPanelCaption = styled.span`
  color: var(--text-tertiary);
  ${typography.caption1}
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
  padding: 12px;
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
  background: ${({ $selected }) =>
    $selected ? "var(--bg-brand)" : "var(--bg-base)"};
`;

const CandidateHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CandidateDay = styled.span`
  flex-shrink: 0;
  min-width: 52px;
  color: var(--text-primary);
  ${typography.heading3}
`;

const CandidateTime = styled.span`
  flex: 1 0 0;
  min-width: 0;
  color: var(--text-secondary);
  ${typography.label2}
`;

const NameChips = styled.div`
  padding-left: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const NameChip = styled.span<{ $available: boolean }>`
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid
    ${({ $available }) =>
      $available ? "var(--border-brand-subtle)" : "var(--border-default)"};
  background: var(--bg-base);
  color: ${({ $available }) =>
    $available ? "var(--text-brand)" : "var(--text-disabled)"};
  ${typography.caption1}
`;
