import { useState, useMemo, useRef, useEffect } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import RouletteWheel, { RouletteWheelHandle } from "./RouletteWheel";
import { cafeterias } from "@/resources/strings/cafeterias";
import { showToast } from "@/utils/toast";
import { getCafeterias } from "@/apis/cafeterias";
import { parseCafeteriaSections, firstMenuOf } from "@/utils/cafeteriaMenu";
import confetti from "canvas-confetti";

// 모바일(iOS Safari 및 WebKit/안드로이드 웹뷰)에서 Web Worker/OffscreenCanvas 및 과도한 메모리로 인한
// 전체 화면 백화(White Screen of Death) 현상을 방지하는 안전한 main-thread confetti 인스턴스
const safeConfetti = confetti.create(undefined, {
  useWorker: false,
  resize: true,
});

// Material UI 컴포넌트 적극 활용
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

import {
  MdCheck,
  MdArrowForward,
  MdSettings,
  MdArrowBack,
  MdClose,
  MdAdd,
  MdExpandMore,
} from "react-icons/md";

type MealType = "조식" | "중식" | "석식";
type ModalView = "roulette" | "settings" | "result";

interface FoodRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToCafeteria?: (cafeteriaTitle: string) => void;
}

const STORAGE_KEY = "intip_roulette_custom_items";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "조식", label: "아침 (조식)" },
  { value: "중식", label: "점심 (중식)" },
  { value: "석식", label: "저녁 (석식)" },
];

const getDefaultMealType = (): MealType => {
  const hour = new Date().getHours();
  if (hour < 9) return "조식";
  if (hour < 14) return "중식";
  return "석식";
};

interface CandidateCornerItem {
  id: string;
  cafeteriaTitle: string;
  cornerTitle: string | null;
  menuSummary: string | null;
  price: string | null;
  isCustom: boolean;
  wheelLabel: string;
  displayTitle: string;
}

