import styled from "styled-components";
import BusCardSection from "@/components/mobile/bus/goHomeSchool/BusCardSection.tsx";
import { useHeader } from "@/context/HeaderContext";
import busActiveIcon from "@/resources/assets/mobile-common/bus-blue.svg";
import {
  DESKTOP_MEDIA,
  MOBILE_PAGE_GUTTER,
} from "@/styles/responsive";

const BUS_PAGE_TABLET_MEDIA = "(min-width: 760px)";
const BUS_PAGE_DESKTOP_MAX_WIDTH = "1180px";

export default function MobileBusPage() {
  useHeader({
    title: "인입런",
    subHeader: null,
    hasback: false,
  });
  return (
    <MobileBusPageWrapper>
      <LeadSection>
        <LeadSurface>
          <LeadTopRow>
            <LeadTitle>
              학교 버스 정보를
              <br />한 곳에서 모아보세요.
            </LeadTitle>
            <LeadIconBubble>
              <img src={busActiveIcon} alt="" />
            </LeadIconBubble>
          </LeadTopRow>
        </LeadSurface>
      </LeadSection>

      <BusCardArea>
        <BusCardSection />
      </BusCardArea>
    </MobileBusPageWrapper>
  );
}

const MobileBusPageWrapper = styled.div`
  --bus-desktop-column-gap: 16px;
  --bus-feature-column: minmax(0, 1.04fr);
  --bus-stack-column: minmax(300px, 0.88fr);

  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 0 ${MOBILE_PAGE_GUTTER} 32px;
  box-sizing: border-box;

  @media ${BUS_PAGE_TABLET_MEDIA} {
    gap: 20px;
    width: min(100%, 980px);
    margin: 0 auto;
    padding-bottom: 36px;
  }

  @media ${DESKTOP_MEDIA} {
    display: grid;
    grid-template-columns: var(--bus-feature-column) var(--bus-stack-column);
    column-gap: var(--bus-desktop-column-gap);
    row-gap: 20px;
    align-items: start;
    width: min(100%, ${BUS_PAGE_DESKTOP_MAX_WIDTH});
    margin: 0 auto;
    padding: 12px 0 40px;
  }
`;

const LeadSection = styled.section`
  width: 100%;
  padding-top: 4px;

  @media ${DESKTOP_MEDIA} {
    grid-column: 1 / 2;
    min-width: 0;
  }
`;

const LeadSurface = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 20px 22px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), #f4f8ff);
  border: 1px solid rgba(14, 77, 157, 0.1);
  box-shadow:
    0 12px 28px rgba(15, 37, 71, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: -32px;
    right: -24px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(79, 156, 255, 0.18) 0%,
      rgba(79, 156, 255, 0) 72%
    );
    pointer-events: none;
  }

  @media ${BUS_PAGE_TABLET_MEDIA} {
    padding: 18px 20px 20px;
  }

  @media ${DESKTOP_MEDIA} {
    padding: 20px 24px 22px;
    border-radius: 24px;
  }
`;

const LeadTopRow = styled.div`
  display: flex;
  //align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const LeadIconBubble = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffffff, #ebf3ff);
  border: 1px solid rgba(14, 77, 157, 0.08);
  box-shadow: 0 8px 18px rgba(41, 79, 140, 0.08);

  img {
    width: 22px;
    height: 22px;
  }

  @media ${DESKTOP_MEDIA} {
    width: 44px;
    height: 44px;
  }
`;

const LeadTitle = styled.h1`
  margin: 0;
  font-size: 26px;
  line-height: 1.28;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #18335f;
  position: relative;
  z-index: 1;
  word-break: keep-all;

  @media ${BUS_PAGE_TABLET_MEDIA} {
    font-size: 28px;
  }

  @media ${DESKTOP_MEDIA} {
    font-size: 32px;
  }
`;

const BusCardArea = styled.section`
  width: 100%;

  @media ${DESKTOP_MEDIA} {
    grid-column: 1 / -1;
  }
`;
