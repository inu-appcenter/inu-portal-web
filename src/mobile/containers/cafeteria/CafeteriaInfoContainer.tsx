import { useEffect, useState } from "react";
import styled from "styled-components";
import { cafeterias } from "resources/strings/cafeterias";
import CafeteriaBreakfast from "mobile/components/cafeteria/CafeteriaBreakfast";
import CafeteriaDinner from "mobile/components/cafeteria/CafeteriaDinner";
import CafeteriaLunch from "mobile/components/cafeteria/CafeteriaLunch";

interface CafeteriaDeatilProps {
  구성원가: string;
  칼로리: string;
}
interface CafeteriaInfoWrapperProps {
  title: string;
  cafeteriaDetail: (CafeteriaDeatilProps | null)[];
  cafeteriaInfo: (string | null)[];
}
export default function CafeteriaInfoContainer({
  title,
  cafeteriaDetail,
  cafeteriaInfo,
}: CafeteriaInfoWrapperProps) {
  const [cafeteriaTypes, setCafeteriaTypes] = useState<string[]>([]);

  // Use effect to update cafeteriaTypes based on title
  useEffect(() => {
    const selectedCafeteria = cafeterias.find((list) => list.title === title);
    if (selectedCafeteria) {
      setCafeteriaTypes(selectedCafeteria.info);
    }
  }, [title]);

  return (
    <CafeteriaInfoWrapper>
      <CafeteriaBreakfast
        cafeteriaTypes={cafeteriaTypes}
        cafeteriaDetail={cafeteriaDetail}
        cafeteriaInfo={cafeteriaInfo}
      />
      <CafeteriaLunch
        cafeteriaTypes={cafeteriaTypes}
        cafeteriaDetail={cafeteriaDetail}
        cafeteriaInfo={cafeteriaInfo}
      />
      <CafeteriaDinner
        cafeteriaTypes={cafeteriaTypes}
        cafeteriaDetail={cafeteriaDetail}
        cafeteriaInfo={cafeteriaInfo}
      />
    </CafeteriaInfoWrapper>
  );
}

const CafeteriaInfoWrapper = styled.div`
  background-color: #f3f7fe;
  box-sizing: border-box;
  padding: 0 16px;
  margin-top: 20px;
  min-height: 400px;

  .total-wrapper {
    margin: 20px 0;
  }

  .type-wrapper {
    align-items: center;
    display: flex;
    flex-direction: column;
    .type {
      font-size: 10px;
      font-weight: 600;
      margin: 0;
    }

    .time {
      font-size: 8px;
      font-weight: 400;
      color: #969696;
      margin: 0;
    }
  }

  .info-wrapper {
    display: flex;
    align-items: center;
    gap: 20px;
    img {
      width: 38px;
      height: 38px;
    }
  }

  .detail-info-wrapper {
    width: 100%;
    min-height: 90px;
    background-color: white;
    padding: 10px 15px;
    box-sizing: border-box;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .info {
      font-size: 13px;
      font-weight: 600;
      color: #404040;
      margin: 0;
    }
  }

  .detail-wrapper {
    display: flex; /* Changed from inline-block to flex */
    gap: 6px;
    justify-content: flex-end;
    align-items: center;
    .sub-detail-wrapper {
      display: flex;
      border: 0.5px solid #dfdfdf;
      gap: 10px;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      padding: 3px;
      font-size: 10px;
      font-weight: 500;
      color: #888888;
    }
  }
`;
