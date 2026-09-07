import styled from "styled-components";

import Icon from "@/components/common/Icon";
import Ripple from "@/components/common/Ripple";
import type { FontelloIconName } from "@/components/common/fontelloIcons";

/**
 * 마이페이지 설정 목록의 카드(MenuGroup)와 행(MenuItem).
 *
 * 카드가 행을 잘라내고(overflow: clip), 구분선은 행 전체가 아니라 텍스트 영역의
 * `border-bottom`으로 그린다 — 아이콘 슬롯(56px)만큼 들여쓰인 구분선이 디자인의
 * 모양이다. 마지막 행의 선은 카드 테두리와 겹치므로 지운다.
 */

export interface MenuItemProps {
  title: string;
  /** Fontello 글리프. 글리프가 없는 브랜드 로고는 `image`를 쓴다. */
  icon?: FontelloIconName;
  /** 브랜드 로고 등 글리프로 대체할 수 없는 아이콘의 이미지 경로. */
  image?: string;
  /**
   * 이미지 아이콘을 검정 단색으로 렌더한다. 아이콘 슬롯은 단색 슬롯이라
   * 브랜드 색이 들어간 마크는 디자인상 검정으로 눕힌다. 원본이 투명 배경
   * 단색이라 brightness(0)이면 알파를 유지한 채 검정이 된다.
   */
  monochromeImage?: boolean;
  /** 제목 아래 보조 설명. */
  description?: string;
  /** 화살표 왼쪽에 붙는 현재 상태 요약. */
  info?: string;
  onClick?: () => void;
}

export function MenuItem({
  title,
  icon,
  image,
  monochromeImage,
  description,
  info,
  onClick,
}: MenuItemProps) {
  return (
    <ItemRow type="button" onClick={onClick}>
      <Ripple />
      <IconSlot>
        {image ? (
          <ItemImage src={image} alt="" $monochrome={monochromeImage} />
        ) : icon ? (
          <Icon name={icon} size={24} color="var(--text-brand, #0061ff)" />
        ) : null}
      </IconSlot>
      <ItemBody>
        <Labels>
          <ItemTitle>{title}</ItemTitle>
          {description && <ItemDescription>{description}</ItemDescription>}
        </Labels>
        <ItemInfo>
          {info && <InfoText>{info}</InfoText>}
          <Icon
            name="chevron-right"
            size={24}
            color="var(--text-tertiary, #8b95a1)"
          />
        </ItemInfo>
      </ItemBody>
    </ItemRow>
  );
}

export const MenuGroup = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--bg-base, #ffffff);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 20px;
  overflow: clip;
`;

const ItemBody = styled.div`
  flex: 1 0 0;
  min-width: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 0;
  box-sizing: border-box;
  border-bottom: 1px solid var(--border-default, #e5e8eb);
`;

const ItemRow = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;

  &.active-touch {
    background: var(--bg-muted, #f1f3f5);
  }

  /* 마지막 행의 구분선은 카드 아래 테두리와 겹친다. */
  &:last-child ${ItemBody} {
    border-bottom: none;
  }
`;

const IconSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  min-height: 56px;
  flex-shrink: 0;
  align-self: stretch;
`;

const ItemImage = styled.img<{ $monochrome?: boolean }>`
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
  ${({ $monochrome }) => ($monochrome ? "filter: brightness(0);" : "")}
`;

const Labels = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`;

const ItemTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-secondary, #333d4b);
  word-break: keep-all;
`;

const ItemDescription = styled.span`
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--text-tertiary, #8b95a1);
  white-space: pre-line;
  word-break: keep-all;
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
  flex-shrink: 0;
`;

const InfoText = styled.span`
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: var(--text-tertiary, #8b95a1);
  white-space: nowrap;
`;
