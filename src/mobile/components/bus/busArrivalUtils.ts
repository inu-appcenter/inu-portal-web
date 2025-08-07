export function toTime(seconds: string | number) {
  const sec = parseInt(String(seconds), 10);
  if (sec < 0) return "도착정보 없음";
  if (sec <= 30) return "곧 도착";
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return `${min}분 ${rest}초`;
}

export function convertStatus(code: string | number) {
  const map: Record<string, "여유" | "보통" | "혼잡"> = {
    "1": "여유",
    "2": "보통",
    "3": "혼잡",
  };
  return map[String(code)];
}
