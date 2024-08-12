import { useEffect, useState } from "react";
import styled from "styled-components";
import { cafeteriasList } from "../../resource/string/cafeterias";
import CafeteriaBreakfast from "../../component/cafeteria/CafeteriaBreakfast";
import CafeteriaDinner from "../../component/cafeteria/CafeteriaDinner";
import CafeteriaLunch from "../../component/cafeteria/CafeteriaLunch";


interface CafeteriaDeatilProps {
    구성원가: string;
    칼로리: string;
}
interface CafeteriaInfoWrapperProps {
    title:string;
    cafeteriaDetail:CafeteriaDeatilProps[];
    cafeteriaInfo:string[];
}
export default function CafeteriaInfoContainer ({title,cafeteriaDetail,cafeteriaInfo}:CafeteriaInfoWrapperProps) {
  const [cafeteriaTypes, setCafeteriaTypes] = useState<string[]>([]);

    // Use effect to update cafeteriaTypes based on title
    useEffect(() => {
        const selectedCafeteria = cafeteriasList.find((list) => list.title === title);
        if (selectedCafeteria) {
            setCafeteriaTypes(selectedCafeteria.info);
        }
    }, [title]);
    
  return (
        <CafeteriaInfoWrapper>
              <CafeteriaBreakfast cafeteriaTypes={cafeteriaTypes} cafeteriaDetail={cafeteriaDetail} cafeteriaInfo={cafeteriaInfo}/>
              <CafeteriaLunch cafeteriaTypes={cafeteriaTypes} cafeteriaDetail={cafeteriaDetail} cafeteriaInfo={cafeteriaInfo}/>
              <CafeteriaDinner cafeteriaTypes={cafeteriaTypes} cafeteriaDetail={cafeteriaDetail} cafeteriaInfo={cafeteriaInfo}/>             
        </CafeteriaInfoWrapper>
    )
}

const CafeteriaInfoWrapper = styled.div`
  width: 100%;
  background-color: #F3F7FE;
  box-sizing: border-box;
  padding:40px 16px 0;
  height: 100%;
  margin-top:40px;
  .type-wrapper {
    .type {
      font-family: Inter;
    font-size: 13px;
    font-weight: 700;
    margin-bottom:6px;
    }

    .time {
      font-family: Inter;
      font-size: 8px;
      font-weight: 400;
      color: #969696;
      margin:0;
    }
  }

  .info-wrapper {
    display: flex;
    align-items: center;
    gap:30px;
    img {
      width: 37px;
      height: 39px;
    }
  }

  .detail-info-wrapper {
    width:100%;
    background-color: white;
    padding:10px;
    box-sizing: border-box;

    .info {
      font-family: Inter;
font-size: 13px;
font-weight: 700;
    
    }
  }

  .detail-wrapper {
      display: flex;  /* Changed from inline-block to flex */
      gap: 6px;
      justify-content: flex-end;
      align-items: center;
      .sub-detail-wrapper {
        display: flex;
        border: 0.5px solid #DFDFDF;
        gap:10px;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        padding:3px;
        font-family: Inter;
      font-size: 10px;
      font-weight: 500;
      color: #888888;

      }
    }
`