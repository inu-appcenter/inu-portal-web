export type BusStatus = "여유" | "보통" | "혼잡";

export interface ArrivalInfo {
  time: string;
  station?: string;
  status?: BusStatus;
  seconds?: number; //카운트다운
  isLastBus?: boolean;
  restCount?: number;
}

export interface BusData {
  id: number;
  number: string;
  route: string[];
  routeNotice?: string;
  routeImg?: string[];
  arrivalInfo?: ArrivalInfo;
  routeId?: string;
  sectionLabel: string;
  stopId: string;
}

//정류장 상세 정보 (더미데이터)
export interface BusStopData {
  id: string;
  stopName: string;
  stopNotice?: string;
  busList: string[];
  sectionLabel?: string;
  lat: number;
  lng: number;
}

export interface BusStopBoxProps {
  sectionName: string;
  onClickInfo?: () => void;
  showInfoIcon?: boolean;
  busList: BusData[];
}

export interface BusStopHeaderProps {
  stopName: string;
  stopNotice?: string;
  onClickStopInfo?: () => void;
  showInfoIcon?: boolean;
}
