import { useEffect } from "react";
import CafeteriaDate from "../../component/cafeteria/CafeteriaDate"
import CafeteriaToggle from "../../component/cafeteria/CafeteriaList"
import styled from "styled-components";

interface weekDatesProps {
    dayName: string;
    date: string;
}
interface CafeteriaTitleContainerProps {
    title:string;
    setTitle:(title:string) => void;
    nowday:number;
    setNowDay:(day:number) => void;
    weekDates:weekDatesProps[];
}

export default  function CafeteriaTitleContainer ({title,setTitle,nowday,setNowDay,weekDates}:CafeteriaTitleContainerProps)  {
    useEffect(()=>{
        console.log("하이",weekDates,nowday);
    },[weekDates,nowday])

    return(
        <CafeteriaTitleWrapper>
            <CafeteriaToggle title={title} setTitle={setTitle}/>
            <CafeteriaDate nowday={nowday} setNowDay={setNowDay } weekDates={weekDates}/>
        </CafeteriaTitleWrapper>
    )
}

const CafeteriaTitleWrapper = styled.div`
  padding: 0 16px 0 16px;
`