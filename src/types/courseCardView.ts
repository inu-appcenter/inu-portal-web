// CourseCard가 화면에 그리기 위해 실제로 필요한 것만 담은 View Model.
//
// 컴포넌트가 서버 응답 타입(Course / CourseOffering)을 그대로 props로 받으면,
// 데이터 출처가 서버 조회가 아닌 순간(위시리스트 스냅샷, 로컬 계산 결과, 목업)마다
// 쓰지도 않는 필드를 ""·0으로 채운 가짜 객체를 만들어야 한다. 그래서 카드는 자기
// UI 계약만 의존하고, 출처별 변환은 각 출처 쪽에서 책임진다.
//
// 출처에 따라 알 수 없는 정보(이수구분·학년 등)는 선택 필드로 두고, 카드는 있는 것만
// 그린다. 없는 값을 지어내지 않는 게 이 타입의 존재 이유다.

export interface CourseCardOfferingView {
  /** 개설강의 id. React key 및 액션 식별자 */
  offeringId: number;
  /** 학수번호(분반 포함). 마법사 스토어의 위시리스트 식별자이기도 하다 */
  subjectNumber: string;
  professor: string | null;
  /** "월 10:30~11:45, 수 09:00~10:15" 형태로 이미 포맷된 문자열 */
  timeStr: string;
  room: string | null;
  /** 이 분반을 담은 사람 수. 모르면 null(표시하지 않음) */
  savedCount: number | null;
  /** 마법사 위시리스트의 "필수" 여부. 해당 개념이 없는 출처는 생략한다 */
  required?: boolean;
}

export interface CourseCardView {
  courseId: number;
  title: string;
  credit: number;
  /** 이수구분("전공핵심" 등). 모르면 생략 */
  isuLabel?: string | null;
  /** 대상 학년("3학년"·"전학년"). 모르면 생략 */
  gradeLabel?: string | null;
  /** 성적 평가 방식("상대평가"·"절대평가"). 모르면 생략 */
  gradeEvaluationLabel?: string | null;
  offerings: CourseCardOfferingView[];
}
