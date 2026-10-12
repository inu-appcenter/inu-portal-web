import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import MobileAgentReminderSetting from "@/components/mobile/dailyBrief/MobileAgentReminderSetting";
import { MOBILE_PAGE_GUTTER, DESKTOP_MEDIA } from "@/styles/responsive";

export default function LabsRoutinePage() {
  useHeader({ title: "캠퍼스 맞춤 루틴" });

  return (
    <PageWrapper as="main">
      <MobileAgentReminderSetting />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${MOBILE_PAGE_GUTTER} calc(24px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  background-color: transparent;

  @media ${DESKTOP_MEDIA} {
    max-width: 1200px;
    padding: 0 0 calc(32px + var(--native-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)));
  }
`;
