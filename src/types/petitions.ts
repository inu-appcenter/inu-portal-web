export interface PetitionSummary {
  id: number;
  title: string;
  writer: string;
  createDate: string;
  imageCount: number;
}

export interface Petition {
  id: number;
  title: string;
  content: string;
  writer: string;
  createDate: string;
  imageCount: number;
  hasAuthority: boolean;
  view: number;
}
