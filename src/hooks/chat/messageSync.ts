import { getChatMessages, getPreviousMessages } from "@/apis/chat";
import { ChatMessage, ChatRoom } from "@/types/chat";

/** 서버 페이지 크기(이전 메시지 조회 단위) */
export const PAGE_SIZE = 20;

/** 빈 구간을 메울 때 최대 몇 페이지까지 거슬러 올라갈지 */
const MAX_GAP_FILL_PAGES = 10;

/** `ApiResponse<T>` 래퍼로 오기도 하고 알맹이가 그대로 오기도 해서 양쪽을 모두 받는다. */
export const unwrapResponse = <T>(response: unknown): T =>
  (response as { data?: T } | null)?.data ?? (response as T);

/**
 * messageId를 꺼낸다. 값이 없는 메시지는 중복 판정을 할 수 없어 제외한다.
 *
 * messageId는 문자열이다. 18자리 스노우플레이크라 Number로 담을 수 없고
 * (MAX_SAFE_INTEGER는 16자리) 변환하면 하위 자릿수가 잘려 서로 다른 메시지가
 * 같은 값이 된다. 그래서 어떤 형태로 오든 문자열로 정규화해서 다룬다.
 */
const idOf = (msg: ChatMessage | null | undefined): string | null => {
  const raw = msg?.messageId;
  if (raw === null || raw === undefined || raw === "") return null;
  return String(raw);
};

const isDigits = (value: string) => /^\d+$/.test(value);

/**
 * messageId 오름차순 비교자.
 * 자릿수가 커도 정확하도록 BigInt로 비교한다. (`Number(a) - Number(b)`는
 * 인접한 두 스노우플레이크를 같은 값으로 만들어 정렬을 망가뜨린다)
 */
export const compareMessageIds = (a: string, b: string): number => {
  if (isDigits(a) && isDigits(b)) {
    const left = BigInt(a);
    const right = BigInt(b);
    return left < right ? -1 : left > right ? 1 : 0;
  }
  return a < b ? -1 : a > b ? 1 : 0;
};

const pickId = (
  list: ChatMessage[],
  prefer: (candidate: string, current: string) => boolean,
): string | null =>
  list.reduce<string | null>((picked, msg) => {
    const id = idOf(msg);
    if (id === null) return picked;
    return picked === null || prefer(id, picked) ? id : picked;
  }, null);

/** 목록에서 가장 오래된(작은) messageId. 비어 있으면 null. */
export const oldestMessageId = (list: ChatMessage[]): string | null =>
  pickId(list, (candidate, current) => compareMessageIds(candidate, current) < 0);

/** 목록에서 가장 최신(큰) messageId. 비어 있으면 null. */
export const newestMessageId = (list: ChatMessage[]): string | null =>
  pickId(list, (candidate, current) => compareMessageIds(candidate, current) > 0);

/**
 * 두 목록을 messageId 기준으로 합쳐 오름차순으로 정규화한다.
 *
 * 목록을 통째로 교체하지 않는 게 핵심이다. 최신 페이지로 덮어쓰면
 * 무한스크롤로 불러온 과거 메시지가 날아간다.
 *
 * 실제로 바뀐 내용이 없으면 `prev`를 그대로 돌려줘 참조 동일성을 유지한다.
 * (`[messages]`를 의존하는 렌더/이펙트가 헛돌지 않도록)
 */
export const mergeMessages = (
  prev: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] => {
  if (incoming.length === 0) return prev;

  const byId = new Map<string, ChatMessage>();
  for (const msg of prev) {
    const id = idOf(msg);
    if (id !== null) byId.set(id, msg);
  }

  let changed = false;
  for (const msg of incoming) {
    const id = idOf(msg);
    if (id === null) {
      // 여기서 조용히 버리면 화면이 통째로 비어버린다. 눈에 띄게 남긴다.
      console.warn("[chat] messageId 없는 메시지를 건너뜁니다:", msg);
      continue;
    }

    const existing = byId.get(id);
    // 소켓 payload가 REST 응답보다 필드가 적을 수 있어 얕은 병합으로 보존한다.
    const merged = existing ? { ...existing, ...msg } : msg;

    if (!existing || JSON.stringify(existing) !== JSON.stringify(merged)) {
      changed = true;
    }
    byId.set(id, merged);
  }

  if (!changed && byId.size === prev.length) return prev;

  return [...byId.entries()]
    .sort(([a], [b]) => compareMessageIds(a, b))
    .map(([, msg]) => msg);
};

export type RoomSnapshot = {
  /** 응답이 메시지 배열만 담고 있던 경우 null */
  room: ChatRoom | null;
  messages: ChatMessage[];
};

/**
 * 방 정보와 최신 메시지를 가져온다.
 *
 * `knownNewestId`가 주어지면 받아온 페이지가 그 지점과 이어질 때까지
 * 이전 메시지 API로 거슬러 올라가 빈 구간(gap)을 메운다.
 * 소켓이 끊겨 있던 동안 최신 한 페이지보다 많은 메시지가 쌓였을 때 필요하다.
 *
 * @param isAborted 중간에 true가 되면 남은 요청을 포기하고 null을 반환한다.
 */
export const fetchRoomSnapshot = async (
  roomId: string,
  knownNewestId: string | null,
  isAborted: () => boolean = () => false,
): Promise<RoomSnapshot | null> => {
  const payload = unwrapResponse<ChatRoom | ChatMessage[]>(
    await getChatMessages(roomId),
  );
  if (isAborted()) return null;

  const room = Array.isArray(payload) ? null : (payload ?? null);
  const latest: ChatMessage[] = Array.isArray(payload)
    ? payload
    : Array.isArray(room?.messages)
      ? room.messages
      : [];

  let messages = latest;
  let oldestFetchedId = oldestMessageId(latest);

  for (let page = 0; page < MAX_GAP_FILL_PAGES; page += 1) {
    // 받아온 페이지의 가장 오래된 메시지가 이미 아는 최신 메시지보다도 뒤에 있다면
    // 두 구간이 겹치지 않는다 = 사이에 구멍이 있다.
    const hasGap =
      knownNewestId !== null &&
      oldestFetchedId !== null &&
      compareMessageIds(oldestFetchedId, knownNewestId) > 0;
    if (!hasGap) break;

    const older =
      unwrapResponse<ChatMessage[]>(
        await getPreviousMessages(roomId, oldestFetchedId as string),
      ) ?? [];
    if (isAborted()) return null;
    if (older.length === 0) break;

    messages = [...older, ...messages];
    oldestFetchedId = oldestMessageId(older);

    // 마지막 페이지까지 왔으면 더 거슬러 올라갈 것이 없다.
    if (older.length < PAGE_SIZE) break;
  }

  return { room, messages };
};
