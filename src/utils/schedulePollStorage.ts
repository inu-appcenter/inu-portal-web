import { safeLocalStorage } from "@/utils/safeStorage";

// 시간 맞추기에서 서버가 아직 알려 주지 않는 값을 이 기기에 기억해 둔다.
// - 참여 요청 카드를 보낸 채팅방: 결과 공유 때 미리 선택해 주기 위해(PRD 5-1)
// - '내 시간표에 추가'한 결과 버전: 카드에 '추가됨'을 바로 보여 주기 위해(FR-072)
// 서버가 조회 응답에 내려 주게 되면 이 파일은 지운다.

const sharedRoomsKey = (pollId: number) => `intipPollSharedRooms:${pollId}`;
const timetableAddedKey = (pollId: number, version: number) =>
  `intipPollTimetableAdded:${pollId}:${version}`;

export const getPollSharedRoomIds = (pollId: number): number[] => {
  try {
    const parsed = JSON.parse(safeLocalStorage.getItem(sharedRoomsKey(pollId)) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
};

export const addPollSharedRoomIds = (pollId: number, roomIds: number[]) => {
  const merged = [...new Set([...getPollSharedRoomIds(pollId), ...roomIds])];
  safeLocalStorage.setItem(sharedRoomsKey(pollId), JSON.stringify(merged));
};

export const isPollAddedToTimetable = (pollId: number, version: number) =>
  safeLocalStorage.getItem(timetableAddedKey(pollId, version)) === "1";

export const markPollAddedToTimetable = (pollId: number, version: number) =>
  safeLocalStorage.setItem(timetableAddedKey(pollId, version), "1");
