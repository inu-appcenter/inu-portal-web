# 포털 ERP(Nexacro) 생활원 및 각종 제출/신청(CUD) 연동 가이드

> **작성일자**: 2026-10-07  
> **시스템 대상**: 인천대학교 종합정보시스템(ERP Nexacro) & INTIP 모바일/웹 브릿지  
> **문서 목적**: 포털 생활원 사생정보 조회 및 추후 입사서약서 제출, 외박 신청, 시설 보수 등 쓰기(CUD) 기능 구현을 위한 기술 명세 및 가이드

---

## 1. 아키텍처 개요 및 무수정 원칙

```mermaid
flowchart LR
    A["inu-portal-web<br/>(웹 클라이언트)"] -->|batchRequests<br/>(URL, Method, SSV Body)| B["intip-mobile-app<br/>(WebView Scraper)"]
    B -->|SSO 세션 / 쿠키 자동 주입<br/>WMONID, REQFOUNDATION| C["학교 ERP 서버<br/>(erp.inu.ac.kr:8443)"]
    C -->|SSV 응답 데이터셋<br/>ErrorCode, ErrorMsg| B
    B -->|ACADEMIC_RESULT| A
```

- **App 무수정 원칙**: `intip-mobile-app`의 `AcademicScraperWebView`는 `target.batchRequests`를 통해 전달받은 임의의 URL, Method, Body를 그대로 ERP에 전송하는 **범용 브라우저 익스큐터**입니다.
- **트랜잭션(CUD) 가능 여부**: 웹에서 전송할 패킷의 `_RowType_`을 `U`(Update) 또는 `I`(Insert)로 설정하고 저장용 `.do` URL을 호출하면, 네이티브 앱 코드 변경 없이 100% 학교 서버에 반영됩니다.

---

## 2. Nexacro SSV 패킷 구조 및 RowType 규격

### 2.1 구분자 (Separator)
- **RS (Record Separator)**: `0x1E` (`\x1e`) - 행 및 파라미터 간 구분자
- **US (Unit Separator)**: `0x1F` (`\x1f`) - 컬럼(필드) 간 구분자

### 2.2 행 상태 플래그 (`_RowType_`)
| RowType | 명칭 | 용도 | 사용 예시 |
|:---:|:---:|:---|:---|
| **`N`** | Normal | 단순 조회용 조건 또는 조회 결과 데이터 | 조회 파라미터 `DS_COND` |
| **`I`** | Insert | 신규 데이터 등록 / 신규 신청 | 외박 신청, 고장 수리 접수 |
| **`U`** | Update | 기존 데이터 수정 / 상태 변경 / 동의 | 입사서약서 서명/동의 (`consntYn: 1`) |
| **`D`** | Delete | 기존 데이터 삭제 / 신청 취소 | 외박 신청 취소 |

---

## 3. 대표적인 제출 및 신청(CUD) 기능 명세

### 3.1 기숙사 입사서약서 제출 / 동의

- **관련 메뉴**: 부속행정 > 생활원 > 사생관리 > 사생정보조회(학생) (`M001035`, `P000886`)
- **조회 URL**: `/aff/dmty/Dmsm0120Ctr/findJoinPledgeData.do`
- **저장 URL (예상)**: `/aff/dmty/Dmsm0120Ctr/saveJoinPledgeData.do` (또는 화면 상의 저장 서비스)
- **전송 데이터셋**: `DS_DATA`
- **요청 패킷 구조 예시**:
  ```text
  SSV:utf-8\x1e
  Dataset:DS_DATA\x1e
  _RowType_\x1fstuno\x1fconsntYn\x1fconsntDt\x1e
  U\x1f202001518\x1f1\x1f20261007\x1e
  ```
- **처리 흐름**:
  1. 사용자에게 서약서 본문 제시 및 동의 체크박스 활성화.
  2. [서약서 제출하기] 버튼 클릭 시 `batchRequests`로 저장 요청 전송.
  3. 서버 반환 `ErrorCode: 0` 확인 후 화면 즉시 갱신.

---

### 3.2 기숙사 외박 신청 및 취소

