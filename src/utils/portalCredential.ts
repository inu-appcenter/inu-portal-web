/** 포털 응답 메시지가 학번·비밀번호 오류(또는 휴면 계정)인지. 이때는 저장한 계정을 지운다. */
export const isCredentialError = (message: string) =>
  ["비밀번호", "아이디", "틀렸습니다", "휴면"].some((kw) => message.includes(kw));
