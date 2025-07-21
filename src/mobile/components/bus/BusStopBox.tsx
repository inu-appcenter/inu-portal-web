import styled from "styled-components";
import SectionLabel from "mobile/components/bus/SectionLabel";
import InfoIcon from "mobile/components/bus/InfoIcon";
import BusItem from "mobile/components/bus/BusItem";
import { BusStopBoxProps, BusData } from "types/bus.ts";
import useMobileNavigate from "../../../hooks/useMobileNavigate.ts";
import { useEffect, useState } from "react";
import { getBusArrival } from "../../../apis/busArrival.ts";

interface Props extends BusStopBoxProps {
  bstopId: string;
}

export default function BusStopBox({
  sectionName,
  onClickInfo,
  busList,
  showInfoIcon = false, //기본값
  bstopId,
}: Props) {
  const mobileNavigate = useMobileNavigate();
  const [mergedList, setMergedList] = useState<BusData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBusArrival(bstopId);

      const updatedList = busList.map((bus) => {
        if (!bus.routeId) return bus;

        const matches = data.filter((item) => item.ROUTEID === bus.routeId);

        if (matches.length === 0) {
          return {
            ...bus,
            arrivalInfo: [
              {
                time: "도착정보 없음",
              },
            ],
          };
        }

        return {
          ...bus,
          arrivalInfo: matches.slice(0, 2).map((match) => ({
            time: toTime(match.ARRIVALESTIMATETIME),
            station: `${match.REST_STOP_COUNT}번째전`,
            status: convertStatus(match.CONGESTION),
          })),
        };
      });
      setMergedList(updatedList);
    };

    fetchData();
  }, [bstopId, busList]);

  return (
    <BusStopBoxWrapper>
      <BusStopBoxHeader>
        <LabelGroup>
          <SectionLabel text={sectionName} />
          {showInfoIcon && <InfoIcon onClick={onClickInfo} />}
        </LabelGroup>
      </BusStopBoxHeader>

      <BusList>
        {mergedList.map((bus) => (
          <BusItem
            key={bus.id}
            {...bus}
            onClick={() => mobileNavigate(`/bus/detail?number=${bus.number}`)}
          />
        ))}
      </BusList>
    </BusStopBoxWrapper>
  );
}

function toTime(seconds: string | number) {
  const sec = parseInt(String(seconds), 10);
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return `${min}분 ${rest}초`;
}

function convertStatus(code: string | number) {
  const map: Record<string, "여유" | "보통" | "혼잡"> = {
    "1": "여유",
    "2": "보통",
    "3": "혼잡",
  };
  return map[String(code)];
}

const BusStopBoxWrapper = styled.div`
  padding: 16px;
  background-color: transparent;
  border: 1px solid #7aa7e5;
  margin-bottom: 12px;
  border-radius: 10px;
  box-sizing: border-box;
`;

const BusStopBoxHeader = styled.div`
  margin-bottom: 12px;
`;

const LabelGroup = styled.div`
  display: flex;
  align-items: center;
`;

const BusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
