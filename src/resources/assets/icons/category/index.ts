import type { FC, SVGProps } from "react";

import AcademicIcon from "./academic.svg?react";
import CampusLifeIcon from "./campus-life.svg?react";
import ClubIcon from "./club.svg?react";
import CourseRegistrationIcon from "./course-registration.svg?react";
import CreditExchangeIcon from "./credit-exchange.svg?react";
import DormitoryIcon from "./dormitory.svg?react";
import EducationExamIcon from "./education-exam.svg?react";
import ExchangeStudentIcon from "./exchange-student.svg?react";
import HaksanLibraryIcon from "./haksan-library.svg?react";
import MyActivityIcon from "./my-activity.svg?react";
import PasswordChangeIcon from "./password-change.svg?react";
import PersonalInfoEditIcon from "./personal-info-edit.svg?react";
import RecruitmentIcon from "./recruitment.svg?react";
import ScholarshipIcon from "./scholarship.svg?react";
import ScrapIcon from "./scrap.svg?react";
import WithdrawalIcon from "./withdrawal.svg?react";

// "전체(all)" 아이콘은 원본이 Figma에서 내보낸 래스터(base64 PNG) 패턴 채우기라
// currentColor 벡터로 통합할 수 없다. gray/white 두 장을 그대로 유지한다.
import allGray from "./all-gray.svg";
import allWhite from "./all-white.svg";

/**
 * 서버가 내려주는 한글 카테고리명 → ASCII 슬러그 매핑.
 * 한글/공백이 섞인 원본 파일명은 식별자로 쓸 수 없어 이 매핑이 경계 역할을 한다.
 * 카테고리명 자체(키)는 서버/URL과 그대로 맞춰야 하므로 절대 바꾸지 말 것.
 */
export const CATEGORY_ICON_SLUGS = {
  전체: "all",
  "개인정보 수정": "personal-info-edit",
  "비밀번호 변경": "password-change",
  "회원 탈퇴": "withdrawal",
  장학금: "scholarship",
  모집: "recruitment",
  대학생활: "campus-life",
  "내 활동": "my-activity",
  기숙사: "dormitory",
  학산도서관: "haksan-library",
  스크랩: "scrap",
  학점교류: "credit-exchange",
  동아리: "club",
  교육시험: "education-exam",
  학사: "academic",
  수강신청: "course-registration",
  교환학생: "exchange-student",
} as const satisfies Record<string, string>;

export type CategoryName = keyof typeof CATEGORY_ICON_SLUGS;
export type CategoryIconSlug = (typeof CATEGORY_ICON_SLUGS)[CategoryName];

/** 폴백(알 수 없는 카테고리)에 쓰는 슬러그. 서버가 새 카테고리를 내려줘도 깨지지 않는다. */
export const FALLBACK_CATEGORY_ICON_SLUG = "all" as const;

type VectorCategoryIcon = FC<SVGProps<SVGSVGElement>>;

/** currentColor 기반 벡터 아이콘 (전체 제외 16종) */
export const VECTOR_CATEGORY_ICONS: Partial<
  Record<CategoryIconSlug, VectorCategoryIcon>
> = {
  "personal-info-edit": PersonalInfoEditIcon,
  "password-change": PasswordChangeIcon,
  withdrawal: WithdrawalIcon,
  scholarship: ScholarshipIcon,
  recruitment: RecruitmentIcon,
  "campus-life": CampusLifeIcon,
  "my-activity": MyActivityIcon,
  dormitory: DormitoryIcon,
  "haksan-library": HaksanLibraryIcon,
  scrap: ScrapIcon,
  "credit-exchange": CreditExchangeIcon,
  club: ClubIcon,
  "education-exam": EducationExamIcon,
  academic: AcademicIcon,
  "course-registration": CourseRegistrationIcon,
  "exchange-student": ExchangeStudentIcon,
};

/** 래스터 예외("전체"): active 여부에 따라 다른 PNG-in-SVG 파일을 쓴다. */
export const RASTER_CATEGORY_ICONS = {
  all: { gray: allGray, white: allWhite },
} as const;
