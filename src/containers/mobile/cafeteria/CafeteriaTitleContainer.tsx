import CafeteriaDate from "@/components/mobile/cafeteria/CafeteriaDate";
import styled from "styled-components";
import { DESKTOP_MEDIA, MOBILE_PAGE_GUTTER } from "@/styles/responsive";

// import eatingRice from "@/resources/assets/cafeteria/eatingRice.png";

interface weekDatesProps {
  dayName: string;
  date: string;
}

interface CafeteriaTitleContainerProps {
  title: string;
  nowday: number;
  setNowDay: (day: number) => void;
  weekDates: weekDatesProps[];
}

export default function CafeteriaTitleContainer({
  title,
  nowday,
  setNowDay,
  weekDates,
}: CafeteriaTitleContainerProps) {
  return (
    <CafeteriaTitleSection>
      <CafeteriaTitleWrapper>
        <CurrentCafeteriaName>{title}</CurrentCafeteriaName>
        <CafeteriaDate
          nowday={nowday}
          setNowDay={setNowDay}
          weekDates={weekDates}
        />
      </CafeteriaTitleWrapper>
    </CafeteriaTitleSection>
  );
}

const CafeteriaTitleSection = styled.div`
  margin: 0 ${MOBILE_PAGE_GUTTER};

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const CafeteriaTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
  width: 100%;
  padding: 16px 14px;
  border: 1px solid #e5ebf3;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(18, 38, 72, 0.04);

  @media ${DESKTOP_MEDIA} {
    width: 100%;
    padding: 18px 20px;
  }
`;

const CurrentCafeteriaName = styled.h2`
  margin: 0;
  padding-left: 2px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  color: #273142;

  // @media ${DESKTOP_MEDIA} {
  //   font-size: 19px;
  // }
`;
