# `--text-inverse` → `--text-on-brand` 감사

`src/` 내 `var(--text-inverse)` 296곳(생성 파일 `variables.css`·`tokens.ts` 제외)을 올라앉은 배경 기준으로 분류. 두 토큰은 현재 모두 흰색이라 화면 변화 없음. 줄 번호는 이 커밋 기준.

## 요약

| 구분 | 개수 | 처리 |
|---|---|---|
| 브랜드 파랑 채움 위 | 140 | `--text-on-brand`로 교체 |
| 어두운/딤/회색 배경 | 39 | 유지 |
| 비브랜드 유색(error·success·warn·보라 등) | 60 | 유지 |
| 불명확 | 57 | 유지 |
| 합계 | 296 | |

## 비고 (후속 후보)

- **`--interactive-focus`, `--primary`는 어디에도 정의돼 있지 않다.** 이를 배경으로 쓰는 ClubAdmin·MobilePillSearchBar·DeleteConfirmModal·MobileFolderListDropDowns·ItemDetail·MobileAdminPage:32는 배경이 사실상 무효 → 불명확로 둠. 토큰 정리가 먼저 필요.
- **하드코딩된 파랑**(`rgb(45,117,218)`, `rgb(109,152,215)→rgb(14,77,157)`, `rgba(64,113,185)`)은 토큰이 아니어서 불명확로 둠. 토큰으로 바꾼 뒤 재분류.
- **한 컴포넌트가 브랜드/에러를 오가는 경우**(ChatInput, SectionLabel, BusHistoryModal, ChangeStatusModal, Wizard·GroupWizard 검색시트 `$exclusion`)는 불명확. variant별로 쪼개야 정확히 나뉨.
- **배경이 prop/변수인 아이콘**(MobileAgentReminderSetting 846·894·927, RoutineDetail 2173·3316·3336)은 루틴 색상에 따라 달라 불명확.
- 데스크톱 AI 페이지(AiGallery·AiGenerate·AiTitle·HowTo*·AiPage)는 페이지 배경 위 텍스트라 불명확. 보라 채움 위(`rgb(109,77,199)`)는 3번.
- GradeCalculator 332·374·1698은 텍스트가 아니라 SVG 흰색 채움/선이라 불명확.

## 1. on-brand로 교체 (140)

