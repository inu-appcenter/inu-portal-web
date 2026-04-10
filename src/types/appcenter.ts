/**
 * 게시글 이미지 정보
 * Key: 이미지 ID, Value: 이미지 URL
 */
export interface BoardImages {
  [key: string]: string;
}

/**
 * 게시글 상세 데이터 구조
 */
export interface BoardContent {
  id: number;
  title: string;
  subTitle: string;
  body: string;
  createdDate: string;
  lastModifiedDate: string;
  githubLink: string | null;
  androidStoreLink: string | null;
  appleStoreLink: string | null;
  websiteLink: string | null;
  isActive: boolean;
  images: BoardImages;
  stacks: any[]; // 구체적인 타입 확인 시 수정 가능
  groups: any[]; // 구체적인 타입 확인 시 수정 가능
}

/**
 * API 응답 타입 (객체 배열)
 */
export type BoardListResponse = BoardContent[];
