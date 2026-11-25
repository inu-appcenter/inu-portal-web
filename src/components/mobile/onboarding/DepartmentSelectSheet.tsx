import { useMemo, useState } from "react";
import styled from "styled-components";
import BottomSheet from "@/components/common/BottomSheet";
import Icon from "@/components/common/Icon";
import { typography } from "@/styles/typography";

export interface DepartmentOption {
  code: string;
  name: string;
}

interface DepartmentSelectSheetProps {
  open: boolean;
  departments: DepartmentOption[];
  selectedCode: string;
  onSelect: (department: DepartmentOption) => void;
  onClose: () => void;
}

const normalize = (value: string) => value.replace(/[\s·\-()]/g, "").toLowerCase();

/**
 * 학과 선택 바텀시트 (Figma 6271:18679, 검색 결과 없음 7971:6659).
 * 목록은 단과대 구분 없이 한 줄로 늘어놓고 이름으로 거른다.
 */
export default function DepartmentSelectSheet({
  open,
  departments,
  selectedCode,
  onSelect,
  onClose,
}: DepartmentSelectSheetProps) {
  const [query, setQuery] = useState("");
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setQuery("");
  }

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return departments;
    return departments.filter((d) => normalize(d.name).includes(q));
  }, [departments, query]);

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      handle="compact"
      height="85%"
    >
      <Content>
        <Pad>
          <SheetTitle>학과 선택</SheetTitle>
          <SearchBar>
            <SearchIcon aria-hidden>
              <Icon name="search" size={20} />
            </SearchIcon>
            <SearchInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="학과 이름으로 검색"
              aria-label="학과 이름으로 검색"
            />
          </SearchBar>
        </Pad>

        <List>
          {filtered.length === 0 ? (
            <Empty>
              <EmptyTitle>'{query.trim()}'에 맞는 학과가 없어요</EmptyTitle>
              <EmptyText>학과 이름을 줄이거나 띄어쓰기 없이 검색해보세요.</EmptyText>
            </Empty>
          ) : (
            filtered.map((d) => {
              const selected = d.code === selectedCode;
              return (
                <Item
                  key={d.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  $selected={selected}
                  onClick={() => onSelect(d)}
                >
                  <ItemName>{d.name}</ItemName>
                  {selected && <Icon name="check" size={20} />}
                </Item>
              );
            })
          )}
        </List>
      </Content>
    </BottomSheet>
  );
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  /* 공용 시트의 좌우 20px을 지우고 시안의 24px을 직접 둔다 */
  margin: 0 -20px;
`;

const Pad = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px;
`;

const SheetTitle = styled.h2`
  margin: 0;
  ${typography.title3}
  color: var(--text-primary);
`;

const SearchBar = styled.label`
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px 0 4px;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  background: var(--bg-base);
  box-sizing: border-box;

  &:focus-within {
    border-color: var(--border-brand);
  }
`;

const SearchIcon = styled.span`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
`;

const SearchInput = styled.input`
  flex: 1 0 0;
  min-width: 0;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  ${typography.body2}
  color: var(--text-primary);

  &::placeholder {
    color: var(--text-tertiary);
  }
  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
`;

const List = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 34px;
`;

const Item = styled.button<{ $selected: boolean }>`
  width: 100%;
  height: 52px;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: ${({ $selected }) => ($selected ? "var(--text-brand)" : "var(--text-primary)")};
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: var(--bg-subtle);
  }

  i {
    color: var(--text-primary);
  }
`;

const ItemName = styled.span`
  flex: 1 0 0;
  min-width: 0;
  ${typography.label1}
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 48px 24px;
  text-align: center;
`;

const EmptyTitle = styled.p`
  margin: 0;
  ${typography.title3}
  color: var(--text-primary);
  word-break: keep-all;
`;

const EmptyText = styled.p`
  margin: 0;
  ${typography.body2}
  color: var(--text-tertiary);
  word-break: keep-all;
`;
