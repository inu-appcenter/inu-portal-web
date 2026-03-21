# InTip (인팁) - 인천대학교 통합 포털 서비스

![InTip Logo](./public/icon.svg)

**InTip(인팁)**은 인천대학교 학생들의 편리한 대학 생활을 위해 실시간 버스 정보, 학사 공지, 식단, 시간표 등 흩어져 있는 학교 정보를 한데 모아 제공하는 통합 포털 웹 서비스입니다.

---

## 🚀 주요 기능

### 🚌 교통 및 버스 정보
- **실시간 버스**: 학교 인근 정류장의 버스 도착 정보를 실시간으로 확인.
- **셔틀버스(헬로버스)**: 교내 셔틀버스의 위치 및 노선 정보 제공.
- **상세 경로**: 주요 버스 노선 및 정거장 상세 정보 확인.

### 📋 학사 및 공지사항
- **공지사항 통합**: 학교 전체 공지 및 학과별 공지를 한곳에서 확인.
- **맞춤형 알림**: 학과별 공지 알림 설정 기능을 통해 중요한 소식 누락 방지.
- **인천대 꿀팁**: 학생들 간의 유용한 정보를 공유하는 커뮤니티 게시판.

### 🏫 캠퍼스 라이프
- **스마트 시간표**: 개인 수업 시간표 등록 및 관리.
- **식단 정보**: 학생 식당별 오늘의 메뉴 확인.
- **시설 정보**: 캠퍼스 맵, 전화번호부, 학생회 및 동아리 소식 제공.
- **횃불이 AI**: 학교 생활 관련 궁금증을 해결해 주는 AI 챗봇 서비스.

### 👤 개인화 서비스
- **마이페이지**: 내가 쓴 글, 좋아요 한 게시글, 스크랩한 정보 관리.

---

## 🛠 기술 스택

### Frontend
- **Framework**: React 18 (TypeScript)
- **Build Tool**: Vite
- **State Management**: Zustand, Redux Toolkit
- **Styling**: Styled Components, Framer Motion, React Spring (애니메이션)
- **Networking**: Axios
- **Routing**: React Router DOM v6
- **UI Components**: Headless UI, Lucide React, React Icons
- **Maps**: Kakao Maps SDK
- **Calendar**: FullCalendar

### Environment & Tools
- **Language**: TypeScript
- **Linting**: ESLint, Prettier

---

## 📂 프로젝트 구조

```text
src/
├── apis/          # API 통신 로직 (Axios 인스턴스 및 서비스별 정의)
├── components/    # 재사용 가능한 공통 UI 컴포넌트
├── constants/     # 라우트 경로, API 엔드포인트 등 상수 관리
├── containers/    # 페이지 단위의 비즈니스 로직 및 상태 제어
├── context/       # React Context API 설정
├── hooks/         # 커스텀 훅 (Data fetching, 인터랙션 등)
├── layout/        # 페이지 레이아웃 (Root, MainTab, SubLayout)
├── pages/         # 각 서비스별 페이지 (Mobile/Desktop 구분)
├── reducer/       # Redux Toolkit 슬라이스 및 리듀서
├── resources/     # 이미지, 아이콘 등 정적 자원 관리
├── stores/        # Zustand 전역 상태 저장소
├── styles/        # 글로벌 스타일 및 Theme 설정
├── types/         # TypeScript 타입 정의 파일
└── utils/         # 공통 유틸리티 함수
```

---

## 📦 시작하기

### 설치
```bash
npm install
```

### 로컬 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```
