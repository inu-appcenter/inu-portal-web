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

export interface StationData {
  id: string;
  stopName: string;
  sectionName: string;
  stopDescription: string;
  mapImage: string;
  busList: string[];
}
