export interface Club {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  url: string;
  homeUrl: string;
  isRecruiting: boolean;
}

export interface ClubRecruit {
  imageCount: number;
  recruit: string;
  modifiedDate: string;
}
