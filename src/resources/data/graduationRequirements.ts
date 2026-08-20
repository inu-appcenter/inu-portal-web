// 이 파일은 학과별 졸업요건 수집 데이터를 옮겨 담은 정적 데이터다.
// 학과 코드는 navBarList.ts(= 서버 departmentCode)의 코드를 그대로 쓴다.
//
// 신뢰도(confidence)
//  - "A": 학과 자체 자료에서 학번별 이력까지 확인
//  - "B": 학과 자체 자료 또는 학과가 지정한 대학 공통기준에서 최신 규정만 확인
//  - "C": 학과 자료를 확보하지 못해 대학 공통기준으로 추정 — 학과 사무실 확인 필요
//
// 갱신 주기: 매년 2월·8월 개강 전 (issue #335)
//
// 원본 수집 데이터와 학과별 근거·신뢰도 상세: docs/graduation-requirements/
import type { DepartmentGraduationRequirement } from "@/types/graduation";

export const GRADUATION_REQUIREMENTS: Record<
  string,
  DepartmentGraduationRequirement
> = {
  KOREAN: {
    departmentName: "국어국문학과",
    confidence: "A",
    sourceUrl: "https://korean.inu.ac.kr/bbs/korean/286/327695/artclView.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2001,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2002,
        endYear: 2007,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2008,
        endYear: 2009,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2010,
        endYear: 2011,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2012,
        endYear: 2015,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2016,
        endYear: 2016,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2017,
        endYear: 2018,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2019,
        endYear: 2019,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2020,
        endYear: 2022,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  ENGLISH: {
    departmentName: "영어영문학과",
    confidence: "A",
    sourceUrl: "https://english.inu.ac.kr/ui/1975/subview.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2001,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2002,
        endYear: 2007,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
      {
        startYear: 2008,
        endYear: 2009,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
      {
        startYear: 2010,
        endYear: 2011,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
      {
        startYear: 2012,
        endYear: 2015,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
      {
        startYear: 2016,
        endYear: 2018,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
      {
        startYear: 2019,
        endYear: 2022,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
    ],
  },
  GERMAN: {
    departmentName: "독어독문학과",
    confidence: "A",
    sourceUrl: "https://german.inu.ac.kr/german/1823/subview.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2007,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어",
              credits: 6,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2008,
        endYear: 2009,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어",
              credits: 6,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2010,
        endYear: 2011,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어",
              credits: 6,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2012,
        endYear: 2015,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어",
              credits: 6,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2016,
        endYear: 2016,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2017,
        endYear: 2022,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  JAPANESE: {
    departmentName: "일본지역문화학과",
    confidence: "C",
    sourceUrl: "https://unjapan.inu.ac.kr/unjapan/2039/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  CHINESE: {
    departmentName: "중어중국학과",
    confidence: "A",
    sourceUrl: "https://inuchina.inu.ac.kr/bbs/inuchina/301/336265/artclView.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2007,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2008,
        endYear: 2009,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2010,
        endYear: 2011,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2012,
        endYear: 2015,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2016,
        endYear: 2018,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
      {
        startYear: 2019,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  FRENCH: {
    departmentName: "불어불문학과",
    confidence: "B",
    sourceUrl: "https://inufrance.inu.ac.kr/inufrance/12395/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  MATHEMATICS: {
    departmentName: "수학과",
    confidence: "B",
    sourceUrl: "https://www.inu.ac.kr/inu/666/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
      },
    ],
  },
  PHYSICS: {
    departmentName: "물리학과",
    confidence: "A",
    sourceUrl: "https://physics.inu.ac.kr/bbs/physics/304/428417/artclView.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2007,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2008,
        endYear: 2009,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2010,
        endYear: 2011,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
      },
      {
        startYear: 2012,
        endYear: 2015,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
      },
      {
        startYear: 2016,
        endYear: 2016,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
      },
      {
        startYear: 2017,
        endYear: 2018,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
      },
      {
        startYear: 2019,
        endYear: 2022,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
      },
      {
        startYear: 2023,
        endYear: 2025,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
      },
      {
        startYear: 2026,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "AI시대의글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화1,2",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "AI사고와데이터리터러시",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "AI와인간중심윤리",
              credits: 2,
              category: "기타",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
      },
    ],
  },
  CHEMISTRY: {
    departmentName: "화학과",
    confidence: "B",
    sourceUrl: "https://chem.inu.ac.kr/chem/2404/subview.do",
    rules: [
      {
        startYear: 2017,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 2,
          requiredGeneralCourses: [
            {
              courseName: "대학영어1,2",
              credits: 4,
              category: "영어",
            },
            {
              courseName: "대학영어회화1,2",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "글쓰기이론과실제 또는 공학작문및발표",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "대학수학1,2",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  FASHION: {
    departmentName: "패션산업학과",
    confidence: "C",
    sourceUrl: null,
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "생활과학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  MARINE: {
    departmentName: "해양학과",
    confidence: "B",
    sourceUrl: "https://marine.inu.ac.kr/marine/2318/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  SOCIAL_WELFARE: {
    departmentName: "사회복지학과",
    confidence: "B",
    sourceUrl: "https://dsw.inu.ac.kr/dsw/2491/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  MEDIA_COMMUNICATION: {
    departmentName: "미디어커뮤니케이션학과",
    confidence: "B",
    sourceUrl: "https://newdays.inu.ac.kr/shinbang/2536/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  LIBRARY_INFO: {
    departmentName: "문헌정보학과",
    confidence: "B",
    sourceUrl: "https://cls.inu.ac.kr/cls/2446/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  CREATIVE_HRD: {
    departmentName: "창의인재개발학과",
    confidence: "B",
    sourceUrl: "https://hrd.inu.ac.kr/hrd/2578/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  PUBLIC_ADMINISTRATION: {
    departmentName: "행정학과",
    confidence: "B",
    sourceUrl: "https://uipa.inu.ac.kr/uipa/7799/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  POLITICS_DIPLOMACY: {
    departmentName: "정치외교학과",
    confidence: "B",
    sourceUrl: "https://politics.inu.ac.kr/politics/2740/subview.do",
    rules: [
      {
        startYear: 2010,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  ECONOMICS: {
    departmentName: "경제학과",
    confidence: "A",
    sourceUrl: "https://econ.inu.ac.kr/econ/2640/subview.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2001,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2002,
        endYear: 2007,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
      {
        startYear: 2008,
        endYear: 2009,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
      {
        startYear: 2010,
        endYear: 2011,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2012,
        endYear: 2015,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2016,
        endYear: 2016,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2017,
        endYear: 2018,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2019,
        endYear: 2019,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2020,
        endYear: 2022,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  TRADE: {
    departmentName: "무역학부",
    confidence: "B",
    sourceUrl: "https://trade.inu.ac.kr/trade/2689/subview.do",
    rules: [
      {
        startYear: 2020,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  CONSUMER_SCIENCE: {
    departmentName: "소비자학과",
    confidence: "C",
    sourceUrl: "https://ccs.inu.ac.kr/ccs/2787/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  MECHANICAL_ENGINEERING: {
    departmentName: "기계공학과",
    confidence: "A",
    sourceUrl: "https://me.inu.ac.kr/me/2984/subview.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2001,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
      },
      {
        startYear: 2002,
        endYear: 2007,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
      {
        startYear: 2008,
        endYear: 2009,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
      {
        startYear: 2010,
        endYear: 2011,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2012,
        endYear: 2015,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2016,
        endYear: 2016,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2017,
        endYear: 2018,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2019,
        endYear: 2019,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW(=전공필수 기계기초프로그래밍)",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2020,
        endYear: 2022,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW(=전공필수 기계기초프로그래밍)",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW(=전공필수 기계기초프로그래밍)",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  ELECTRICAL_ENGINEERING: {
    departmentName: "전기공학과",
    confidence: "B",
    sourceUrl: "https://elec.inu.ac.kr/elec/3319/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
          minRequiredMajorCredits: 24,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  ELECTRONICS_ENGINEERING: {
    departmentName: "전자공학과",
    confidence: "C",
    sourceUrl: "https://ee.inu.ac.kr/electron/13794/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  INDUSTRIAL_MANAGEMENT: {
    departmentName: "산업경영공학과",
    confidence: "B",
    sourceUrl: "https://ime.inu.ac.kr/ime/3096/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2025,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  MATERIAL_SCIENCE: {
    departmentName: "신소재공학과",
    confidence: "B",
    sourceUrl: "https://mse.inu.ac.kr/mse/3141/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  SAFETY_ENGINEERING: {
    departmentName: "안전공학과",
    confidence: "B",
    sourceUrl: "https://safety.inu.ac.kr/safety/3197/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  ENERGY_CHEMICAL: {
    departmentName: "에너지화학공학과",
    confidence: "A",
    sourceUrl: "https://energy.inu.ac.kr/bbs/energy/868/391461/artclView.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2018,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2019,
        endYear: 2022,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2023,
        endYear: 2025,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "대학수학1,2",
              credits: 6,
              category: "수학",
            },
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
          minRequiredMajorCredits: 38,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2026,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "대학수학1,2",
              credits: 6,
              category: "수학",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "AI시대의글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "AI사고와데이터리터러시",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "AI와인간중심윤리",
              credits: 2,
              category: "기타",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
          minRequiredMajorCredits: 38,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  BIO_ROBOTICS_ENGINEERING: {
    departmentName: "바이오-로봇시스템공학과",
    confidence: "C",
    sourceUrl: null,
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  COMPUTER_ENGINEERING: {
    departmentName: "컴퓨터공학부",
    confidence: "A",
    sourceUrl: "https://cse.inu.ac.kr/isis/3523/subview.do",
    rules: [
      {
        startYear: 1979,
        endYear: 2001,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
      },
      {
        startYear: 2002,
        endYear: 2007,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 999,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
      {
        startYear: 2008,
        endYear: 2009,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 51,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
      {
        startYear: 2010,
        endYear: 2011,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 25,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2012,
        endYear: 2015,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어 관련 1과목",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어 관련 과목",
              credits: 4,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2016,
        endYear: 2016,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2017,
        endYear: 2018,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2019,
        endYear: 2019,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2020,
        endYear: 2022,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
          minRequiredMajorCredits: 19,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
          minRequiredMajorCredits: 19,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  INFORMATION_COMMUNICATION_ENGINEERING: {
    departmentName: "정보통신공학과",
    confidence: "B",
    sourceUrl: "https://ite.inu.ac.kr/ite/3468/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  EMBEDDED_SYSTEM: {
    departmentName: "임베디드시스템공학과",
    confidence: "C",
    sourceUrl: "https://ese.inu.ac.kr/ese/3424/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  BUSINESS_ADMINISTRATION: {
    departmentName: "경영학부",
    confidence: "B",
    sourceUrl: "https://biz.inu.ac.kr/biz/3607/subview.do",
    rules: [
      {
        startYear: 2020,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  DATA_SCIENCE: {
    departmentName: "데이터과학과",
    confidence: "B",
    sourceUrl: "https://datascience.inu.ac.kr/datascience/3710/subview.do",
    rules: [
      {
        startYear: 2020,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  TAX_ACCOUNTING: {
    departmentName: "세무회계학과",
    confidence: "B",
    sourceUrl: "https://tax.inu.ac.kr/tax/3660/subview.do",
    rules: [
      {
        startYear: 2020,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
          minRequiredMajorCredits: 27,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  TECHNO_MANAGEMENT: {
    departmentName: "테크노경영학과",
    confidence: "C",
    sourceUrl: null,
    rules: [
      {
        startYear: 2020,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  FINE_ARTS: {
    departmentName: "한국화전공",
    confidence: "B",
    sourceUrl: "https://finearts.inu.ac.kr/finearts/4118/subview.do",
    rules: [
      {
        startYear: 2019,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  DESIGN: {
    departmentName: "디자인학부",
    confidence: "B",
    sourceUrl: "https://design.inu.ac.kr/design/4011/subview.do",
    rules: [
      {
        startYear: 2020,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "기초교양",
              credits: 8,
              category: "기타",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 600,
          toeicSpeaking: 110,
          opic: "IL",
        },
      },
    ],
  },
  PERFORMING_ART: {
    departmentName: "공연예술학과",
    confidence: "C",
    sourceUrl: null,
    rules: [
      {
        startYear: 2019,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  SPORTS_SCIENCE: {
    departmentName: "스포츠과학부",
    confidence: "B",
    sourceUrl: "https://inupe.inu.ac.kr/inupe/4192/subview.do",
    rules: [
      {
        startYear: 2019,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  HEALTH_EXERCISE: {
    departmentName: "운동건강학부",
    confidence: "C",
    sourceUrl: "https://uiex.inu.ac.kr/uiex/4061/subview.do",
    rules: [
      {
        startYear: 2019,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어(대학영어 또는 Academic English)",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  KOREAN_EDUCATION: {
    departmentName: "국어교육과",
    confidence: "B",
    sourceUrl: "https://edukorean.inu.ac.kr/edukorean/4240/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 2,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "대학영어",
              credits: 4,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  ENGLISH_EDUCATION: {
    departmentName: "영어교육과",
    confidence: "B",
    sourceUrl: "https://eduenglish.inu.ac.kr/eduenglish/4414/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
    ],
  },
  JAPANESE_EDUCATION: {
    departmentName: "일어교육과",
    confidence: "B",
    sourceUrl: "https://edujapanese.inu.ac.kr/edujapanese/4600/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "AI시대의글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화1,2",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "AI사고와데이터리터러시",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "AI와인간중심윤리",
              credits: 2,
              category: "기타",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  MATH_EDUCATION: {
    departmentName: "수학교육과",
    confidence: "C",
    sourceUrl: "https://mathedu.inu.ac.kr/edumath/4303/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  PHYSICAL_EDUCATION: {
    departmentName: "체육교육과",
    confidence: "B",
    sourceUrl: "https://eduphysical.inu.ac.kr/eduphysical/4649/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 2,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "대학영어",
              credits: 4,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  EARLY_CHILDHOOD_EDUCATION: {
    departmentName: "유아교육과",
    confidence: "B",
    sourceUrl: "https://ece.inu.ac.kr/ece/4480/subview.do",
    rules: [
      {
        startYear: 2016,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 2,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "영어",
              credits: 6,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  HISTORY_EDUCATION: {
    departmentName: "역사교육과",
    confidence: "B",
    sourceUrl: "https://eduhistory.inu.ac.kr/eduhistory/7992/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  ETHICS_EDUCATION: {
    departmentName: "윤리교육과",
    confidence: "B",
    sourceUrl: "https://eduethics.inu.ac.kr/inu/666/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  URBAN_ADMINISTRATION: {
    departmentName: "도시행정학과",
    confidence: "B",
    sourceUrl: "https://urban.inu.ac.kr/urban/4900/subview.do",
    rules: [
      {
        startYear: 2010,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  CIVIL_ENVIRONMENT_ENGINEERING: {
    departmentName: "건설환경공학전공(도시환경공학부)",
    confidence: "B",
    sourceUrl: "https://www.inu.ac.kr/inu/666/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  ENVIRONMENT_ENGINEERING: {
    departmentName: "환경공학전공",
    confidence: "B",
    sourceUrl: "https://et.inu.ac.kr/et/7723/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 66,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  URBAN_ENGINEERING: {
    departmentName: "도시공학과",
    confidence: "B",
    sourceUrl: "https://scity.inu.ac.kr/ucv/4748/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
      },
    ],
  },
  URBAN_ARCHITECTURE: {
    departmentName: "건축공학(도시건축학부)",
    confidence: "A",
    sourceUrl: "https://archi.inu.ac.kr/archi/4843/subview.do",
    rules: [
      {
        startYear: 2011,
        endYear: 2019,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 140,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
        },
      },
      {
        startYear: 2020,
        endYear: 2022,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
        },
      },
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
        },
      },
    ],
  },
  LIFE_SCIENCE: {
    departmentName: "생명과학부(생명과학전공)",
    confidence: "B",
    sourceUrl: "https://life.inu.ac.kr/life/4962/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  LIFE_SCIENCE_MOLECULAR: {
    departmentName: "생명과학부(분자의생명전공)",
    confidence: "B",
    sourceUrl: "https://life.inu.ac.kr/life/4962/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 63,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  BIOENGINEERING: {
    departmentName: "생명공학부(생명공학전공)",
    confidence: "B",
    sourceUrl: "https://bioeng.inu.ac.kr/engineeringlife/5129/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  BIOENGINEERING_NANO: {
    departmentName: "생명공학부(나노바이오공학전공)",
    confidence: "B",
    sourceUrl: "https://nanobio.inu.ac.kr/nanobio/5078/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "자연·공학계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "대학수학",
              credits: 6,
              category: "수학",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 72,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  LIBERAL_ARTS: {
    departmentName: "자유전공학부",
    confidence: "C",
    sourceUrl: null,
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  INTERNATIONAL_LIBERAL_ARTS: {
    departmentName: "국제자유전공학부",
    confidence: "C",
    sourceUrl: null,
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  CONVERGENCE: {
    departmentName: "융합학부",
    confidence: "C",
    sourceUrl: null,
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
  NORTHEAST_ASIAN_TRADE: {
    departmentName: "동북아국제통상전공",
    confidence: "B",
    sourceUrl: "https://sns.inu.ac.kr/nas/3794/subview.do",
    rules: [
      {
        startYear: 2020,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "국어",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 850,
          toeicSpeaking: 150,
          opic: "IH",
        },
      },
    ],
  },
  SMART_LOGISTICS_ENGINEERING: {
    departmentName: "스마트물류공학전공",
    confidence: "B",
    sourceUrl: "https://slog.inu.ac.kr/slog/3838/subview.do",
    rules: [
      {
        startYear: 2024,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기 이론과 실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "컴퓨터적 사고와 SW",
              credits: 2,
              category: "SW",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화1,2",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
          minRequiredMajorCredits: 40,
        },
        englishCertification: {
          toeic: 700,
          toeicSpeaking: 130,
          opic: "IM",
        },
      },
    ],
  },
  IBE: {
    departmentName: "IBE전공(국제통상학부)",
    confidence: "A",
    sourceUrl: "https://ibe.inu.ac.kr/ibe/3878/subview.do",
    rules: [
      {
        startYear: 2017,
        endYear: 2018,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          requiredGeneralCourses: [
            {
              courseName: "Theory and Practice of Writing",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "College English Conversation 1,2",
              credits: 2,
              category: "영어",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
      {
        startYear: 2019,
        endYear: 2019,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 135,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "Theory and Practice of Writing",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "College English Conversation 1,2",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "Computational Thinking and SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
      {
        startYear: 2020,
        endYear: 2022,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "Theory and Practice of Writing",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "College English Conversation 1,2",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "Computational Thinking and SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
      {
        startYear: 2023,
        endYear: 2023,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "Theory and Practice of Writing",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "College English Conversation 1,2",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "Computational Thinking and SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
      {
        startYear: 2024,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "Theory and Practice of Writing",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "College English Conversation 1,2",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "Computational Thinking and SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
          minRequiredMajorCredits: 31,
        },
        englishCertification: {
          toeic: 800,
          toeicSpeaking: 140,
          opic: "IH",
        },
      },
    ],
  },
  LAW: {
    departmentName: "법학부",
    confidence: "B",
    sourceUrl: "https://law.inu.ac.kr/inu/666/subview.do",
    rules: [
      {
        startYear: 2023,
        endYear: 2099,
        track: "인문·사회·예체능계열",
        generalRequirements: {
          minGeneralCredits: 30,
          maxGeneralCredits: 55,
          minTotalCredits: 130,
          minCoreGeneralCount: 3,
          requiredGeneralCourses: [
            {
              courseName: "글쓰기이론과실제",
              credits: 2,
              category: "국어",
            },
            {
              courseName: "Academic English",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "대학영어회화",
              credits: 2,
              category: "영어",
            },
            {
              courseName: "컴퓨팅적사고와 SW",
              credits: 2,
              category: "SW",
            },
          ],
        },
        majorRequirements: {
          minMajorCredits: 60,
        },
      },
    ],
  },
};