- **관련 메뉴**: 부속행정 > 생활원 > 사생관리 > 외박신청 (`M001035` 또는 `M001036`)
- **조회 URL**: `/aff/dmty/Dmsm0110Ctr/findDmty205List.do` (또는 `findSleepOverList.do`)
- **저장 URL**: `/aff/dmty/Dmsm0110Ctr/saveDmty205List.do`
- **전송 데이터셋**: `DS_DMTY205`
- **주요 컬럼**:
  - `yy`: 신청 연도 (예: 2026)
  - `tmGbn`: 학기 구분 (10: 1학기, 20: 2학기)
  - `stuno`: 학번
  - `domstuNo`: 사생번호
  - `frDt`: 외박 시작일자 (`YYYYMMDD`)
  - `toDt`: 외박 종료일자 (`YYYYMMDD`)
  - `slpGbn`: 외박 구분코드 (귀가, 여행 등)
  - `slpResn`: 외박 사유 텍스트
  - `emerHandpNo`: 비상연락처
- **신청(Insert) 패킷**:
  ```text
  SSV:utf-8\x1e
  Dataset:DS_DMTY205\x1e
  _RowType_\x1fstuno\x1ffrDt\x1ftoDt\x1fslpGbn\x1fslpResn\x1e
  I\x1f202001518\x1f20261010\x1f20261012\x1f01\x1f본가 귀가\x1e
  ```
- **취소(Delete) 패킷**:
  ```text
  _RowType_: D\x1f[식별 키 컬럼들]
  ```

---

### 3.3 기숙사 호실 시설보수(수리) 접수

- **관련 메뉴**: 부속행정 > 생활원 > 시설관리 > 호실보수신청
- **전송 컬럼**:
  - `dormBdCd`: 건물코드
  - `roomNo`: 호실
  - `bldPartGbn`: 보수 위치 (전등, 에어컨, 창문, 화장실 등)
  - `reqCtnt`: 고장 내용 및 요청사항
  - `telNo`: 연락처

---

## 4. 프론트엔드 브릿지 호출 코드 패턴 (웹)

```typescript
// 예시: 입사서약서 제출 트랜잭션 함수
export async function submitDormitoryPledge(consentDate: string): Promise<AgentActionResult<boolean>> {
  const RS = "\x1e";
  const US = "\x1f";
  
  // Nexacro 업데이트 바디 구성
  const requestBody = [
    "Dataset:DS_DATA",
    `_RowType_${US}consntYn${US}consntDt`,
    `U${US}1${US}${consentDate}`,
  ].join(RS) + RS;

  const instruction = {
    actionId: "PORTAL_GET_FULL_ACADEMIC_RECORD", // 앱 스크레이퍼 batchRequests 분기 트리거용
    authDomain: "PORTAL",
    request: {
      url: "https://erp.inu.ac.kr:8443/aff/dmty/Dmsm0120Ctr/saveJoinPledgeData.do?menuId=M001035&pgmId=P000886",
      method: "POST",
      batchRequests: [
        {
          key: "savePledge",
          url: "/aff/dmty/Dmsm0120Ctr/saveJoinPledgeData.do",
          menuId: "M001035",
          pgmId: "P000886",
          body: requestBody,
        },
      ],
    },
  };

  const res = await sendBridgeAction<any>("executeAgentAction", { instruction }, 30000);
  if (!res.success) {
    return { success: false, errorMessage: res.errorMessage };
  }

  // 서버 응답 ErrorCode 확인 (0: 성공, 음수: 실패)
  const rawText = res.data?.savePledge || res.data || "";
  const match = rawText.match(/ErrorCode=([^(\x1e|\x1f)]+)/);
  const errorCode = match ? match[1].trim() : "0";

  if (errorCode !== "0") {
    const msgMatch = rawText.match(/ErrorMsg=([^(\x1e|\x1f)]+)/);
    const errorMsg = msgMatch ? msgMatch[1].trim() : "저장 실패";
    return { success: false, errorMessage: errorMsg };
  }

  return { success: true, data: true };
}
```

---

## 5. 구현 시 필수 주의사항 및 방어 로직

1. **사용자 확인(UX 안전장치)**:
   - 읽기(조회)와 달리 쓰기(CUD)는 실제 학교 DB에 반영되므로, 실행 전 모달(`정말 제출하시겠습니까?`)을 반드시 표시.
2. **서버 응답 ErrorCode / ErrorMsg 파싱**:
   - 학교 서버는 오류 발생 시 HTTP 200과 함께 SSV 본문에 `ErrorCode=-100`, `ErrorMsg=외박 신청 가능 일수를 초과하였습니다`를 내려줍니다.
   - 따라서 본문의 `ErrorCode`가 `0`인지 반드시 검증해야 합니다.
3. **학번/세션 위변조 방지**:
   - 모바일 앱 내부의 보안 세션(`PortalSecureStore`)에서 로그인된 학번과 파라미터가 일치해야 ERP 서버에서 인가됩니다.
