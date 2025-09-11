export type BusStatus = "여유" | "보통" | "혼잡";

export interface ArrivalInfo {
  time: string;
  station?: string;
  status?: BusStatus;
  seconds?: number; //카운트다운
  isLastBus?: boolean;
  restCount?: number;
}

//버스 상세 정보 (BusDummy)
export interface BusData {
  id: number;
  number: string;
  route: string[];
  busNotice?: string;
  path?: { lat: number; lng: number }[];
  stopMarker?: {
    name: string;
    lat: number;
    lng: number;
  }[];
  routeNotice?: string;
  arrivalInfo?: ArrivalInfo;
  routeId?: string;
  sectionLabel?: string;
  stopId?: string;
  lastStopId?: string;
}

//정류장 상세 정보 (BusDummy)
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

//지도 좌표
export interface LatLng {
  lat: number;
  lng: number;
}
