export type DirectoryCategory =
  | "HEADQUARTERS"
  | "UNIVERSITY"
  | "GRADUATE_SCHOOL"
  | "AFFILIATED_INSTITUTION";

export interface DirectoryEntry {
  id: number;
  category: DirectoryCategory;
  categoryName: string;
  affiliation: string;
  detailAffiliation: string;
  name: string | null;
  position: string;
  duties: string | null;
  phoneNumber: string | null;
  email: string | null;
  profileUrl: string | null;
  lastSyncedAt: string;
}

export interface CollegeOfficeContact {
  id: number;
  collegeName: string;
  collegeLocationSummary: string | null;
  departmentName: string;
  officePhoneNumber: string | null;
  homepageUrl: string | null;
  officeLocation: string | null;
  sourceUrl: string;
  lastSyncedAt: string;
}
