import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import BottomSheet from "@/components/common/BottomSheet";
import { FEATURE_TOUR_ITEMS, type FeatureTourItem } from "@/constants/featureTour";
import { usePromotion } from "@/hooks/usePromotion";
import { PROMOTIONS } from "@/utils/promotion/registry";

interface FeatureTourSheetProps {
  /** 지금 이 안내를 띄워도 되는 상황인지(로그인 여부, 홈 화면 여부 등) */
  enabled?: boolean;
}

/**
 * 최초 진입 시 한 번 뜨는 신규 기능 안내.
 *
 * 기능을 순서대로 설명하는 튜토리얼이 아니라 "하나 골라서 바로 써보기"다.
 * 캐러셀로 넘기게 하면 스킵률만 올라가고 기억에는 남지 않아서, 한 화면에
 * 모두 보여주고 고르지 않으면 그냥 닫히게 했다.
 */
export default function FeatureTourSheet({
  enabled = true,
}: FeatureTourSheetProps) {
  const navigate = useNavigate();
  const { isVisible, dismiss, accept } = usePromotion(PROMOTIONS.FEATURE_TOUR, {
    enabled,
  });

  const handleSelect = (item: FeatureTourItem) => {
    accept(item.title);
    navigate(item.route);
  };

  return (
    <BottomSheet
      open={isVisible}
      onOpenChange={(open) => {
        if (!open) {
          dismiss();
        }
      }}
    >
      <Content>
        <Heading>
          <Title>지금 뭐부터 해볼까요?</Title>
          <Subtitle>새로 들어온 기능이에요. 하나만 골라보세요.</Subtitle>
        </Heading>

        <ItemList>
          {FEATURE_TOUR_ITEMS.map((item) => (
            <ItemCard
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
            >
              <IconBadge>
                <item.icon size={20} aria-hidden />
              </IconBadge>
              <ItemText>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemText>
            </ItemCard>
          ))}
        </ItemList>

        <Footer>
          <LaterButton type="button" onClick={dismiss}>
            나중에 볼게요
          </LaterButton>
          <FooterHint>실험실에서 언제든 다시 볼 수 있어요</FooterHint>
        </Footer>
      </Content>
    </BottomSheet>
  );
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 20px 8px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--text-tertiary, #8b95a1);
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemCard = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 16px;
  background: var(--bg-base, #ffffff);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;

  &:active {
    background: var(--bg-muted, #f1f3f5);
  }
`;

const IconBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--bg-brand, #eff6ff);
  color: var(--text-brand, #0061ff);
`;

const ItemText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ItemTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #191f28);
`;

const ItemDescription = styled.span`
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-tertiary, #8b95a1);
  word-break: keep-all;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const LaterButton = styled.button`
  padding: 10px 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-tertiary, #8b95a1);
  cursor: pointer;
`;

const FooterHint = styled.span`
  font-size: 12px;
  color: var(--text-disabled, #b0b8c1);
`;
