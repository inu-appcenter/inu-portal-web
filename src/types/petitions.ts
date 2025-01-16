export interface PetitionSummary {
  id: number;
  title: string;
  writer: string;
  createDate: string;
}

export interface Petition {
  id: number;
  title: string;
  content: string;
  writer: string;
  createDate: string;
  imageCount: number;
}
