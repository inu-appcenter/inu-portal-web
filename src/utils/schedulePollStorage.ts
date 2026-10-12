import { safeLocalStorage } from "@/utils/safeStorage";

// 시간 맞추기에서 서버가 아직 알려 주지 않는 값을 이 기기에 기억해 둔다.
// - 참여 요청 카드를 보낸 채팅방: 결과 공유 때 미리 선택해 주기 위해(PRD 5-1)
// - '내 시간표에 추가'한 결과 버전: 카드에 '추가됨'을 바로 보여 주기 위해(FR-072)
// - 내가 만들었거나 참여한 조율의 ID: 서버에 '내 조율 목록' API(명세 3-12)가 아직 없어서
//   목록 화면을 이 기기에서 연 조율로 채우기 위해
// 서버가 조회 응답에 내려 주게 되면 이 파일은 지운다.

const sharedRoomsKey = (pollId: number) => `intipPollSharedRooms:${pollId}`;
const timetableAddedKey = (pollId: number, version: number) =>
  `intipPollTimetableAdded:${pollId}:${version}`;

const knownPollsKey = (memberId: number) => `intipPollKnown:${memberId}`;
const MAX_KNOWN_POLLS = 50;

/** 이 기기에서 만들었거나 참여한 조율 ID. 최근에 본 것이 앞에 온다. */
export const getKnownPollIds = (memberId: number): number[] => {
  try {
    const parsed = JSON.parse(
      safeLocalStorage.getItem(knownPollsKey(memberId)) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
};

export const rememberKnownPoll = (memberId: number, pollId: number) => {
  const current = getKnownPollIds(memberId);
  if (current[0] === pollId) return;
  const next = [pollId, ...current.filter((id) => id !== pollId)].slice(
    0,
    MAX_KNOWN_POLLS,
  );
  safeLocalStorage.setItem(knownPollsKey(memberId), JSON.stringify(next));
};

export const forgetKnownPoll = (memberId: number, pollId: number) => {
  const next = getKnownPollIds(memberId).filter((id) => id !== pollId);
  safeLocalStorage.setItem(knownPollsKey(memberId), JSON.stringify(next));
};

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
