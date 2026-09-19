import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import Icon from "@/components/common/Icon";
import { getWeathers } from "@/apis/weathers";
import { getCafeterias } from "@/apis/cafeterias";
import useUserStore from "@/stores/useUserStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { formatHoursToTime } from "@/utils/timetable";

interface DailyBriefShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyBriefShareModal({
  isOpen,
  onClose,
}: DailyBriefShareModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo?.accessToken);
  const { timetables } = useTimetableStore();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[now.getDay()];
  const todayDayOfWeek = (now.getDay() + 6) % 7; // 0: 월 ~ 6: 일
  const todayDateString = `${year}. ${String(month).padStart(2, "0")}. ${String(date).padStart(2, "0")} (${dayName})`;

  // 대표 시간표
  const activeTimetable = timetables.find(
    (t) =>
      t.id ===
      (timetables.find((item) => item.isRepresentative)?.id ||
        timetables[0]?.id),
  );

  const todayClasses = (activeTimetable?.events || [])
    .filter((cls) => cls.day === todayDayOfWeek)
    .sort((a, b) => a.startTime - b.startTime);

  // 캔버스 그리기 함수
  const generateStoryCard = useCallback(async () => {
    setIsGenerating(true);

    // 날씨 조회
    let weatherSky = "맑음";
    let weatherTemp = "21°";
    let weatherPm = "보통";
    try {
      const wRes = await getWeathers();
      if (wRes.data) {
        weatherSky = wRes.data.sky || "맑음";
        weatherTemp = `${wRes.data.temperature?.replace(/[^0-9.-]/g, "") || "21"}°`;
        weatherPm = `미세먼지 ${wRes.data.pm10Grade || "보통"}`;
      }
    } catch {}

    // 학식 메뉴 조회
    let cafName = "학생식당";
    let cafMenu = "돈까스, 제육볶음, 된장찌개";
    try {
      const apiDay = now.getDay() >= 1 && now.getDay() <= 5 ? now.getDay() : 1;
      const cRes = await getCafeterias("학생식당", apiDay);
      if (cRes.data && cRes.data.length > 0) {
        cafMenu = cRes.data.slice(0, 3).join(" · ");
      }
    } catch {}

    // 캔버스 생성
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. 전체 배경 그라디언트
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, "#BAE6FD");
    bgGrad.addColorStop(0.3, "#E0F2FE");
    bgGrad.addColorStop(0.65, "#FEF3C7");
    bgGrad.addColorStop(1, "#FFEDD5");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 둥근 사각형 헬퍼
    const drawRoundRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fillStyle: string | CanvasGradient,
      strokeColor?: string,
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
      if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    // 2. 상단 헤더 영역
    // 뱃지
    drawRoundRect(80, 120, 240, 56, 28, "rgba(37, 99, 235, 0.9)");
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DAILY BRIEF", 200, 158);

    // 날짜
    ctx.textAlign = "left";
    ctx.fillStyle = "#334155";
    ctx.font = "600 32px Pretendard, sans-serif";
    ctx.fillText(todayDateString, 80, 230);

    // 타이틀 인사말
    ctx.fillStyle = "#0F172A";
    ctx.font = "800 64px Pretendard, sans-serif";
    ctx.fillText("오늘의 캠퍼스 브리프 ✨", 80, 310);

    // 3. 카드 1: 송도 날씨 카드 (파란 그라디언트)
    const weatherCardGrad = ctx.createLinearGradient(80, 380, 1000, 580);
    weatherCardGrad.addColorStop(0, "#2563EB");
    weatherCardGrad.addColorStop(1, "#3B82F6");
    drawRoundRect(80, 380, 920, 220, 36, weatherCardGrad);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px Pretendard, sans-serif";
    ctx.fillText("송도 캠퍼스 날씨", 130, 445);

    ctx.font = "800 76px Pretendard, sans-serif";
    ctx.fillText(weatherTemp, 130, 545);

    ctx.font = "600 34px Pretendard, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(weatherSky, 300, 545);

    drawRoundRect(740, 420, 210, 50, 25, "rgba(255, 255, 255, 0.2)");
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(weatherPm, 845, 454);

    // 4. 카드 2: 오늘의 시간표 요약 (화이트 카드)
    ctx.textAlign = "left";
    drawRoundRect(
      80,
      630,
      920,
      380,
      36,
      "rgba(255, 255, 255, 0.88)",
      "rgba(255, 255, 255, 0.95)",
    );

    ctx.fillStyle = "#0F172A";
    ctx.font = "800 36px Pretendard, sans-serif";
    ctx.fillText("📚 오늘의 강의 일정", 130, 705);

    if (!isLoggedIn || todayClasses.length === 0) {
      ctx.fillStyle = "#64748B";
      ctx.font = "600 32px Pretendard, sans-serif";
      ctx.fillText(
        "오늘은 등록된 수업이 없는 날이에요 ☕",
        130,
        810,
      );
      ctx.font = "500 28px Pretendard, sans-serif";
      ctx.fillText(
        "학산도서관에서 독서를 하거나 여유로운 하루를 즐겨보세요!",
        130,
        870,
      );
    } else {
      let curY = 775;
      todayClasses.slice(0, 3).forEach((cls, idx) => {
        // 컬러 바
        drawRoundRect(130, curY - 24, 6, 48, 3, "#3B82F6");
        ctx.fillStyle = "#1E293B";
        ctx.font = "bold 32px Pretendard, sans-serif";
        ctx.fillText(`${idx + 1}. ${cls.name}`, 155, curY + 4);

        ctx.fillStyle = "#64748B";
        ctx.font = "500 26px Pretendard, sans-serif";
        const meta = `${formatHoursToTime(cls.startTime)} ~ ${formatHoursToTime(cls.endTime)}${cls.room ? ` · ${cls.room}` : ""}`;
        ctx.fillText(meta, 155, curY + 40);

        curY += 75;
      });
    }

    // 5. 카드 3: 학식 추천 카드
    drawRoundRect(
      80,
      1040,
      920,
      250,
      36,
      "rgba(255, 255, 255, 0.88)",
      "rgba(255, 255, 255, 0.95)",
    );

    ctx.fillStyle = "#0F172A";
    ctx.font = "800 36px Pretendard, sans-serif";
    ctx.fillText(`🍴 오늘의 학식 (${cafName})`, 130, 1115);

    ctx.fillStyle = "#334155";
    ctx.font = "600 30px Pretendard, sans-serif";
    ctx.fillText(cafMenu, 130, 1180);

    drawRoundRect(130, 1215, 220, 42, 21, "#EFF6FF");
    ctx.fillStyle = "#2563EB";
    ctx.font = "bold 22px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("식당 상세 바로가기", 240, 1244);

    // 6. 카드 4: 횃불이 한마디
    ctx.textAlign = "left";
    drawRoundRect(
      80,
      1320,
      920,
      300,
      36,
      "rgba(255, 255, 255, 0.88)",
      "rgba(255, 255, 255, 0.95)",
    );

    ctx.fillStyle = "#0F172A";
    ctx.font = "800 36px Pretendard, sans-serif";
    ctx.fillText("💬 횃불이의 한마디", 130, 1395);

    ctx.fillStyle = "#334155";
    ctx.font = "600 30px Pretendard, sans-serif";
    ctx.fillText(
      "오늘 하루도 알차고 즐거운 캠퍼스 라이프 보내세요! 🔥",
      130,
      1465,
    );

    ctx.fillStyle = "#64748B";
    ctx.font = "500 26px Pretendard, sans-serif";
    ctx.fillText("추천 아이템: 시원한 음료 & 긍정적인 마음가짐 🥤", 130, 1530);

    // 7. 하단 푸터 워터마크
    ctx.textAlign = "center";
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 28px Pretendard, sans-serif";
    ctx.fillText("INCHEON NATIONAL UNIVERSITY · INU PORTAL", 540, 1780);

    // URL 변환
    const dataUrl = canvas.toDataURL("image/png");
    canvasRef.current = canvas;
    setPreviewUrl(dataUrl);
    setIsGenerating(false);
  }, [
    todayDateString,
    isLoggedIn,
    todayClasses,
    now,
  ]);

  useEffect(() => {
    if (isOpen) {
      generateStoryCard();
    } else {
      setPreviewUrl(null);
      setCopySuccess(false);
    }
  }, [isOpen, generateStoryCard]);

  // 클립보드 복사
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          console.warn("클립보드 복사 실패, 다운로드로 유도:", err);
          handleDownload();
        }
      });
    } catch {
      handleDownload();
    }
  };

  // 이미지 다운로드
  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `INU_Daily_Brief_${year}${String(month).padStart(2, "0")}${String(date).padStart(2, "0")}.png`;
    a.click();
  };

  // 모바일 공유 API
  const handleWebShare = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File(
          [blob],
          `INU_Daily_Brief_${year}${String(month).padStart(2, "0")}${String(date).padStart(2, "0")}.png`,
          { type: "image/png" },
        );
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "인천대학교 Daily Brief",
            text: `[${todayDateString}] 오늘의 데일리 브리프를 공유합니다!`,
            files: [file],
          });
        } else {
          handleDownload();
        }
      });
    } catch (e) {
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="데일리 브리프 공유">
      <ModalBodyWrapper>
        <ModalDesc>
          인스타그램 스토리나 메신저에 공유하기 좋은 카드 이미지예요 📸
        </ModalDesc>

        <PreviewFrame>
          {isGenerating || !previewUrl ? (
            <LoadingPlaceholder>
              <LoadingPulse />
              <LoadingText>스토리 카드를 생성하는 중...</LoadingText>
            </LoadingPlaceholder>
          ) : (
            <PreviewImage src={previewUrl} alt="Daily Brief Story Card" />
          )}
        </PreviewFrame>

        <ButtonGroup>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <PrimaryActionButton onClick={handleWebShare}>
              <Icon name="share" size={18} color="#FFFFFF" />
              <span>스토리 / 앱으로 공유</span>
            </PrimaryActionButton>
          )}

          <SecondaryActionButton onClick={handleCopyImage}>
            <Icon
              name={copySuccess ? "check" : "file-document"}
              size={18}
              color="#2563EB"
            />
            <span>{copySuccess ? "복사 완료! 👏" : "이미지 복사하기"}</span>
          </SecondaryActionButton>

          <DownloadButton onClick={handleDownload}>
            <Icon name="image-add" size={18} color="#475569" />
            <span>이미지 저장 (다운로드)</span>
          </DownloadButton>
        </ButtonGroup>
      </ModalBodyWrapper>
    </Modal>
  );
}

const ModalBodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0 10px 0;
  width: 100%;
`;

const ModalDesc = styled.p`
  font-size: 13.5px;
  color: #64748b;
  margin: 0 0 16px 0;
  text-align: center;
  letter-spacing: -0.2px;
`;

const PreviewFrame = styled.div`
  width: 100%;
  max-width: 280px;
  height: 380px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const LoadingPulse = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: #3b82f6;
  animation: pulse 1.2s infinite ease-in-out;

  @keyframes pulse {
    0%,
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`;

const LoadingText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const PrimaryActionButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 24px;
  background: #2563eb;
  border: none;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #1d4ed8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SecondaryActionButton = styled.button`
  width: 100%;
  height: 46px;
  border-radius: 23px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  font-size: 14.5px;
  font-weight: 700;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #dbeafe;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const DownloadButton = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f5f9;
  }

  &:active {
    transform: scale(0.98);
  }
`;
