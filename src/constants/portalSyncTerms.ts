/**
 * 포털 정보 불러오기 동의 시트의 항목과 상세 약관 문구.
 *
 * 개인정보 보호법 제15조 제2항에 따라 목적·항목·보유 기간·거부할 권리와 그 불이익을 알린다.
 * 문구는 실제 동작과 같아야 한다. 보내거나 저장하는 정보가 바뀌면 여기를 고치고
 * PORTAL_SYNC_CONSENT_VERSION을 올린다.
 * - 불러오는 정보: apis/mobileAgentBridge.ts의 fetch*FromApp, apis/lms.ts, apis/library.ts
 * - AI로 보내는 정보: mobileAgentBridge.ts의 toAnonymousAcademicContext, resolveClientContext
 * - AI 서버 쪽 약속(가명 기기 ID, 로그 미보관, 학습·사람 검토 없음)은 inu-portal-server의
 *   InuChatAiService·AgentService와 맞아야 한다(inu-portal-server#522, #523).
 */

export type PortalSyncTermKey = "portal" | "ai";

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
          "불러온 정보는 내가 인팁에 저장하거나 AI 채팅 활용에 동의했을 때만 인팁 서버로 보내요.",
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
  {
    key: "ai",
    required: false,
    label: "AI 채팅 학적 활용 선택동의",
    title: "AI 채팅 학적 활용 동의 (선택)",
    intro:
      "AI 채팅에 내 학적 요약을 함께 보내, “졸업까지 몇 학점 남았어?” 같은 질문에 내 상황에 맞게 답해요.",
    rows: [
      {
        label: "이용 목적",
        lines: ["AI 채팅이 내 학적과 수업에 맞게 답하기 위해서예요."],
      },
      {
        label: "보내는 정보",
        lines: [
          "학적 요약: 입학연도, 단과대·학과, 학적 상태, 이수 학기, 취득 학점, 평점, 최근 학적 변동, 지도교수",
          "이러닝: 수강 강좌, 2주 안의 과제 일정",
        ],
      },
      {
        label: "보내지 않는 정보",
        lines: [
          "이름, 학번, 생년월일, 연락처, 포털 비밀번호",
          "내 계정도 알 수 없도록, 계정 대신 임의의 값으로 바꿔 보내요.",
        ],
      },
      {
        label: "보내는 곳",
        lines: [
          "학교 전산원 내부 서버에서 인팁이 직접 운영하는 AI 모델(Gemma)",
          "외부 AI 회사로는 보내지 않아요.",
        ],
      },
      {
        label: "보내는 때",
        lines: ["이 동의를 켠 상태로 AI 채팅에 메시지를 보낼 때"],
      },
      {
        label: "AI 학습·검토",
        lines: [
          "AI 학습에 쓰지 않아요.",
          "사람이 대화 내용을 보거나 검토하지 않아요.",
        ],
      },
      {
        label: "보관 기간",
        lines: [
          "답변을 만드는 데만 쓰고 저장하지 않아요.",
          "서버 기록(로그)에도 대화 내용과 학적 정보는 남기지 않아요.",
        ],
      },
      {
        label: "동의하지 않으면",
        lines: [
          "동의하지 않아도 돼요. 학적·이러닝 정보가 필요한 질문에는 답할 수 없지만, AI 채팅과 다른 기능은 그대로 쓸 수 있어요.",
        ],
      },
    ],
    footer: "마이페이지 > 포털 계정 관리에서 언제든 끄고 켤 수 있어요.",
  },
];

export const PORTAL_SYNC_POLICY_NOTE =
  "불러온 포털 정보는 이 휴대폰에만 보관돼요. 인팁에는 내가 저장한 정보만 올라가요. 선택 항목은 동의하지 않아도 다른 기능을 그대로 쓸 수 있어요.";

export function getPortalSyncTerm(key: PortalSyncTermKey): PortalSyncTerm {
  const term = PORTAL_SYNC_TERMS.find((t) => t.key === key);
  if (!term) throw new Error(`Unknown portal sync term: ${key}`);
  return term;
}