| file:line | 배경 | 결정 |
|---|---|---|
| src/components/agent/GenerativeCardRenderer.tsx:88 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/agent/GenerativeCardRenderer.tsx:106 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/common/ActionButton.tsx:24 | background: linear-gradient(180deg, var(--blue-400) 0%, var(--blue-600) 100%); | `--text-on-brand` |
| src/components/common/AppErrorScreen.tsx:307 | background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-400) 100%); | `--text-on-brand` |
| src/components/common/AppErrorScreen.tsx:452 | background: linear-gradient(135deg, var(--blue-700) 0%, var(--blue-500) 100%); | `--text-on-brand` |
| src/components/common/AppInstallBanner.tsx:162 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/common/AppUpdateModal.tsx:115 | background-color: var(--blue-800); | `--text-on-brand` |
| src/components/common/BottomButtonGroup.tsx:62 | $backgroundColor={rightButton.backgroundColor || "var(--interactive-primary)"} | `--text-on-brand` |
| src/components/common/CapsuleButton.tsx:68 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/common/CapsuleButton.tsx:103 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/common/DayChip.tsx:44 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/common/TermsAgreement.tsx:157 | background-color 0.15s ease, | `--text-on-brand` |
| src/components/desktop/common/LoginModal.tsx:116 | background: linear-gradient(90deg, var(--blue-400) 0%, var(--interactive-primary) 100%); | `--text-on-brand` |
| src/components/desktop/rental/Rental.tsx:112 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/agent/LibraryAccountModal.tsx:225 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/agent/PortalAccountModal.tsx:264 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/bus/map/BusStopSwitcher.tsx:92 | background: ${({ $selected }) => | `--text-on-brand` |
| src/components/mobile/calendar/Calendar.tsx:653 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/chat/AddFriendModal.tsx:240 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/chat/AgentGenerativeCards.tsx:1056 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/chat/AgentGenerativeCards.tsx:1935 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/chat/AgentGenerativeCards.tsx:3107 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/chat/AgentGenerativeCards.tsx:3160 | background: ${({ $active }) => ($active ? "var(--interactive-primary)" : "var(--bg-muted)" | `--text-on-brand` |
| src/components/mobile/chat/AgentGenerativeCards.tsx:3196 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/chat/ChatRoomListItem.tsx:391 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/chat/CreateChatModal.tsx:177 | backgroundColor: "var(--interactive-primary)", | `--text-on-brand` |
| src/components/mobile/chat/EditChatModal.tsx:170 | backgroundColor: "var(--interactive-primary)", | `--text-on-brand` |
| src/components/mobile/chat/EditChatRoomTitleModal.tsx:100 | backgroundColor: "var(--interactive-primary)", | `--text-on-brand` |
| src/components/mobile/chat/ImageUploadModal.tsx:89 | backgroundColor: "var(--interactive-primary)", | `--text-on-brand` |
| src/components/mobile/chat/OpenChatPreviewModal.tsx:126 | backgroundColor: room.joined ? "rgba(59, 130, 246, 0.12)" : "var(--interactive-primary)", | `--text-on-brand` |
| src/components/mobile/chat/FriendManagementView.tsx:544 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/chat/SchedulePollCard.tsx:453 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/chat/SchedulePollCard.tsx:472 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/chat/SchedulePollCard.tsx:544 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/chat/TimetableShareCard.tsx:103 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/chat/TimetableShareCard.tsx:198 | background: ${({ $isTop }) => ($isTop ? "var(--interactive-primary)" : "var(--bg-brand)")} | `--text-on-brand` |
| src/components/mobile/chat/TimetableShareCard.tsx:229 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/club/ManageClubRecruit.tsx:229 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/common/CategorySelectorNew.tsx:172 | background: ${({ $selected }) => ($selected ? "var(--interactive-primary)" : "transparent" | `--text-on-brand` |
| src/components/mobile/common/CategorySelectorNew.tsx:182 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/common/FillButton.tsx:36 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/common/FloatingSearchBar.tsx:425 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/council/UploadNotice.tsx:250 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/council/UploadPetition.tsx:265 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/dailyBrief/MobileAgentReminderSetting.tsx:762 | <IconCircle $bgColor="var(--interactive-primary)"> | `--text-on-brand` |
| src/components/mobile/dailyBrief/MobileAgentReminderSetting.tsx:790 | <IconCircle $bgColor="var(--interactive-primary)"> | `--text-on-brand` |
| src/components/mobile/dailyBrief/MobileAgentReminderSetting.tsx:1533 | background-color: ${({ $active }) => ($active ? "var(--interactive-primary)" : "transparen | `--text-on-brand` |
| src/components/mobile/dailyBrief/view/DailyBriefCardDetailConfigModal.tsx:151 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/dailyBrief/view/DailyBriefNoticeCard.tsx:435 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/dormitory/MobileDormitoryCard.tsx:77 | badgeBg: "var(--interactive-primary)", | `--text-on-brand` |
| src/components/mobile/login/LoginForm.tsx:212 | background: var(--blue-800); | `--text-on-brand` |
| src/components/mobile/routine/RoutineBuilderModal.tsx:537 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/routine/RoutineBuilderModal.tsx:801 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/routine/RoutineBuilderModal.tsx:927 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/schedulePoll/PollUi.tsx:100 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/schedulePoll/SendTargetPicker.tsx:647 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/social/NearbyFriendInfoSheet.tsx:443 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/social/SocialUserCard.tsx:182 | background-color: ${({ $variant }) => | `--text-on-brand` |
| src/components/mobile/social/UserProfileModal.tsx:227 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/CourseResultList.tsx:495 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/timetable/CourseResultList.tsx:605 | background-color: var(--bg-muted) !important; | `--text-on-brand` |
| src/components/mobile/timetable/CourseTimeSelector.tsx:266 | background-color: var(--interactive-primary) !important; | `--text-on-brand` |
| src/components/mobile/timetable/GradeImportGuideSheet.tsx:848 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/timetable/MobileCourseSearchSheet.tsx:550 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/PortalTimetableImportSheet.tsx:560 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/PortalTimetableImportSheet.tsx:680 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/PortalTimetableImportSheet.tsx:715 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/TimetableThemeBottomSheet.tsx:231 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/TimetableThemeBottomSheet.tsx:240 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/wizard/WizardCourseSearchSheet.tsx:784 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/wizard/group/GroupWizardCourseSearchSheet.tsx:768 | (부모 채움 확인됨) | `--text-on-brand` |
| src/components/mobile/timetable/wizard/group/GroupWizardPreferenceStep.tsx:306 | background: ${({ $active }) => | `--text-on-brand` |
| src/components/mobile/timetable/wizard/ui/WizardBottomCTA.tsx:102 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/timetable/wizard/ui/WizardCheckbox.tsx:31 | background: ${({ $checked }) => | `--text-on-brand` |
| src/components/mobile/timetable/wizard/ui/WizardDayChip.tsx:48 | background-color 0.15s ease, | `--text-on-brand` |
| src/components/mobile/timetable/wizard/ui/WizardFavButton.tsx:74 | background-color 0.15s ease, | `--text-on-brand` |
| src/components/mobile/util/Lost/LostDetail.tsx:155 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/util/Lost/UploadLost.tsx:206 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/util/book/BookDetail.tsx:157 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/util/book/UploadBook.tsx:240 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/util/rental/adminMode/AddItem.tsx:122 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/util/rental/adminMode/ChangeStatusModal.tsx:118 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/util/rental/adminMode/EditItem.tsx:218 | background: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/util/rental/adminMode/RentalAdmin.tsx:57 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/util/rental/adminMode/ReservationListWrapper.tsx:106 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/components/mobile/write/WriteBottomBar.tsx:119 | background: var(--interactive-primary); | `--text-on-brand` |
| src/containers/mobile/admin/NotificationFormModal.tsx:410 | background-color: ${(props) => (props.$active ? "var(--interactive-primary)" : "var(--bg-b | `--text-on-brand` |
| src/containers/mobile/admin/NotificationFormModal.tsx:415 | background-color: var(--bg-muted); | `--text-on-brand` |
| src/containers/mobile/admin/NotificationFormModal.tsx:438 | background-color: ${(props) => (props.$active ? "var(--interactive-primary)" : "var(--bg-s | `--text-on-brand` |
| src/containers/mobile/admin/NotificationFormModal.tsx:476 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/containers/mobile/home/NoticeTabWidget.tsx:319 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/containers/mobile/mypage/UserModify.tsx:671 | background: linear-gradient(135deg, var(--blue-400) 0%, var(--interactive-primary) 100%); | `--text-on-brand` |
| src/containers/mobile/save/ManageFolder.tsx:206 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/containers/mobile/save/ManageFolder.tsx:248 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/containers/mobile/save/ManageFolder.tsx:259 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/containers/mobile/save/ManageFolder.tsx:270 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/containers/mobile/save/ManageFolder.tsx:281 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/Admin/MobileAdminBusPage.tsx:1538 | background-color: ${({ active }) => (active ? "var(--interactive-primary)" : "var(--bg-mut | `--text-on-brand` |
| src/pages/mobile/Admin/MobileAdminBusPage.tsx:1590 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/Admin/MobileAdminBusPage.tsx:2036 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/Admin/MobileAdminBusPage.tsx:2249 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/Admin/MobileAdminBusPage.tsx:2318 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:50 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/AlarmSettingPage.tsx:738 | background: ${({ $selected }) => ($selected ? "var(--interactive-primary)" : "var(--bg-bas | `--text-on-brand` |
| src/pages/mobile/ChattingPage.tsx:949 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/ChattingPage.tsx:1048 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/ChattingPage.tsx:2029 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/CreatePersonalChatPage.tsx:393 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/MobileChatListPage.tsx:1038 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/MobileChatListPage.tsx:1116 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/MobileFriendListPage.tsx:379 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/MobileFriendListPage.tsx:605 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/MobileFriendListPage.tsx:645 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/Labs/PortalTimetableLabPage.tsx:727 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/MobileFriendInvitePage.tsx:277 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/MobileFriendInvitePage.tsx:326 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/MobileFriendQrPage.tsx:320 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/MobileLibraryHubPage.tsx:1985 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/MobileLibraryHubPage.tsx:2328 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/MobileLibraryHubPage.tsx:2944 | background: ${({ $danger }) => ($danger ? "var(--bg-error)" : "var(--interactive-primary)" | `--text-on-brand` |
| src/pages/mobile/MobileLibraryHubPage.tsx:3328 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/MobileLmsHubPage.tsx:1172 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/MobileMyPage.tsx:479 | background: var(--blue-800); | `--text-on-brand` |
| src/pages/mobile/MobileRoutineDetailPage.tsx:2960 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/MobileRoutineDetailPage.tsx:3095 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/MobileRoutineDetailPage.tsx:4190 | background: ${({ $active }) => ($active ? "var(--interactive-primary)" : "transparent")}; | `--text-on-brand` |
| src/pages/mobile/MobileRoutineDetailPage.tsx:4237 | background: ${({ $active }) => ($active ? "var(--interactive-primary)" : "var(--bg-muted)" | `--text-on-brand` |
| src/pages/mobile/MobileTimeTablePage.tsx:1064 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/MobileTimeTablePage.tsx:1096 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/timetable/MobileTimeTableComparePage.tsx:1170 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/timetable/MobileTimeTableComparePage.tsx:1495 | background-color: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/timetable/MobileTimetableImageImportPage.tsx:608 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/timetable/MobileTimetableImageImportPage.tsx:2279 | background: ${({ $active }) => ($active ? "var(--interactive-primary)" : "var(--bg-base)") | `--text-on-brand` |
| src/pages/mobile/timetable/MobileTimetableImportHubPage.tsx:246 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/timetable/MobilePortalTimetableImportPage.tsx:586 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/timetable/MobilePortalTimetableImportPage.tsx:755 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/timetable/MobilePortalTimetableImportPage.tsx:792 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/schedulePoll/SchedulePollCreatePage.tsx:485 | background: var(--interactive-primary); | `--text-on-brand` |
| src/pages/mobile/schedulePoll/SchedulePollListPage.tsx:171 | (부모 채움 확인됨) | `--text-on-brand` |
| src/pages/mobile/schedulePoll/SchedulePollStatusPage.tsx:487 | (부모 채움 확인됨) | `--text-on-brand` |

## 2. 어두운/딤/회색 배경 — `--text-inverse` 유지

| file:line | 배경 | 결정 |
|---|---|---|
| src/components/common/Toast.tsx:96 | background: rgba(33, 37, 41, 0.92); | `--text-inverse` 유지 |
| src/components/common/Toast.tsx:114 | background: none; | `--text-inverse` 유지 |
| src/components/common/TooltipMessage.tsx:221 | background-color: ${TOOLTIP_BG}; | `--text-inverse` 유지 |
| src/components/common/TooltipMessage.tsx:299 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/map/components/KakaoMap.css:62 | background: rgb(66, 84, 112); | `--text-inverse` 유지 |
| src/components/map/components/KakaoMap.css:68 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/map/components/KakaoMap.tsx:522 | background: rgba(32, 53, 93, 0.92); | `--text-inverse` 유지 |
| src/components/mobile/bus/map/BusInteractiveMap.tsx:505 | background: rgba(20, 36, 66, 0.92); | `--text-inverse` 유지 |
| src/components/mobile/chat/ChatRoomListItem.tsx:360 | background: var(--gray-900); | `--text-inverse` 유지 |
| src/components/mobile/chat/ImageModal.tsx:187 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/chat/ImageModal.tsx:212 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/chat/ImageModal.tsx:325 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/chat/ImageModal.tsx:330 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/chat/ImageUploadModal.tsx:174 | background-color: rgba(0, 0, 0, 0.6); | `--text-inverse` 유지 |
| src/components/mobile/chat/OpenChatPreviewModal.tsx:210 | background: var(--gray-900); | `--text-inverse` 유지 |
| src/components/mobile/chat/OpenChatRoomListItem.tsx:136 | background: var(--gray-900); | `--text-inverse` 유지 |
| src/containers/mobile/home/Banner.tsx:424 | background-color: rgba(0, 0, 0, 0.5); | `--text-inverse` 유지 |
| src/containers/mobile/home/Banner.tsx:434 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/containers/mobile/write/WriteForm.tsx:288 | background: rgba(0, 0, 0, 0.6); | `--text-inverse` 유지 |
| src/components/mobile/save/MobileFolderListDropDowns.tsx:142 | background-color: black; | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/view/DailyBriefCafeteriaCard.tsx:327 | background-color: ${({ $selected }) => | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/view/DailyBriefCafeteriaCard.tsx:419 | background: var(--neutral-1000); | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/MobileAgentReminderSetting.tsx:1287 | background-color: var(--gray-900); | `--text-inverse` 유지 |
| src/components/mobile/timetable/GradeImportGuideSheet.tsx:565 | background-color: rgb(20, 51, 107); | `--text-inverse` 유지 |
| src/components/mobile/timetable/GradeImportGuideSheet.tsx:594 | background-color: ${({ $active }) => ($active ? "rgb(20, 51, 107)" : "var(--gray-200)")}; | `--text-inverse` 유지 |
| src/components/mobile/timetable/GradeImportGuideSheet.tsx:764 | background-color: rgb(58, 58, 60); | `--text-inverse` 유지 |
| src/pages/mobile/Labs/PortalDormitoryLabPage.tsx:2025 | background-color: ${({ $active }) => ($active ? "var(--text-primary)" : "var(--bg-muted)") | `--text-inverse` 유지 |
| src/pages/mobile/Labs/PortalDormitoryLabPage.tsx:2281 | background-color: var(--gray-800); | `--text-inverse` 유지 |
| src/pages/mobile/Labs/PortalTimetableLabPage.tsx:795 | background-color: ${(props) => (props.$active ? "var(--text-primary)" : "var(--bg-muted)") | `--text-inverse` 유지 |
| src/pages/mobile/ChattingPage.tsx:2001 | background: var(--gray-900); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminNotificationPage.tsx:721 | background-color: ${(props) => (props.$active ? "var(--text-primary)" : "transparent")}; | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminNotificationPage.tsx:723 | background-color: ${(props) => (props.$active ? "var(--text-primary)" : "transparent")}; | `--text-inverse` 유지 |
| src/pages/mobile/MyPage/MobilePortalAccountPage.tsx:121 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/MyPage/MobilePortalAccountPage.tsx:332 | background: var(--text-primary); | `--text-inverse` 유지 |
| src/pages/mobile/phonebook/MobilePhoneBookSearchPage.tsx:556 | background: var(--gray-300); | `--text-inverse` 유지 |
| src/components/mobile/schedulePoll/SendTargetPicker.tsx:534 | background: var(--text-tertiary); | `--text-inverse` 유지 |
| src/components/common/ActionButton.tsx:47 | background: var(--gray-300); // 배경색 회색 처리 | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:324 | <SectionIconBox $color="var(--gray-500)"> | `--text-inverse` 유지 |
| src/pages/mobile/MobileRoutineDetailPage.tsx:2176 | (주변 코드 참조) | `--text-inverse` 유지 |

## 3. 비브랜드 유색 채움 (error·success·warn·기타) — 유지, 향후 `on-error` 등 후보

| file:line | 배경 | 결정 |
|---|---|---|
| src/components/mobile/delete/DeleteButton.tsx:147 | background-color: var(--text-error); | `--text-inverse` 유지 |
| src/components/mobile/timetable/TimetableAiEvaluationBubble.tsx:684 | background: var(--text-error); | `--text-inverse` 유지 |
| src/components/mobile/timetable/TimetableAiEvaluationBubble.tsx:872 | background: linear-gradient(135deg, rgb(255, 95, 21) 0%, var(--red-500) 100%); | `--text-inverse` 유지 |
| src/components/mobile/timetable/wizard/WizardSaveFlow.tsx:204 | style: { background: "var(--red-500)", color: "var(--text-inverse)" }, | `--text-inverse` 유지 |
| src/components/mobile/util/Lost/LostDetail.tsx:164 | background-color: var(--red-500); | `--text-inverse` 유지 |
| src/components/mobile/util/book/BookDetail.tsx:166 | background-color: var(--red-500); | `--text-inverse` 유지 |
| src/components/mobile/util/rental/adminMode/EditItem.tsx:223 | background: var(--red-500); | `--text-inverse` 유지 |
| src/components/mobile/util/rental/userMode/ReservationItem.tsx:120 | background: var(--text-error); | `--text-inverse` 유지 |
| src/containers/mobile/common/MobileBottomNav.tsx:249 | background-color: var(--red-500); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminNotificationPage.tsx:665 | background-color: var(--red-500); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminNotificationPage.tsx:730 | background-color: var(--red-500); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminNotificationPage.tsx:756 | background-color: rgb(15, 118, 110); | `--text-inverse` 유지 |
| src/pages/mobile/AlarmSettingPage.tsx:292 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/AlarmSettingPage.tsx:546 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminBusPage.tsx:1837 | background-color: rgb(22, 163, 74); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminBusPage.tsx:2366 | background-color: ${({ isOnline }) => (isOnline ? "rgb(34, 197, 94)" : "var(--red-500)")}; | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminBusPage.tsx:2428 | background-color: ${({ isOnline }) => (isOnline ? "var(--red-500)" : "rgb(22, 163, 74)")}; | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:43 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:57 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:64 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:71 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:78 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:85 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:238 | <SectionIconBox $color="rgb(2, 132, 199)"> | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:286 | <SectionIconBox $color="rgb(79, 70, 229)"> | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:506 | background-color: ${(props) => (props.$active ? "rgb(2, 132, 199)" : "var(--gray-500)")}; | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:533 | background-color: rgb(2, 132, 199); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminSearchPage.tsx:707 | background-color: ${(props) => (props.$success ? "var(--text-success)" : "var(--red-500)") | `--text-inverse` 유지 |
| src/components/mobile/agent/LmsAccountModal.tsx:225 | background: var(--text-success); | `--text-inverse` 유지 |
| src/components/mobile/util/rental/adminMode/ItemCard.tsx:75 | background-color: var(--text-success); | `--text-inverse` 유지 |
| src/components/mobile/dormitory/MobileDormitoryCard.tsx:54 | badgeBg: "var(--text-success)", | `--text-inverse` 유지 |
| src/components/mobile/dormitory/MobileDormitoryCard.tsx:66 | badgeBg: "rgb(67, 56, 202)", | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGallery.tsx:321 | background-color: rgb(109, 77, 199); | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGallery.tsx:353 | background-color: var(--bg-base); | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGallery.tsx:380 | background-color: ${(props) => (props.$active ? "rgb(109, 77, 199)" : "var(--bg-base)")}; | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGenerate.tsx:291 | background-color: rgb(109, 77, 199); | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGenerate.tsx:328 | background: rgb(109, 77, 199); | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGenerate.tsx:340 | background: rgb(109, 77, 199); | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGenerate.tsx:360 | background: rgb(109, 77, 199); | `--text-inverse` 유지 |
| src/pages/desktop/AiPage.tsx:90 | background: rgb(109, 77, 199); | `--text-inverse` 유지 |
| src/components/mobile/common/ComingSoonModal.tsx:114 | background-color: rgb(122, 109, 208); | `--text-inverse` 유지 |
| src/components/mobile/common/LoginRequiredModal.tsx:123 | background-color: rgb(122, 109, 208); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminChatPage.tsx:203 | background: rgb(88, 68, 228); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminFeatureFlagsPage.tsx:333 | background-color: rgb(15, 118, 110); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminFeatureFlagsPage.tsx:570 | background-color: rgb(15, 118, 110); | `--text-inverse` 유지 |
| src/pages/mobile/MobileFcmStatusPage.tsx:148 | background: rgb(59, 91, 219); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminPage.tsx:40 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminPage.tsx:48 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminPage.tsx:56 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminPage.tsx:64 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminPage.tsx:72 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminPage.tsx:80 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminPage.tsx:88 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/routine/RoutineBuilderModal.tsx:39 | iconBg: "rgb(92, 156, 248)", | `--text-inverse` 유지 |
| src/components/mobile/routine/RoutineBuilderModal.tsx:46 | iconBg: "rgb(255, 122, 0)", | `--text-inverse` 유지 |
| src/components/mobile/routine/RoutineBuilderModal.tsx:53 | iconBg: "rgb(34, 197, 94)", | `--text-inverse` 유지 |
| src/components/mobile/routine/RoutineBuilderModal.tsx:60 | iconBg: "rgb(168, 85, 247)", | `--text-inverse` 유지 |
| src/components/mobile/routine/RoutineBuilderModal.tsx:67 | iconBg: "rgb(59, 130, 246)", | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/MobileAgentReminderSetting.tsx:736 | <IconCircle $bgColor="rgb(168, 85, 247)"> | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/view/DailyBriefWeatherCard.tsx:364 | background: ${({ $grade }) => { | `--text-inverse` 유지 |

## 4. 불명확 — 유지

| file:line | 배경 | 결정 |
|---|---|---|
| src/components/agent/ChatHeader.tsx:48 | background: linear-gradient(142deg, var(--interactive-primary) 26.94%, rgb(87, 0, 153) 87. | `--text-inverse` 유지 |
| src/components/agent/ChatInput.tsx:86 | background-color: ${(props) => { | `--text-inverse` 유지 |
| src/components/agent/ChatMessage.tsx:65 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/bus/SectionLabel.tsx:15 | background-color: ${({ $isRed }) => ($isRed ? "var(--red-500)" : "var(--interactive-primar | `--text-inverse` 유지 |
| src/components/mobile/bus/BusHistoryModal.tsx:1115 | background-color: ${({ tone }) => { | `--text-inverse` 유지 |
| src/components/mobile/util/rental/adminMode/ChangeStatusModal.tsx:70 | background-color: ${({ active, status }) => | `--text-inverse` 유지 |
| src/components/mobile/timetable/wizard/WizardCourseSearchSheet.tsx:1067 | background: ${({ $exclusion }) => | `--text-inverse` 유지 |
| src/components/mobile/timetable/wizard/group/GroupWizardCourseSearchSheet.tsx:1030 | background: ${({ $exclusion }) => | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/MobileAgentReminderSetting.tsx:846 | <IconCircle $bgColor={bg}> | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/MobileAgentReminderSetting.tsx:894 | <IconCircle $bgColor={preset.iconBg}> | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/MobileAgentReminderSetting.tsx:927 | <IconCircle $bgColor={preset.iconBg}> | `--text-inverse` 유지 |
| src/components/mobile/cafeteria/RouletteWheel.tsx:350 | fill: var(--text-inverse); | `--text-inverse` 유지 |
| src/components/mobile/chat/AgentGenerativeCards.tsx:897 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/chat/FriendManagementView.tsx:33 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/view/DailyBriefWeatherCard.tsx:104 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/view/DailyBriefWeatherCard.tsx:184 | background: ${({ $gradient }) => $gradient}; | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/view/DailyBriefWeatherCard.tsx:226 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/view/DailyBriefWeatherCard.tsx:296 | background: rgba(255, 255, 255, 0.2); | `--text-inverse` 유지 |
| src/components/mobile/dailyBrief/view/DailyBriefWeatherCard.tsx:302 | background: rgba(255, 255, 255, 0.2); | `--text-inverse` 유지 |
| src/components/mobile/council/PetitionList.tsx:123 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/containers/mobile/home/Weather.tsx:189 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/containers/mobile/home/Weather.tsx:212 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/containers/mobile/home/Weather.tsx:227 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/containers/mobile/save/ScrapFolders.tsx:132 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/ChattingPage.tsx:2113 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/Labs/PortalDormitoryLabPage.tsx:2338 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/MobileTimeTablePage.tsx:1194 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/MobileTimeTablePage.tsx:1202 | background: var(--bg-base); | `--text-inverse` 유지 |
| src/pages/mobile/timetable/MobileGradeCalculatorPage.tsx:332 | fill="var(--text-inverse)" | `--text-inverse` 유지 |
| src/pages/mobile/timetable/MobileGradeCalculatorPage.tsx:374 | <circle cx={cx} cy={cy} r={7} fill="var(--text-inverse)" stroke={color} strokeWidth={2} /> | `--text-inverse` 유지 |
| src/pages/mobile/timetable/MobileGradeCalculatorPage.tsx:1698 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/MobileRoutineDetailPage.tsx:276 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/mobile/MobileRoutineDetailPage.tsx:2173 | $bgColor={selectedColor} | `--text-inverse` 유지 |
| src/pages/mobile/MobileRoutineDetailPage.tsx:3316 | $color={c.hex} | `--text-inverse` 유지 |
| src/pages/mobile/MobileRoutineDetailPage.tsx:3336 | <IconCirclePreview $selected={isSelected} $bgColor={tempColor}> | `--text-inverse` 유지 |
| src/components/mobile/club/ClubAdmin.tsx:197 | background-color: var(--interactive-focus); | `--text-inverse` 유지 |
| src/components/mobile/common/MobilePillSearchBar.tsx:160 | background-color: var(--interactive-focus); | `--text-inverse` 유지 |
| src/components/mobile/save/DeleteConfirmModal.tsx:67 | background-color: var(--interactive-focus); | `--text-inverse` 유지 |
| src/components/mobile/save/MobileFolderListDropDowns.tsx:205 | background-color: var(--interactive-focus); | `--text-inverse` 유지 |
| src/components/mobile/util/rental/ItemDetail.tsx:366 | background-color: var(--interactive-focus); | `--text-inverse` 유지 |
| src/pages/mobile/Admin/MobileAdminPage.tsx:32 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGallery.tsx:268 | background-color: var(--gray-200); | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGenerate.tsx:246 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGenerate.tsx:310 | background: transparent; | `--text-inverse` 유지 |
| src/components/desktop/ai/AiGenerate.tsx:314 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/desktop/ai/AiTitle.tsx:42 | background-color: transparent; | `--text-inverse` 유지 |
| src/components/desktop/ai/AiTitle.tsx:65 | background: linear-gradient( | `--text-inverse` 유지 |
| src/components/desktop/ai/HowToUse.tsx:51 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/desktop/book/HowToBuy.tsx:31 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/desktop/lost/HowToFind.tsx:39 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/pages/desktop/AiPage.tsx:79 | (주변 코드 참조) | `--text-inverse` 유지 |
| src/components/mobile/bus/BusUiWelcomeModal.tsx:150 | background: linear-gradient(180deg, rgb(45, 117, 218), rgb(21, 88, 183)); | `--text-inverse` 유지 |
| src/components/mobile/council/MobileCouncilHeader.tsx:51 | background: linear-gradient(180deg, rgb(109, 152, 215) 0%, rgb(14, 77, 157) 100%); | `--text-inverse` 유지 |
| src/components/mobile/util/MobileUtilHeader.tsx:60 | background: linear-gradient(180deg, rgb(109, 152, 215) 0%, rgb(14, 77, 157) 100%); | `--text-inverse` 유지 |
| src/pages/mobile/MobileClubPage.tsx:374 | background-color: rgba(64, 113, 185, 1); | `--text-inverse` 유지 |
| src/pages/mobile/MobileCouncilPage.tsx:98 | background-color: rgba(64, 113, 185, 1); | `--text-inverse` 유지 |
| src/pages/mobile/MobileUtilPage.tsx:117 | background-color: rgba(64, 113, 185, 1); | `--text-inverse` 유지 |

