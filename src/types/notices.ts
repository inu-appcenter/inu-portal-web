export interface Notice {
  id: number;
  category: string;
  title: string;
  writer: string;
  createDate: string;
  view: number;
  url: string;
}

export interface Keyword {
  keywordId: number;
  memberId: number;
  keyword: string | null; // 일부 API에서는 null 반환
  type: string; // "DEPARTMENT" 등
  department: string;
}
