import type {
  SuggestionCategory,
  SuggestionPage,
  SuggestionRequest,
  SuggestionResponse,
  SuggestionStatus,
} from "@/types/suggestions";

// apis/suggestions.ts를 model 레이어에서 대체하는 인메모리 저장소. 새로고침 시 초기화된다.
// 목 모드는 세션이 없으므로 "내 의견"과 관리자 전체 목록을 같은 데이터로 본다.

const PAGE_SIZE = 8;

const seed = (
  id: number,
  category: SuggestionCategory,
  createDate: string,
  content: string,
  status: SuggestionStatus,
  memberId: number,
  memberNickname: string,
): SuggestionResponse => ({
  id,
  content,
  cheerMessage: null,
  category,
  appVersion: "2.4.0",
  osType: "IOS",
  osVersion: "17.5",
  deviceModel: null,
  status,
  createDate,
  modifiedDate: createDate,
  memberId,
  memberNickname,
  imageCount: 0,
});

let idCounter = 5;
let items: SuggestionResponse[] = [
  seed(4, "CHEER", "2026.08.10 18:02:11", "시간표 공유 기능 잘 쓰고 있어요. 감사합니다!", "RECEIVED", 1, "횃불이"),
  seed(3, "SCHOOL_INFO_ERROR", "2026.08.21 09:15:42", "7호관 위치가 지도에서 다른 건물로 표시돼요.", "COMPLETED", 1, "횃불이"),
  seed(2, "BUG_REPORT", "2026.09.02 14:30:05", "학점계산기에서 시간표 불러오기를 누르면 이전 학기 과목이 같이 들어와요.", "IN_REVIEW", 2, "인천토박이"),
  seed(1, "FEATURE_SUGGESTION", "2026.09.14 21:36:20", "시간표에서 과목을 길게 누르면 바로 색상을 바꿀 수 있으면 좋겠어요. 지금은 설정까지 들어가야 해서 번거로워요.", "RECEIVED", 1, "횃불이"),
];
const imageStore = new Map<number, File[]>();

const sorted = () =>
  [...items].sort((a, b) => b.createDate.localeCompare(a.createDate));

const formatNow = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const mockGetSuggestions = (page: number): SuggestionPage => {
  const all = sorted();
  const start = (page - 1) * PAGE_SIZE;
  return {
    pages: Math.max(1, Math.ceil(all.length / PAGE_SIZE)),
    total: all.length,
    suggestions: all.slice(start, start + PAGE_SIZE),
  };
};

export const mockGetSuggestion = (id: number): SuggestionResponse => {
  const found = items.find((s) => s.id === id);
  if (!found) throw new Error("건의사항을 찾을 수 없습니다.");
  return found;
};

export const mockCreateSuggestion = (
  body: SuggestionRequest,
  images: File[],
): number => {
  const id = idCounter++;
  const now = formatNow();
  items = [
    ...items,
    {
      id,
      content: body.content,
      cheerMessage: body.cheerMessage ?? null,
      category: body.category,
      appVersion: body.appVersion ?? null,
      osType: body.osType ?? null,
      osVersion: body.osVersion ?? null,
      deviceModel: body.deviceModel ?? null,
      status: "RECEIVED",
      createDate: now,
      modifiedDate: now,
      memberId: 1,
      memberNickname: "횃불이",
      imageCount: images.length,
    },
  ];
  imageStore.set(id, images);
  return id;
};

export const mockDeleteSuggestion = (id: number): void => {
  items = items.filter((s) => s.id !== id);
  imageStore.delete(id);
};

export const mockUpdateSuggestionStatus = (
  id: number,
  status: SuggestionStatus,
): void => {
  items = items.map((s) => (s.id === id ? { ...s, status } : s));
};

// 이미지가 없는 시드 글은 단색 SVG로 대신한다.
export const mockGetSuggestionImage = (id: number, n: number): Blob => {
  const file = imageStore.get(id)?.[n - 1];
  if (file) return file;
  return new Blob(
    [
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#dfe3e8"/></svg>',
    ],
    { type: "image/svg+xml" },
  );
};
