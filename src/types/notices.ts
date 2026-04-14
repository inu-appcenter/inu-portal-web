export interface Notice {
  id: number;
  category: string;
  title: string;
  writer: string;
  createDate: string;
  view: number;
  url: string;
}

export interface DepartmentNotice {
  id: number;
  title: string;
  department: string;
  createDate: string;
  view: number;
  url: string;
  hasSchedules: boolean;
}

export interface Keyword {
  keywordId: number;
  memberId: number;
  keyword: string | null;
  type: string;
  department: string;
}
