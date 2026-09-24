export type SearchTab =
  | "ALL"
  | "NOTICE"
  | "DEPT_NOTICE"
  | "POST"
  | "SCHEDULE"
  | "DIRECTORY"
  | "COURSE"
  | "CLUB";

export interface UnifiedSection<T> {
  totalCount: number;
  items: T[];
}

export interface NoticeSearchItem {
  id: number;
  title: string;
  snippet?: string;
  writer?: string;
  category?: string;
  url?: string;
  createDate?: string;
}

export interface DepartmentNoticeSearchItem {
  id: number;
  department?: string;
  departmentName?: string;
  title: string;
  snippet?: string;
  writer?: string;
  url?: string;
  createDate?: string;
}

export interface PostSearchItem {
  id: number;
  title: string;
  snippet?: string;
  category?: string;
  writer?: string;
  good?: number;
  scrap?: number;
  createDate?: string;
}

export interface ScheduleSearchItem {
  id: number;
  content: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  aiGenerated?: boolean;
}

export interface DirectorySearchItem {
  id: number;
  name: string;
  affiliation?: string;
  detailAffiliation?: string;
  position?: string;
  duties?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CourseSearchItem {
  id: number;
  subjectNumber?: string;
  title: string;
  englishTitle?: string;
  professor?: string;
  credit?: number;
  hyName?: string;
  isuName?: string;
}

export interface ClubSearchItem {
  id: number;
  name: string;
  category?: string;
  snippet?: string;
}

export interface UnifiedSearchResponse {
  query: string;
  tab: SearchTab;
  totalCount: number;
  notices?: UnifiedSection<NoticeSearchItem>;
  departmentNotices?: UnifiedSection<DepartmentNoticeSearchItem>;
  posts?: UnifiedSection<PostSearchItem>;
  schedules?: UnifiedSection<ScheduleSearchItem>;
  directory?: UnifiedSection<DirectorySearchItem>;
  courses?: UnifiedSection<CourseSearchItem>;
  clubs?: UnifiedSection<ClubSearchItem>;
}
