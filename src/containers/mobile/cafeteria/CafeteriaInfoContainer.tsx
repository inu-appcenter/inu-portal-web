import { useEffect, useState } from "react";
import styled from "styled-components";
import { cafeterias } from "@/resources/strings/cafeterias";
import CafeteriaItem from "@/components/mobile/cafeteria/CafeteriaItem";

interface CafeteriaDeatilProps {
  구성원가: string;
  칼로리: string;
}

interface CafeteriaInfoWrapperProps {
  title: string;
  cafeteriaDetail: (CafeteriaDeatilProps | null)[];
  cafeteriaInfo: (string | null)[];
  isLoading: boolean;
}

export default function CafeteriaInfoContainer({
  title,
  cafeteriaDetail,
  cafeteriaInfo,
  isLoading,
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
      <CafeteriaItem
        typeIndex={0}
        cafeteriaTypes={cafeteriaTypes}
        cafeteriaDetail={cafeteriaDetail}
        cafeteriaInfo={cafeteriaInfo}
        isLoading={isLoading}
      />
      <CafeteriaItem
        typeIndex={1}
        cafeteriaTypes={cafeteriaTypes}
        cafeteriaDetail={cafeteriaDetail}
        cafeteriaInfo={cafeteriaInfo}
        isLoading={isLoading}
      />
      <CafeteriaItem
        typeIndex={2}
        cafeteriaTypes={cafeteriaTypes}
        cafeteriaDetail={cafeteriaDetail}
        cafeteriaInfo={cafeteriaInfo}
        isLoading={isLoading}
      />
    </CafeteriaInfoWrapper>
  );
}

const CafeteriaInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;
  padding: 0 16px;
  //margin: 0 16px;
  min-height: fit-content;
  border-radius: 10px;

  .total-wrapper {
    margin: 20px 0;
  }

  .type-wrapper {
    align-items: center;
    display: flex;
    flex-direction: column;

    .type {
      font-size: 10px;
      font-weight: 500;
      margin: 0;
      text-align: center;
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
`;
