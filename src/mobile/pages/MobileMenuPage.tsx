import styled from "styled-components";
import { useEffect, useState } from "react";
import { getCafeterias } from "apis/cafeterias";
import CafeteriaInfoContainer from "mobile/containers/cafeteria/CafeteriaInfoContainer";
import CafeteriaTitleContainer from "mobile/containers/cafeteria/CafeteriaTitleContainer";
import BackImg from "resources/assets/mobile-common/backbtn.svg";
import useMobileNavigate from "hooks/useMobileNavigate";

interface CafeteriaDetail {
  구성원가: string;
  칼로리: string;
}

export default function MobileMenuPage() {
  const [title, setTitle] = useState("학생식당");
  const [cafeteriaDetail, setCafeteriaDetail] = useState<
    (CafeteriaDetail | null)[]
  >([]);
  const [cafeteriaInfo, setCafeteriaInfo] = useState<(string | null)[]>([]);
  const [nowday, setNowDay] = useState(new Date().getDay());
  const [weekDates, setWeekDates] = useState<
    { dayName: string; date: string }[]
  >([]);
  const date = new Date();
  const day = date.getDay();
  const mobileNavigate = useMobileNavigate();

  useEffect(() => {
    setWeekDates(getWeekDates(date)); // 주의 날짜 설정
  }, []);

  useEffect(() => {
    fetchCafeteriaData(nowday);
  }, [title, nowday]);

  const getWeekDates = (date: Date): { dayName: string; date: string }[] => {
    const weekDates = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const diffToMonday = (day === 0 ? -6 : 1) - day; // 월요일까지의 차이
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday); // 이번 주 월요일 날짜

    for (let i = 0; i < 6; i++) {
      const weekDate = new Date(monday);
      weekDate.setDate(monday.getDate() + i);
      weekDates.push({
        dayName: days[weekDate.getDay()],
        date: `${weekDate.getDate()}`,
      });
    }
    return weekDates;
  };

  const fetchCafeteriaData = async (date: number) => {
    try {
      const response = await getCafeterias(title, date);
      const processedData = response.data.map((info: string) =>
        extractValues(info)
      );
      const infoData = response.data.map((info: string) => extractMenu(info));
      setCafeteriaInfo(infoData);
      setCafeteriaDetail(processedData);
    } catch (error) {
      console.error("학식 메뉴 가져오기 실패", error);
    }
  };

  const extractValues = (input: string): CafeteriaDetail | null => {
    const price = input.match(/([0-9,]+)원/);
    const calory = input.match(/[0-9,]+kcal/);
    if (price && calory) {
      return {
        구성원가: price[0],
        칼로리: calory[0],
      };
    }
    return null;
  };

  const extractMenu = (input: string): string | null => {
    const match = input.match(/^(.*?)(?=\s[0-9,]+원|\s\"[0-9,]+원)/);
    return match ? match[1].trim() : input;
  };

  return (
    <CafeteriaWrapper>
      <BackButton onClick={() => mobileNavigate(`/home`)}>
        <img src={BackImg} alt="뒤로가기 버튼" />
        <span>Back</span>
      </BackButton>
      <CafeteriaTitleContainer
        title={title}
        setTitle={setTitle}
        nowday={nowday}
        setNowDay={setNowDay}
        weekDates={weekDates}
      />
      <CafeteriaInfoContainer
        title={title}
        cafeteriaDetail={cafeteriaDetail}
        cafeteriaInfo={cafeteriaInfo}
      />
    </CafeteriaWrapper>
  );
}

const CafeteriaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const BackButton = styled.div`
  padding: 20px 0 0 20px;
  width: 80px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  img {
    width: 15px;
    height: 15px;
  }
`;
