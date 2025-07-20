export type BusStatus = "여유" | "보통" | "혼잡";

export interface ArrivalInfo {
  time: string;
  station?: string;
  status?: BusStatus;
}

export interface BusData {
  id: number;
  number: string;
  route: string;
  arrivalInfo?: ArrivalInfo[];
  routeId?: string;
}

//정류장 상세 정보 (더미데이터)
export interface BusStopData {
  id: string;
  stopName: string;
  stopNotice?: string;
  stopImg: string[];
  busList: string[];
}

export interface BusDetailProps {
  number: string;
  busNotice: string;
  routeImg: string;
}

export interface BusStopBoxProps {
  sectionName: string;
  onClickInfo?: () => void;
  showInfoIcon?: boolean;
  busList: BusData[];
}

export interface BusStopHeaderProps {
  stopName: string;
  stopNotice: string;
  onClickStopInfo?: () => void;
  showInfoIcon?: boolean;
}
