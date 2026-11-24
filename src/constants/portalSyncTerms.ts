/**
 * 포털 정보 불러오기 동의 시트의 항목과 상세 약관 문구.
 *
 * 개인정보 보호법 제15조 제2항에 따라 목적·항목·보유 기간·거부할 권리와 그 불이익을 알린다.
 * 문구는 실제 동작과 같아야 한다. 보내거나 저장하는 정보가 바뀌면 여기를 고치고
 * PORTAL_SYNC_CONSENT_VERSION을 올린다.
 * - 불러오는 정보: apis/mobileAgentBridge.ts의 fetch*FromApp, apis/lms.ts, apis/library.ts
 */

export type PortalSyncTermKey = "portal";

export interface PortalSyncTermRow {
  label: string;
  /** 줄마다 한 항목 */
  lines: string[];
}

export interface PortalSyncTerm {
  key: PortalSyncTermKey;
  required: boolean;
  /** 시트 체크 항목 문구 */
  label: string;
  /** 상세 화면 제목 */
  title: string;
  intro: string;
  rows: PortalSyncTermRow[];
  footer: string;
}

export const PORTAL_SYNC_TERMS: readonly PortalSyncTerm[] = [
  {
    key: "portal",
    required: true,
    label: "포털 정보 불러오기 필수동의",
    title: "포털 정보 불러오기 동의",
    intro:
      "인팁 앱이 내 휴대폰에서 학교 사이트에 접속해 내 정보를 대신 불러와요. 불러오는 동안 인팁 서버를 거치지 않아요.",
    rows: [
      {
        label: "이용 목적",
        lines: [
          "학교 사이트에 들어가지 않고 인팁 앱에서 내 학교 정보를 보기 위해서예요.",
        ],
      },
      {
        label: "저장하는 정보",
        lines: ["포털 학번과 비밀번호"],
      },
      {
        label: "불러오는 정보",
        lines: [
          "포털: 학적(이름, 학번, 소속, 학적 상태 등), 성적, 수강 과목과 시간표, 장학, 졸업 요건, 기숙사 정보",
          "이러닝: 수강 강좌, 과제 마감",
          "도서관: 열람실 좌석, 스터디룸 예약",
        ],
      },
      {
        label: "보관 위치",
        lines: [
          "이 휴대폰에만 보관해요.",
          "비밀번호는 휴대폰 보안영역(iOS 키체인, Android 키스토어)에 저장해요.",
        ],
      },
      {
        label: "보관 기간",
        lines: [
          "포털 연결을 해제하거나 앱을 삭제할 때까지예요.",
          "연결을 해제하면 이 휴대폰에 저장된 포털 계정과 불러온 정보가 지워져요.",
        ],
      },
      {
        label: "함께 알아두세요",
        lines: [
          "포털·이러닝·도서관에 같은 계정을 써요.",
          "불러온 정보는 내가 인팁에 저장할 때만 인팁 서버로 보내요.",
        ],
      },
      {
        label: "동의하지 않으면",
        lines: [
          "동의하지 않을 수 있어요. 이 경우 포털·이러닝·도서관 연동 기능은 쓸 수 없지만, 인팁의 다른 기능은 그대로 쓸 수 있어요.",
        ],
      },
    ],
    footer: "마이페이지 > 포털 계정 관리에서 언제든 연결을 해제할 수 있어요.",
  },
];

export const PORTAL_SYNC_POLICY_NOTE =
  "불러온 포털 정보는 이 휴대폰에만 보관돼요. 인팁에는 내가 저장한 정보만 올라가요.";

export function getPortalSyncTerm(key: PortalSyncTermKey): PortalSyncTerm {
  const term = PORTAL_SYNC_TERMS.find((t) => t.key === key);
  if (!term) throw new Error(`Unknown portal sync term: ${key}`);
  return term;
}
