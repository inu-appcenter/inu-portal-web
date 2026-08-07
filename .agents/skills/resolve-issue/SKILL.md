---
name: resolve-issue
description: >-
  Procedure for looking up GitHub issues, validating backend APIs with dev Swagger and Auth/refresh headers, implementing fixes, running unit tests, and creating Pull Requests.
---

# GitHub Issue & API Verification Workflow

This skill outlines the standard workflow for resolving GitHub issues in `inu-portal-web`, validating backend endpoints via Swagger/API, running unit tests, and submitting Pull Requests.

---

## 1. Authentication & API Inspection
- **Dev Swagger UI**: `https://portal-dev.inuappcenter.kr/swagger-ui/index.html#/`
- **Authentication Headers**:
  - `Auth`: Access token string
  - `refresh`: Refresh token string
- When testing endpoints against `https://portal-dev.inuappcenter.kr/api/*`, include `Auth` and `refresh` headers.

---

## 2. Issue Resolution: Major Course Offering Sorting (#258)
- Backend endpoint `GET /api/course-offerings` sorts offerings automatically by:
  1. `categoryOrder` (asc): Major (전공 = 1) -> General (교양 = 2) -> Other (기타 = 3)
  2. `hyNameOrder` (asc): All (전체/공통/전학년 = 1) -> 1학년 (2) -> 2학년 (3) -> 3학년 (4) -> 4학년 (5) -> Other (99)
  3. `courseTitle` (asc): Alphabetical course title order
- Utility helper `sortCourseOfferingsByGradeAndCategory` in `src/utils/courseSearchResult.ts` enforces this ordering.
- Mock API layer (`getCourseOfferingsPage`) sorts mock data with `sortCourseOfferingsByGradeAndCategory`.

---

## 3. Testing & PR Process
- Run Vitest unit tests: `npx vitest run`
- Run TypeScript check: `npx tsc --noEmit`
- Commit changes and push feature branch (e.g. `feat/258-sort-major-courses-by-grade`).
- Open PR targeting `dev` branch.
