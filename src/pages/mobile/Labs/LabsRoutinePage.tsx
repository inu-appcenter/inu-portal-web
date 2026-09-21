import styled from "styled-components";
import { useHeader } from "@/context/HeaderContext";
import MobileAgentReminderSetting from "@/components/mobile/dailyBrief/MobileAgentReminderSetting";

export default function LabsRoutinePage() {
  useHeader({ title: "캠퍼스 맞춤 루틴" });

  return (
    <PageWrapper>
      <MobileAgentReminderSetting />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px 40px 16px;
  background-color: transparent;
`;
