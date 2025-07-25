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
  showInfoIcon = false,
  bstopId,
}: Props) {
  const mobileNavigate = useMobileNavigate();
  const [busArrivalList, setBusArrivalList] = useState<BusData[]>([]);

  const fetchBusArrivalData = async () => {
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
              seconds: 0,
              isLastBus: false,
            },
          ],
        };
      }

      return {
        ...bus,
        arrivalInfo: matches.slice(0, 2).map((match) => {
          const seconds = Number(match.ARRIVALESTIMATETIME);
          return {
            time: toTime(seconds),
            seconds,
            station: `${match.REST_STOP_COUNT}번째전`,
            status: convertStatus(match.CONGESTION),
            isLastBus: match.LASTBUSYN === "1",
          };
        }),
      };
    });

    setBusArrivalList(updatedList);
  };

  useEffect(() => {
    fetchBusArrivalData();

    const interval = setInterval(fetchBusArrivalData, 2 * 60 * 1000); // 2분
    return () => clearInterval(interval);
  }, [bstopId, busList]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBusArrivalList((prev) =>
        prev.map((bus) => ({
          ...bus,
          arrivalInfo: bus.arrivalInfo?.map((item) => {
            if (typeof item.seconds !== "number" || item.seconds <= 0)
              return item;

            const updatedSeconds = item.seconds - 1;
            return {
              ...item,
              seconds: updatedSeconds,
              time: toTime(updatedSeconds),
            };
          }),
        })),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <BusStopBoxWrapper>
      <BusStopBoxHeader>
        <LabelGroup>
          <SectionLabel text={sectionName} />
          {showInfoIcon && <InfoIcon onClick={onClickInfo} />}
        </LabelGroup>
      </BusStopBoxHeader>

      <BusList>
        {busArrivalList.map((bus) => (
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
  if (sec < 0) return "도착정보 없음";
  if (sec <= 30) return "곧 도착";
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
