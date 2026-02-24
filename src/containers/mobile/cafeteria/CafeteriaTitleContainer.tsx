import CafeteriaDate from "@/components/mobile/cafeteria/CafeteriaDate";
import CafeteriaToggle from "@/components/mobile/cafeteria/CafeteriaList";
import styled from "styled-components";

// import eatingRice from "@/resources/assets/cafeteria/eatingRice.png";

interface weekDatesProps {
  dayName: string;
  date: string;
}

interface CafeteriaTitleContainerProps {
  title: string;
  setTitle: (title: string) => void;
  nowday: number;
  setNowDay: (day: number) => void;
  weekDates: weekDatesProps[];
}

export default function CafeteriaTitleContainer({
  title,
  setTitle,
  nowday,
  setNowDay,
  weekDates,
}: CafeteriaTitleContainerProps) {
  return (
    <CafeteriaTitleWrapper>
      {/*<Imgbox src={eatingRice} alt="eatingRice" />*/}

      <CafeteriaToggle title={title} setTitle={setTitle} />
      <CafeteriaDate
        nowday={nowday}
        setNowDay={setNowDay}
        weekDates={weekDates}
      />
    </CafeteriaTitleWrapper>
  );
}

const CafeteriaTitleWrapper = styled.div``;