export default function FoodRouletteModal({
  isOpen,
  onClose,
  onGoToCafeteria,
}: FoodRouletteModalProps) {
  const wheelRef = useRef<RouletteWheelHandle>(null);
  const mealDropdownRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ModalView>("roulette");
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType);
  const [isMealDropdownOpen, setIsMealDropdownOpen] = useState(false);
  const [deselectedCornerIds, setDeselectedCornerIds] = useState<string[]>([]);
  const [cafeteriaMenusMap, setCafeteriaMenusMap] = useState<
    Record<string, string | null>
  >({});
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCandidate, setWinningCandidate] =
    useState<CandidateCornerItem | null>(null);
  const [menuSummary, setMenuSummary] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // 결과 화면 진입 시 모달 상단(z-index: 25000)으로 축하 폭죽 발사
  // 화면 전환 페인트(DOM paint)가 완료된 직후(100ms) 실행하여 모바일 브라우저 렌더링 충돌 방지
  useEffect(() => {
    if (view === "result") {
      const timer = setTimeout(() => {
        try {
          safeConfetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.45 },
            zIndex: 25000,
            colors: ["#0061ff", "#ffc72c", "#ef4444", "#10b981", "#8b5cf6"],
            disableForReducedMotion: true,
          });
        } catch (e) {
          void e;
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        try {
          safeConfetti.reset();
        } catch {
          // 무시
        }
      };
    }
  }, [view]);

  // 드롭다운 바깥 클릭 시 닫기 핸들러
  useEffect(() => {
    if (!isMealDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        mealDropdownRef.current &&
        !mealDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMealDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMealDropdownOpen]);

  // PC 마우스 드래그 가로 관성(Momentum) 스크롤 핸들러 & 휠 스크롤
  const chipRowRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // 관성(Inertia) 추적 변수
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const momentumRafIdRef = useRef<number | null>(null);

  // 관성 애니메이션 중단
  const stopMomentum = () => {
    if (momentumRafIdRef.current !== null) {
      cancelAnimationFrame(momentumRafIdRef.current);
      momentumRafIdRef.current = null;
    }
  };

  const handleChipRowMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !chipRowRef.current) return;
    stopMomentum();
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - chipRowRef.current.offsetLeft;
    scrollLeftRef.current = chipRowRef.current.scrollLeft;

    lastXRef.current = e.pageX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handleChipRowMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !chipRowRef.current) return;
    const currentX = e.pageX;
    const now = performance.now();
    const dt = now - lastTimeRef.current;

    if (dt > 8) {
      const dx = currentX - lastXRef.current;
      velocityRef.current = dx / dt; // px per ms
      lastXRef.current = currentX;
      lastTimeRef.current = now;
    }

    const x = currentX - chipRowRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
      if (!isDragging) setIsDragging(true);
    }
    chipRowRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  // 관성 감속 슬라이드 애니메이션
  const startMomentumScroll = () => {
    if (!chipRowRef.current) return;
    let currentVelocity = velocityRef.current;
    let prevTime = performance.now();
    const friction = 0.94; // 감속 마찰 계수

    const step = (time: number) => {
      if (!chipRowRef.current) return;
      const dt = Math.min(time - prevTime, 32);
      prevTime = time;

      const prevScroll = chipRowRef.current.scrollLeft;
      chipRowRef.current.scrollLeft -= currentVelocity * dt * 1.2;
      currentVelocity *= Math.pow(friction, dt / 16);

      // 경계 도달 확인 또는 속도 소진 시 종료
      const isAtEdge =
        chipRowRef.current.scrollLeft === prevScroll &&
        (prevScroll === 0 ||
          prevScroll >=
            chipRowRef.current.scrollWidth - chipRowRef.current.clientWidth - 1);

      if (Math.abs(currentVelocity) > 0.02 && !isAtEdge) {
        momentumRafIdRef.current = requestAnimationFrame(step);
      } else {
        momentumRafIdRef.current = null;
      }
    };

    momentumRafIdRef.current = requestAnimationFrame(step);
  };

  const handleChipRowMouseUpOrLeave = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsDragging(false);

    // 마지막 움직임 후 60ms 이상 머무른 뒤 놓은 경우 flick이 아니므로 속도 리셋
    if (performance.now() - lastTimeRef.current > 60) {
      velocityRef.current = 0;
    } else if (Math.abs(velocityRef.current) > 0.08) {
      startMomentumScroll();
    }
  };

  const handleChipRowClickCapture = (e: React.MouseEvent) => {
    // 마우스 드래그가 발생했던 경우 자식 Chip의 클릭(선택 토글) 전파 차단
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  const handleChipRowWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!chipRowRef.current) return;
    stopMomentum();
    if (e.deltaY !== 0) {
      chipRowRef.current.scrollLeft += e.deltaY;
    }
  };

  // 컴포넌트 언마운트 시 RAF 정리
  useEffect(() => {
    return () => {
      stopMomentum();
    };
  }, []);

  // 사용자 커스텀 등록 식당 목록
  const [customItems, setCustomItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inputCustomName, setInputCustomName] = useState("");

  // 해당 끼니에 실제로 운영 중인 기본 학식 목록 (메뉴/코너가 존재하는 식당만 동적 산출)
  const operatingCafeterias = useMemo(() => {
    // 메뉴 프리패치 전 초기 로딩 시에는 정적 info 기준 fallback
    if (Object.keys(cafeteriaMenusMap).length === 0) {
      return cafeterias.filter((c) => c.info.includes(mealType));
    }
    return cafeterias.filter((c) => {
      if (!c.info.includes(mealType)) return false;
      const rawMenu = cafeteriaMenusMap[c.title];
      if (!rawMenu) return false;
      const sections = parseCafeteriaSections(rawMenu);
      return sections.length > 0;
    });
  }, [mealType, cafeteriaMenusMap]);

  // 끼니 또는 모달 오픈 시 운영 식당 메뉴 데이터 프리패치
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchOperatingMenus = async () => {
      try {
        const today = new Date().getDay();
        const mealIndex = mealType === "조식" ? 0 : mealType === "중식" ? 1 : 2;

        const results = await Promise.all(
          cafeterias.map(async (caf) => {
            try {
              if (!caf.info.includes(mealType)) {
                return { title: caf.title, menu: null };
              }
              const res = await getCafeterias(caf.title, today);
              return { title: caf.title, menu: res.data?.[mealIndex] || null };
            } catch {
              return { title: caf.title, menu: null };
            }
          }),
        );

        if (isMounted) {
          const map: Record<string, string | null> = {};
          results.forEach((r) => {
            map[r.title] = r.menu;
          });
          setCafeteriaMenusMap(map);
        }
      } catch {
        // 무시
      }
    };

    fetchOperatingMenus();
    return () => {
      isMounted = false;
    };
  }, [isOpen, mealType]);

  // 1. 해당 끼니의 전체 사용 가능한 모든 코너 목록 (실제 메뉴가 있는 학식 코너들 + 커스텀 식당들)
  const allAvailableCorners = useMemo<CandidateCornerItem[]>(() => {
    const list: CandidateCornerItem[] = [];

    // 기본 학식들의 코너 추출
    operatingCafeterias.forEach((caf) => {
      const rawMenu = cafeteriaMenusMap[caf.title];
      if (rawMenu === undefined) return; // 아직 데이터 미도착 시 대기
      const sections = parseCafeteriaSections(rawMenu);
      if (sections.length === 0) return; // 메뉴가 없거나 미운영("-")인 경우 후보에서 제외!

      if (sections.length > 1) {
        // 코너가 2개 이상인 경우 -> 코너별 1개씩 생성!
        sections.forEach((sec, idx) => {
          const cTitle = sec.title || `${idx + 1}코너`;
          const first = firstMenuOf(sec) || sec.menu.split("\n")[0] || null;
          list.push({
            id: `${caf.title}__${cTitle}`,
            cafeteriaTitle: caf.title,
            cornerTitle: cTitle,
            menuSummary: first,
            price: sec.price,
            isCustom: false,
            wheelLabel: `${caf.title}\n${cTitle}`,
            displayTitle: `${caf.title} (${cTitle})`,
          });
        });
      } else if (sections.length === 1) {
        // 단일 코너인 경우
        const sec = sections[0];
        const first = firstMenuOf(sec) || sec.menu.split("\n")[0] || null;
        if (sec.title) {
          list.push({
            id: `${caf.title}__${sec.title}`,
            cafeteriaTitle: caf.title,
            cornerTitle: sec.title,
            menuSummary: first,
            price: sec.price,
            isCustom: false,
            wheelLabel: `${caf.title}\n${sec.title}`,
            displayTitle: `${caf.title} (${sec.title})`,
          });
        } else {
          list.push({
            id: caf.title,
            cafeteriaTitle: caf.title,
            cornerTitle: null,
            menuSummary: first,
            price: sec.price || null,
            isCustom: false,
            wheelLabel: caf.title,
            displayTitle: caf.title,
          });
        }
      }
    });

    // 커스텀 등록 식당들
    customItems.forEach((item) => {
      list.push({
        id: `custom__${item}`,
        cafeteriaTitle: item,
        cornerTitle: null,
        menuSummary: null,
        price: null,
        isCustom: true,
        wheelLabel: item,
        displayTitle: item,
      });
    });

    return list;
  }, [operatingCafeterias, cafeteriaMenusMap, customItems]);

  // 2. 현재 활성화(선택)된 룰렛 후보 목록 (제외되지 않은 코너들)
  const activeCornerCandidates = useMemo<CandidateCornerItem[]>(() => {
    return allAvailableCorners.filter(
      (c) => !deselectedCornerIds.includes(c.id),
    );
  }, [allAvailableCorners, deselectedCornerIds]);

  // 룰렛 바퀴 컴포넌트에 전달할 텍스트 목록
  const wheelItems = useMemo(() => {
    return activeCornerCandidates.map((c) => c.wheelLabel);
  }, [activeCornerCandidates]);

  const isAllSelected = deselectedCornerIds.length === 0;

  // 전체 선택 / 해제 토글 핸들러
  const handleToggleAll = () => {
    if (isSpinning) return;
    setWinner(null);
    setWinningCandidate(null);
    setMenuSummary(null);
    if (isAllSelected) {
      // 룰렛 최소 2개 조건 유지를 위해 앞의 2개만 남기고 모두 제외
      const toDeselect = allAvailableCorners.slice(2).map((c) => c.id);
      setDeselectedCornerIds(toDeselect);
    } else {
      setDeselectedCornerIds([]);
    }
  };

  // 개별 코너 토글 핸들러
  const toggleCorner = (id: string) => {
    if (isSpinning) return;
    setWinner(null);
    setWinningCandidate(null);
    setMenuSummary(null);
    setDeselectedCornerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // 기본 학식 식당 선택 여부 (해당 식당의 코너 중 활성화된 코너가 하나라도 있는지 판별)
  const isCafeteriaSelected = (cafTitle: string) => {
    const corners = allAvailableCorners.filter((c) => c.cafeteriaTitle === cafTitle);
    if (corners.length === 0) return false;
    return corners.some((c) => !deselectedCornerIds.includes(c.id));
  };

  const selectedCafeteriasCount = useMemo(() => {
    return operatingCafeterias.filter((caf) => isCafeteriaSelected(caf.title)).length;
  }, [operatingCafeterias, allAvailableCorners, deselectedCornerIds]);

  const toggleCafeteria = (cafTitle: string) => {
    const corners = allAvailableCorners.filter((c) => c.cafeteriaTitle === cafTitle);
    const cornerIds = corners.map((c) => c.id);
    const currentlySelected = isCafeteriaSelected(cafTitle);

    setWinner(null);
    setWinningCandidate(null);
    setMenuSummary(null);

    setDeselectedCornerIds((prev) => {
      if (currentlySelected) {
        return Array.from(new Set([...prev, ...cornerIds]));
      } else {
        return prev.filter((id) => !cornerIds.includes(id));
      }
    });
  };

  // 당첨된 식당이 기본 학식인지 여부
  const isWinnerOfficialCafeteria = useMemo(() => {
    return Boolean(
      winningCandidate &&
        !winningCandidate.isCustom &&
        cafeterias.some((c) => c.title === winningCandidate.cafeteriaTitle),
    );
  }, [winningCandidate]);

  // 끼니 변경 핸들러
  const handleMealChange = (newMeal: MealType) => {
    if (isSpinning) return;
    setMealType(newMeal);
    setCafeteriaMenusMap({});
    setDeselectedCornerIds([]);
    setWinner(null);
    setWinningCandidate(null);
    setMenuSummary(null);
  };

  // 커스텀 식당 추가
  const handleAddCustomItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputCustomName.trim();
    if (!trimmed) return;
    if (trimmed.length > 12) {
      showToast("이름은 12자 이내로 입력해주세요.");
      return;
    }
    if (customItems.includes(trimmed) || cafeterias.some((c) => c.title === trimmed)) {
      showToast("이미 등록된 식당/메뉴입니다.");
      return;
    }
    const updated = [...customItems, trimmed];
    setCustomItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      void e;
    }
    setInputCustomName("");
    setWinner(null);
    showToast(`'${trimmed}' 식당이 추가되었습니다.`);
  };

  // 커스텀 식당 삭제
  const handleDeleteCustomItem = (title: string) => {
    const updated = customItems.filter((item) => item !== title);
    setCustomItems(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      void e;
    }
    setDeselectedCornerIds((prev) => prev.filter((id) => id !== `custom__${title}`));
    setWinner(null);
  };

  // 추첨 시작 핸들러
  const handleSpinClick = () => {
    wheelRef.current?.spin();
  };

  // 다시 추첨 리셋 핸들러
  const handleReset = () => {
    setWinner(null);
    setWinningCandidate(null);
    setMenuSummary(null);
    setView("roulette");
  };

  // 공유하기 버튼 클릭 핸들러 (스텁)
  const handleShare = () => {
    showToast("식사 메뉴 공유 기능은 곧 지원될 예정입니다! 💌");
  };

  const handleGoToCafeteria = () => {
    if (winningCandidate && onGoToCafeteria) {
      onClose();
      onGoToCafeteria(winningCandidate.cafeteriaTitle);
    } else if (winner && onGoToCafeteria) {
      onClose();
      onGoToCafeteria(winner);
    }
  };

  // 모달 버튼 구성 (화면 뷰에 따라 동적 변경)
  const modalPrimaryButton =
    view === "settings"
      ? {
          text: "설정 완료",
          onClick: () => setView("roulette"),
          variant: "primary" as const,
        }
      : view === "result"
      ? {
          text: "공유하기",
          onClick: handleShare,
          variant: "brand" as const,
        }
      : {
          text: isSpinning ? "추첨 중..." : "추첨하기",
          onClick: handleSpinClick,
          disabled: isSpinning || activeCornerCandidates.length < 2,
          loading: isSpinning,
          variant: "primary" as const,
        };

  const modalSecondaryButton =
    view === "result"
      ? {
          text: "닫기",
          onClick: onClose,
          variant: "secondary" as const,
        }
      : undefined;

  const modalTitle =
    view === "settings"
      ? "후보 목록 설정"
      : view === "result"
      ? ""
      : "오늘 뭐 먹지? 학식 룰렛";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnBack={false}
      title={modalTitle}
      primaryButton={modalPrimaryButton}
      secondaryButton={modalSecondaryButton}
    >
      <ModalContentWrapper>
        {view === "result" ? (
          /* ================= 1. 추첨 결과 전용 화면 ================= */
          <ResultContainer>
            <ResultIconWrapper>🎉</ResultIconWrapper>
            <ResultHeaderBlock>
              <ResultMealBadge>{mealType} 추천</ResultMealBadge>
              <ResultMainTitle>
                {winningCandidate?.displayTitle || winner} 당첨! 😋
              </ResultMainTitle>
            </ResultHeaderBlock>

            {/* 대표 메뉴 정보 카드 */}
            <ResultCard elevation={0}>
              {isWinnerOfficialCafeteria ? (
                <>
                  <ResultCardTopRow>
                    <ResultCardSubLabel>오늘의 추천 메뉴</ResultCardSubLabel>
                    {winningCandidate?.price && (
                      <MenuPriceTag>{winningCandidate.price}</MenuPriceTag>
                    )}
                  </ResultCardTopRow>
                  <ResultCardMenuContent>
                    {menuSummary || "등록된 상세 메뉴 정보가 없습니다."}
                  </ResultCardMenuContent>
                </>
              ) : (
                <CustomWinnerHint>
                  등록하신 나만의 맛집 메뉴예요! 든든하고 맛있는 식사 되세요 🍽️
                </CustomWinnerHint>
              )}
            </ResultCard>

            {/* 기본 학식인 경우 주간 식단 바로가기 버튼 */}
            {isWinnerOfficialCafeteria && onGoToCafeteria && winningCandidate && (
              <Button
                variant="text"
                size="small"
                endIcon={<MdArrowForward size={14} />}
                onClick={handleGoToCafeteria}
                sx={{
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-brand, #0061ff)",
                  textDecoration: "underline",
                  padding: "4px 8px",
                  marginTop: "2px",
                  "&:hover": {
                    textDecoration: "underline",
                    backgroundColor: "var(--bg-brand, #eff6ff)",
                  },
                }}
              >
                {winningCandidate.cafeteriaTitle} 주간 식단표 확인하기
              </Button>
            )}

            {/* 다시 뽑기 링크 (룰렛 화면으로 즉시 복귀) */}
            <Button
              variant="text"
              size="small"
              onClick={handleReset}
              sx={{
                fontFamily: "inherit",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--gray-600, #6b7684)",
                textDecoration: "underline",
                padding: "2px 6px",
                "&:hover": {
                  color: "var(--text-brand, #0061ff)",
                  textDecoration: "underline",
                  backgroundColor: "transparent",
                },
              }}
            >
              다시 뽑기
            </Button>
          </ResultContainer>
        ) : view === "settings" ? (
          /* ================= 2. 설정 화면 뷰 (M3 컴포넌트 전면 적용) ================= */
          <SettingsContainer>
            <SettingsTopBar>
              <Button
                variant="text"
                size="small"
                startIcon={<MdArrowBack />}
                onClick={() => setView("roulette")}
                sx={{
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-brand, #0061ff)",
                  padding: "4px 8px",
                  textTransform: "none",
                  borderRadius: "8px",
                }}
              >
                돌림판으로 돌아가기
              </Button>
            </SettingsTopBar>

            {/* M3 Outlined TextField + Contained Button */}
            <SectionBlock>
              <SectionHeaderTitle>직접 식당 / 메뉴 추가</SectionHeaderTitle>
              <AddForm onSubmit={handleAddCustomItem}>
                <TextField
                  size="small"
                  value={inputCustomName}
                  onChange={(e) => {
                    if (e.target.value.length <= 12) {
                      setInputCustomName(e.target.value);
                    }
                  }}
                  placeholder="예: 맘스터치, 서브웨이, 마라탕"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      fontSize: "12px",
                      height: "36px",
                      backgroundColor: "var(--bg-subtle, #f8f9fb)",
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!inputCustomName.trim()}
                  startIcon={<MdAdd />}
                  sx={{
                    height: "36px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                    textTransform: "none",
                    backgroundColor: "var(--branding-brand-blue, #0061ff)",
                    "&:hover": {
                      backgroundColor: "#004ecc",
                      boxShadow: "none",
                    },
                  }}
                >
                  추가
                </Button>
              </AddForm>
            </SectionBlock>

            {/* M3 Deletable Input Chips */}
            <SectionBlock>
              <SectionHeaderTitle>
                내가 추가한 식당 ({customItems.length})
              </SectionHeaderTitle>
              {customItems.length === 0 ? (
                <EmptyCustomHint>
                  자주 가는 주변 식당이나 메뉴를 직접 추가해보세요!
                </EmptyCustomHint>
              ) : (
                <CustomChipGrid>
                  {customItems.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      size="small"
                      onDelete={() => handleDeleteCustomItem(item)}
                      deleteIcon={<MdClose size={13} />}
                      sx={{
                        height: 28,
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: "8px",
                        backgroundColor: "#f5f3ff",
                        color: "#7c3aed",
                        border: "1px solid #ddd6fe",
                        "& .MuiChip-deleteIcon": {
                          color: "#a78bfa",
                          "&:hover": { color: "#7c3aed" },
                        },
                      }}
                    />
                  ))}
                </CustomChipGrid>
              )}
            </SectionBlock>

            {/* M3 Filter Chips (기본 학식) */}
            <SectionBlock>
              <SectionHeaderTitle>
                기본 학식 식당 선택 ({selectedCafeteriasCount}/{operatingCafeterias.length})
              </SectionHeaderTitle>
              <SettingsCafeteriaGrid>
                {operatingCafeterias.map((caf) => {
                  const isSelected = isCafeteriaSelected(caf.title);
                  return (
                    <Chip
                      key={caf.id}
                      label={caf.title}
                      clickable
                      size="small"
                      variant={isSelected ? "filled" : "outlined"}
                      icon={isSelected ? <MdCheck size={13} /> : undefined}
                      onClick={() => toggleCafeteria(caf.title)}
                      sx={{
                        height: 28,
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: "8px",
                        borderWidth: 1,
                        transition: "all 0.15s ease",
                        ...(isSelected
                          ? {
                              backgroundColor: "var(--bg-brand, #eff6ff)",
                              color: "var(--text-brand, #0061ff)",
                              borderColor: "var(--border-brand, #0061ff)",
                              "& .MuiChip-icon": { color: "var(--text-brand, #0061ff)" },
                            }
                          : {
                              borderColor: "var(--border-default, #e5e8eb)",
                              color: "var(--gray-600, #6b7684)",
                              backgroundColor: "#ffffff",
                            }),
                      }}
                    />
                  );
                })}
              </SettingsCafeteriaGrid>
            </SectionBlock>
          </SettingsContainer>
        ) : (
          /* ================= 2. 룰렛 화면 뷰 (M3 컴포넌트 전면 적용) ================= */
          <>
            {/* 상단 1줄: M3 Custom Select + M3 Text Button (전체선택) + M3 Tooltip & IconButton (설정) */}
            <TopControlRow>
              <DropdownContainer ref={mealDropdownRef}>
                <DropdownTrigger
                  type="button"
                  disabled={isSpinning}
                  $isOpen={isMealDropdownOpen}
                  onClick={() => setIsMealDropdownOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={isMealDropdownOpen}
                >
                  <span>{MEAL_OPTIONS.find((o) => o.value === mealType)?.label || mealType}</span>
                  <DropdownArrow $isOpen={isMealDropdownOpen}>
                    <MdExpandMore size={18} />
                  </DropdownArrow>
                </DropdownTrigger>

                {isMealDropdownOpen && (
                  <DropdownMenu role="listbox">
                    {MEAL_OPTIONS.map((option) => {
                      const isSelected = option.value === mealType;
                      return (
                        <DropdownItem
                          key={option.value}
                          role="option"
                          aria-selected={isSelected}
                          $isSelected={isSelected}
                          onClick={() => {
                            handleMealChange(option.value);
                            setIsMealDropdownOpen(false);
                          }}
                        >
                          <span>{option.label}</span>
                          {isSelected && <MdCheck size={15} color="var(--text-brand, #0061ff)" />}
                        </DropdownItem>
                      );
                    })}
                  </DropdownMenu>
                )}
              </DropdownContainer>

              <RightControlGroup>
                {/* M3 Text Button 형태의 전체선택 / 해제 버튼 */}
                <Button
                  variant="text"
                  size="small"
                  disabled={isSpinning}
                  onClick={handleToggleAll}
                  sx={{
                    fontFamily: "inherit",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--text-brand, #0061ff)",
                    minWidth: "auto",
                    padding: "3px 6px",
                    textTransform: "none",
                    borderRadius: "6px",
                    textDecoration: "underline",
                    "&:hover": {
                      textDecoration: "underline",
                      backgroundColor: "var(--bg-brand, #eff6ff)",
                    },
                  }}
                >
                  {isAllSelected ? "전체해제" : "전체선택"} ({activeCornerCandidates.length}/{allAvailableCorners.length})
                </Button>

                {/* M3 Tooltip + IconButton 설정 버튼 */}
                <Tooltip title="후보 목록 설정" arrow>
                  <span>
                    <IconButton
                      size="small"
                      disabled={isSpinning}
                      onClick={() => setView("settings")}
                      aria-label="식당 목록 설정"
                      sx={{
                        color: "var(--gray-500, #8b95a1)",
                        backgroundColor: "var(--bg-subtle, #f8f9fb)",
                        border: "1px solid var(--border-default, #e5e8eb)",
                        padding: "5px",
                        borderRadius: "8px",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          color: "var(--text-secondary, #333d4b)",
                          backgroundColor: "var(--gray-200, #e5e8eb)",
                        },
                        "&:disabled": {
                          opacity: 0.4,
                        },
                      }}
                    >
                      <MdSettings size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              </RightControlGroup>
            </TopControlRow>

            {/* 상단 2줄: M3 Filter Chip 스크롤 행 (코너별 칩 선택부, PC 드래그 지원) */}
            <ScrollableChipRow
              ref={chipRowRef}
              $isDragging={isDragging}
              onMouseDown={handleChipRowMouseDown}
              onMouseMove={handleChipRowMouseMove}
              onMouseUp={handleChipRowMouseUpOrLeave}
              onMouseLeave={handleChipRowMouseUpOrLeave}
              onClickCapture={handleChipRowClickCapture}
              onWheel={handleChipRowWheel}
            >
              {allAvailableCorners.map((corner) => {
                const isSelected = !deselectedCornerIds.includes(corner.id);
                return (
                  <Chip
                    key={corner.id}
                    label={corner.displayTitle}
                    clickable
                    size="small"
                    disabled={isSpinning}
                    variant={isSelected ? "filled" : "outlined"}
                    icon={isSelected ? <MdCheck size={13} /> : undefined}
                    onClick={() => toggleCorner(corner.id)}
                    sx={{
                      height: 26,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: "8px",
                      flexShrink: 0,
                      borderWidth: 1,
                      transition: "all 0.15s ease",
                      ...(isSelected
                        ? {
                            backgroundColor: corner.isCustom
                              ? "#f5f3ff"
                              : "var(--bg-brand, #eff6ff)",
                            color: corner.isCustom
                              ? "#7c3aed"
                              : "var(--text-brand, #0061ff)",
                            borderColor: corner.isCustom
                              ? "#8b5cf6"
                              : "var(--border-brand, #0061ff)",
                            "& .MuiChip-icon": {
                              color: corner.isCustom
                                ? "#7c3aed"
                                : "var(--text-brand, #0061ff)",
                            },
                          }
                        : {
                            borderColor: "var(--border-default, #e5e8eb)",
                            color: "var(--gray-600, #6b7684)",
                            backgroundColor: "#ffffff",
                          }),
                    }}
                  />
                );
              })}
            </ScrollableChipRow>

            {/* 룰렛 휠 컴포넌트 (코너 단위 휠 조각) */}
            <RouletteWheel
              ref={wheelRef}
              items={wheelItems}
              isSpinning={isSpinning}
              onSpinStart={() => {
                setIsSpinning(true);
                setWinner(null);
                setWinningCandidate(null);
                setMenuSummary(null);
              }}
              onSpinEnd={(selectedWinnerLabel) => {
                setIsSpinning(false);
                const candidate = allAvailableCorners.find(
                  (c: CandidateCornerItem) => c.wheelLabel === selectedWinnerLabel,
                );
                if (candidate) {
                  setWinningCandidate(candidate);
                  setWinner(candidate.displayTitle);
                  setMenuSummary(candidate.menuSummary);
                } else {
                  setWinner(selectedWinnerLabel);
                }

                // 휠 회전 완료 즉시 전용 추첨 결과 화면으로 지연 없이 깔끔하게 전환
                setView("result");
              }}
            />
          </>
        )}
      </ModalContentWrapper>
    </Modal>
  );
}

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: 8px;
  overflow: visible;
