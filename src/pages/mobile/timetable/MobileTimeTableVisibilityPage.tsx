import { useState } from "react";
import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import { MOBILE_PAGE_GUTTER } from "@/styles/responsive";
import OptionCard from "@/components/mobile/common/OptionCard";
import CapsuleButton from "@/components/common/CapsuleButton";

type VisibilityType = "PUBLIC" | "FRIENDS" | "PRIVATE";

export default function MobileTimeTableVisibilityPage() {
  const [visibility, setVisibility] = useState<VisibilityType>("FRIENDS");

  useHeader({
    title: "시간표 공개 설정",
    hasback: true,
    immersive: true,
  });

  const handleSave = () => {
    alert(`공개 범위가 [${visibility}] 상태로 저장되었습니다.`);
  };

  return (
    <PageWrapper>
      <NoticeText>내 시간표를 누구에게 보여줄지 선택하세요.</NoticeText>

      <CardGroup>
        <OptionCard
          selected={visibility === "PUBLIC"}
          title="전체 공개"
          description="누구나 내 시간표를 볼 수 있어요."
          onClick={() => setVisibility("PUBLIC")}
        />
        <OptionCard
          selected={visibility === "FRIENDS"}
          title="친구에게 공개"
          description="내 친구들이 내 시간표를 볼 수 있어요."
          onClick={() => setVisibility("FRIENDS")}
        />
        <OptionCard
          selected={visibility === "PRIVATE"}
          title="비공개"
          description="나만 볼 수 있어요."
          onClick={() => setVisibility("PRIVATE")}
        />
      </CardGroup>

      <FixedFooter>
        <CapsuleButton
          variant="primary"
          fullWidth
          onClick={handleSave}
          style={{ boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.16)" }}
        >
          저장하기
        </CapsuleButton>
      </FixedFooter>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: calc(var(--header-height, 56px) + 20px) ${MOBILE_PAGE_GUTTER}
    calc(var(--nav-height, 0px) + 120px);
  box-sizing: border-box;
`;

const NoticeText = styled.h3`
  color: var(--text-primary);
  text-align: center;

  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;

  margin: 0;
  margin-bottom: 40px;
`;

const CardGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FixedFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px ${MOBILE_PAGE_GUTTER}
    calc(24px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(to top, var(--bg-base, white) 85%, transparent);
  z-index: 100;
  max-width: 768px;
  margin: 0 auto;
`;
