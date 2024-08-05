
import styled from "styled-components";
import { useEffect, useState } from "react";
import { getCafeterias } from "../../utils/API/Cafeterias";
import CafeteriaTitleContainer from "../../container/cafeteria/CafeteriaTitleContainer";
import CafeteriaInfoContainer from "../../container/cafeteria/CafeteriaInfoContainer";

export default function MobileMenuPage() {
  const [title, setTitle] = useState("학생식당");
  const [cafeteriaDetail, setCafeteriaDetail] = useState<{ 구성원가: string, 칼로리: string }[]>([]);
  const [cafeteriaInfo , setCafeteriaInfo] = useState([]); 

  const [nowday,setNowDay] = useState(new Date().getDay());
  const [weekDates, setWeekDates] = useState<{ dayName: string, date: string }[]>([]);
  const date = new Date();
  const day = date.getDay(); 
  useEffect(() => {
      setWeekDates(getWeekDates(date)); // 주의 날짜 설정
      console.log(weekDates, "현재 주의 날짜");
    }, []);
  
  
  useEffect(()=> {
    console.log(nowday);
    fetchCafeteriaData(nowday);
  },[])

  useEffect(()=> {
    console.log(nowday);
    fetchCafeteriaData(nowday);
  },[title,nowday])

  const getWeekDates = (date: Date): { dayName: string, date: string }[] => {
    const weekDates = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    console.log(day, 'datat');
    const diffToMonday = (day === 0 ? -6 : 1) - day; // 월요일까지의 차이
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday); // 이번 주 월요일 날짜
    
    for (let i = 0; i < 6; i++) {
      const weekDate = new Date(monday);
      weekDate.setDate(monday.getDate() + i);
      weekDates.push({
        dayName: days[weekDate.getDay()],
        date: `${weekDate.getDate()}`
      });
    }
    return weekDates;
  }

  const fetchCafeteriaData = async (date: number) => {
    try {
      const response = await getCafeterias(title, date);
      if (response.status === 200) {
        const processedData = response.body.data.map((info: string) => extractValues(info));
        const infoData = response.body.data.map((info: string) => extractMenu(info));
        console.log(processedData, "여기여기여기", infoData);
        setCafeteriaInfo(infoData);
        setCafeteriaDetail(processedData);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('학식 정보 조회 안됨', error);
    }
  };

    const extractValues= (input: string): { 구성원가: string, 칼로리: string } | null => {
    const price = input.match(/([0-9,]+)원/);
    const calory = input.match(/[0-9,]+kcal/);
    if (price && calory) {
      return {
        구성원가: price[0],
        칼로리: calory[0]
      };
    }
    return null;
  }

  const extractMenu = (input: string): string | null =>{
    const match = input.match(/^(.*?)(?=\s[0-9,]+원)/);
    return match ? match[1].trim() : input;
  }

  return (
      <CafeteriaWrapper>
        <CafeteriaTitleContainer title ={title} setTitle={setTitle} nowday={nowday} setNowDay={setNowDay} weekDates={weekDates}/>
        <CafeteriaInfoContainer title={title} cafeteriaDetail={cafeteriaDetail} cafeteriaInfo={cafeteriaInfo}/>
      </CafeteriaWrapper>
  );
}

const CafeteriaWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

