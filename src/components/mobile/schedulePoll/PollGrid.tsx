import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styled from "styled-components";
import { typography } from "@/styles/typography";
import {
  SLOT_MINUTES,
  isDateKey,
  parseDateKey,
  type PollGridShape,
} from "@/utils/schedulePoll";

/** 30분 칸 높이 (Figma TimeTable_Grid: 1시간 40px) */
export const POLL_ROW_HEIGHT = 20;
const TIME_LABEL_WIDTH = 20;
/** 이 너비보다 좁아지면 열을 줄이지 않고 가로 스크롤한다(일회성 최대 14일) */
const MIN_COLUMN_WIDTH = 44;

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

interface PollGridFrameProps {
  shape: PollGridShape;
  /** 열 하나의 내용(칸 + 겹쳐 그릴 블록). 열은 position: relative라 블록을 절대 배치할 수 있다 */
  renderColumn: (column: number) => ReactNode;
  /** 본문(열 영역)에 붙일 속성. 칠하기 포인터 핸들러를 여기에 건다 */
  bodyProps?: HTMLAttributes<HTMLDivElement>;
  className?: string;
}

/**
 * 시간 맞추기 그리드의 틀 (Figma TimeTable_Grid): 요일/날짜 헤더, 시간 눈금, 열.
 * 칸의 색과 상호작용은 쓰는 쪽(입력 그리드·히트맵)이 정한다.
 * ref는 열이 놓이는 본문 영역을 가리킨다(포인터 좌표 → 칸 계산용).
 */
const PollGridFrame = forwardRef<HTMLDivElement, PollGridFrameProps>(
  ({ shape, renderColumn, bodyProps, className }, ref) => {
    const rows = Array.from({ length: shape.rowCount }, (_unused, row) => {
      const minutes = shape.rangeStartMin + row * SLOT_MINUTES;
      return { hour: Math.floor(minutes / 60), onTheHour: minutes % 60 === 0 };
    });

    return (
      <Scroller className={className}>
        <Table $minWidth={TIME_LABEL_WIDTH + shape.columns.length * MIN_COLUMN_WIDTH}>
          <HeaderRow>
            <Corner />
            {shape.columns.map((column) => {
              const dated = isDateKey(column.key);
              const date = dated ? parseDateKey(column.key) : null;
              return (
                <HeaderCell key={column.key} $tall={dated}>
                  {date ? (
                    <>
                      <span>{WEEKDAY_LABELS[(date.getDay() + 6) % 7]}</span>
                      <DateLabel>
                        {date.getMonth() + 1}/{date.getDate()}
                      </DateLabel>
                    </>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </HeaderCell>
              );
            })}
          </HeaderRow>
          <Body>
            <TimeColumn aria-hidden>
              {rows.map((row, index) => (
                <TimeCell
                  key={index}
                  $hourEnd={!row.onTheHour || index === rows.length - 1}
                >
                  {row.onTheHour ? row.hour : ""}
                </TimeCell>
              ))}
            </TimeColumn>
            <Columns ref={ref} {...bodyProps}>
              {shape.columns.map((column, index) => (
                <Column key={column.key}>{renderColumn(index)}</Column>
              ))}
            </Columns>
          </Body>
        </Table>
      </Scroller>
    );
  },
);

PollGridFrame.displayName = "PollGridFrame";

export default PollGridFrame;

/** 열 안의 30분 칸. 배경색만 쓰는 쪽에서 정한다. */
export const PollGridCell = styled.div<{ $hourEnd?: boolean }>`
  height: ${POLL_ROW_HEIGHT}px;
  box-sizing: border-box;
  border-right: 1px solid var(--border-default);
  border-bottom: 1px solid
    ${({ $hourEnd }) => ($hourEnd ? "var(--border-default)" : "transparent")};
  background: var(--bg-base);
`;

const Scroller = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 20px;
  border: 1px solid var(--border-strong);
  background: var(--bg-muted);
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.div<{ $minWidth: number }>`
  min-width: ${({ $minWidth }) => $minWidth}px;
  display: flex;
  flex-direction: column;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: stretch;
`;

const Corner = styled.div`
  flex-shrink: 0;
  width: ${TIME_LABEL_WIDTH}px;
  box-sizing: border-box;
  background: var(--bg-base);
  border-right: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
`;

const HeaderCell = styled.div<{ $tall: boolean }>`
  flex: 1 0 0;
  min-width: 0;
  height: ${({ $tall }) => ($tall ? 36 : 20)}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
  border-right: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
  color: var(--text-tertiary);
  text-align: center;
  white-space: nowrap;
  ${typography.label3}

  &:last-child {
    border-right: none;
  }
`;

const DateLabel = styled.span`
  color: var(--text-secondary);
`;

const Body = styled.div`
  display: flex;
  align-items: flex-start;
`;

const TimeColumn = styled.div`
  flex-shrink: 0;
  width: ${TIME_LABEL_WIDTH}px;
`;

const TimeCell = styled.div<{ $hourEnd: boolean }>`
  height: ${POLL_ROW_HEIGHT}px;
  box-sizing: border-box;
  padding-top: 4px;
  background: var(--bg-base);
  border-right: 1px solid var(--border-default);
  border-bottom: 1px solid
    ${({ $hourEnd }) => ($hourEnd ? "var(--border-default)" : "transparent")};
  color: var(--text-tertiary);
  text-align: center;
  ${typography.caption1}
`;

const Columns = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
`;

const Column = styled.div`
  position: relative;
  flex: 1 0 0;
  min-width: 0;

  &:last-child > * {
    border-right-color: transparent;
  }
`;
