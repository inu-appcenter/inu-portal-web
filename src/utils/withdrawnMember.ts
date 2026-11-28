// 탈퇴한 회원 표시 (서버 #541): 서버는 탈퇴 시 레코드를 남기고 닉네임을 '탈퇴한 사용자'로,
// 프로필 이미지를 기본값(fireId 1)으로 바꾼다. 응답에 탈퇴 여부 필드가 없어 닉네임으로 판별한다.
// 서버가 다른 회원이 이 닉네임을 못 쓰게 막으므로(금지어 '탈퇴한사용자') 닉네임만으로 충분하다.

export const WITHDRAWN_NICKNAME = "탈퇴한 사용자";

export const isWithdrawnNickname = (name: string | null | undefined): boolean =>
  (name ?? "").replace(/\s/g, "") === WITHDRAWN_NICKNAME.replace(/\s/g, "");
