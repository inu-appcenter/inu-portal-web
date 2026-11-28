/** 과목 편집 시트·과목 행에서 쓰는 과목 모양. 페이지의 Subject가 이 필드를 모두 갖는다. */
export interface EditableSubject {
  id: string;
  name: string;
  credits: number;
  grade: string;
  isMajor: boolean;
  excluded?: boolean;
  isuName?: string | null;
  isuFldName?: string | null;
}

/** 과목 행 배지에 보여줄 이수구분. 직접 입력한 과목은 원문이 없어 전공 여부로만 표시한다. */
export const getSubjectCategoryLabel = (
  subject: EditableSubject,
): string | null =>
  subject.isuFldName || subject.isuName || (subject.isMajor ? "전공" : null);