`;

const TopControlRow = styled.div`
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  user-select: none;
`;

const DropdownTrigger = styled.button<{ $isOpen: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  height: 32px;
  padding: 4px 10px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-brand, #0061ff);
  background-color: var(--bg-subtle, #f8f9fb);
  border: 1px solid
    ${({ $isOpen }) =>
      $isOpen ? "var(--border-brand, #0061ff)" : "var(--border-default, #e5e8eb)"};
  box-shadow: ${({ $isOpen }) =>
    $isOpen ? "0 0 0 1px var(--border-brand, #0061ff)" : "none"};
  cursor: pointer;
  transition: all 0.15s ease;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    border-color: var(--border-brand, #0061ff);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DropdownArrow = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-brand, #0061ff);
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 130px;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid var(--border-default, #e5e8eb);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  padding: 4px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: dropdownFadeIn 0.15s ease-out;

  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: ${({ $isSelected }) => ($isSelected ? 700 : 500)};
  color: ${({ $isSelected }) =>
    $isSelected ? "var(--text-brand, #0061ff)" : "var(--text-default, #333d4b)"};
  background-color: ${({ $isSelected }) =>
    $isSelected ? "var(--bg-brand, #eff6ff)" : "transparent"};
  cursor: pointer;
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${({ $isSelected }) =>
      $isSelected ? "var(--bg-brand, #eff6ff)" : "var(--bg-subtle, #f8f9fb)"};
  }
`;

const RightControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ScrollableChipRow = styled.div<{ $isDragging?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  padding: 2px 0 4px 0;
  box-sizing: border-box;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  user-select: none;
  -webkit-user-select: none;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const MenuPriceTag = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-brand, #0061ff);
  background-color: var(--bg-brand, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  border-radius: 6px;
  padding: 1px 6px;
  margin-left: 6px;
  flex-shrink: 0;
`;

const CustomWinnerHint = styled.p`
  margin: 0;
  font-size: 11px;
  color: #7c3aed;
  font-weight: 500;
  background-color: #f5f3ff;
  border-radius: 6px;
  padding: 5px 8px;
`;

/* ================= 설정 화면 전용 스타일 ================= */

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  padding-bottom: 4px;
`;

const SettingsTopBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`;

const SectionHeaderTitle = styled.h4`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary, #191f28);
`;

const AddForm = styled.form`
  display: flex;
  width: 100%;
  gap: 6px;
  align-items: center;
`;

const EmptyCustomHint = styled.p`
  margin: 0;
  font-size: 11px;
  color: var(--text-tertiary, #8b95a1);
  padding: 6px 0;
`;

const CustomChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
`;

const SettingsCafeteriaGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
`;

/* ================= 추첨 결과 화면 전용 스타일 ================= */

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 4px 0 2px 0;
  box-sizing: border-box;
  animation: resultPopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes resultPopIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ResultIconWrapper = styled.div`
  font-size: 38px;
  line-height: 1;
`;

const ResultHeaderBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
`;

const ResultMealBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-brand, #0061ff);
  background-color: var(--bg-brand, #eff6ff);
  border: 1px solid var(--border-brand-subtle, #d3e5ff);
  padding: 3px 8px;
  border-radius: 6px;
`;

const ResultMainTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--gray-900, #191f28);
  text-align: center;
  word-break: keep-all;
  line-height: 1.35;
`;

const ResultCard = styled(Paper)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  background-color: var(--bg-subtle, #f8f9fb);
  border: 1px solid var(--border-default, #e5e8eb);
  border-radius: 12px;
  padding: 12px 14px;
  box-sizing: border-box;
`;

const ResultCardTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ResultCardSubLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-500, #8b95a1);
`;

const ResultCardMenuContent = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #191f28);
  line-height: 1.5;
  word-break: keep-all;
  white-space: pre-line;
`;

