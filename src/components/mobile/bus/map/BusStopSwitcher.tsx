import styled from "styled-components";

export interface BusStopSwitcherOption {
  id: string;
  label: string;
}

interface BusStopSwitcherProps {
  className?: string;
  options: BusStopSwitcherOption[];
  selectedStopId: string | null;
  onSelectStop?: (stopId: string) => void;
  preventDrawerDrag?: boolean;
}

export function shouldShowBusStopSwitcher(
  options: BusStopSwitcherOption[],
  onSelectStop?: (stopId: string) => void,
) {
  return (
    Boolean(onSelectStop) &&
    (options.length > 1 ||
      (options.length === 1 && options[0]?.label.includes("출구")))
  );
}

export default function BusStopSwitcher({
  className,
  options,
  selectedStopId,
  onSelectStop,
  preventDrawerDrag = false,
}: BusStopSwitcherProps) {
  if (!shouldShowBusStopSwitcher(options, onSelectStop)) {
    return null;
  }

  const nonDragProps = preventDrawerDrag ? { "data-vaul-no-drag": "" } : {};

  return (
    <StopSwitcherRail className={className} {...nonDragProps}>
      {options.map((stop) => {
        const isSelected = stop.id === selectedStopId;

        return (
          <StopSwitcherButton
            key={stop.id}
            type="button"
            $selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => onSelectStop?.(stop.id)}
            {...nonDragProps}
          >
            {stop.label}
          </StopSwitcherButton>
        );
      })}
    </StopSwitcherRail>
  );
}

const StopSwitcherRail = styled.div`
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 24px rgba(22, 40, 74, 0.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow-x: auto;
  pointer-events: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StopSwitcherButton = styled.button<{ $selected: boolean }>`
  border: 0;
  flex-shrink: 0;
  min-width: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#35506d")};
  background: ${({ $selected }) =>
    $selected ? "#1f5fbc" : "rgba(240, 245, 252, 0.92)"};
  box-shadow: ${({ $selected }) =>
    $selected ? "0 8px 16px rgba(31, 95, 188, 0.24)" : "none"};
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:active {
    transform: scale(0.98);
  }
`;
