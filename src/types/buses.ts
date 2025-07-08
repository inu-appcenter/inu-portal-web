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
  arrivalInfo: ArrivalInfo[];
}
