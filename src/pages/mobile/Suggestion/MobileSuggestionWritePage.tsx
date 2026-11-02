import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import Icon from "@/components/common/Icon";
import Modal from "@/components/common/Modal";
import { ROUTES } from "@/constants/routes";
import { useHeader } from "@/context/HeaderContext";
import { useSuggestionAuthGuard } from "@/hooks/useSuggestionAuth";
import { postSuggestion } from "@/apis/suggestions";
import { useToastStore } from "@/stores/useToastStore";
import { typography } from "@/styles/typography";
import { mixpanelTrack } from "@/utils/mixpanel";
import { getDeviceInfo } from "@/utils/deviceInfo";
import {
  SUGGESTION_CATEGORIES,
  SUGGESTION_CONTENT_MAX,
  SUGGESTION_MAX_IMAGES,
  SUGGESTION_MAX_IMAGE_BYTES,
  SUGGESTION_MAX_TOTAL_BYTES,
  SUGGESTION_QUERY_KEY,
  type SuggestionCategory,
} from "@/types/suggestions";

export default function MobileSuggestionWritePage() {
  const allowed = useSuggestionAuthGuard();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  const [category, setCategory] = useState<SuggestionCategory | null>(null);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useHeader({ title: "의견 보내기", pageBgColor: "var(--bg-base)" });

  useEffect(() => {
    if (allowed) mixpanelTrack.suggestionFormOpened("write_page");
  }, [allowed]);

  const previews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images],
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );

  const categoryError = showErrors && !category;
  const contentError = showErrors && content.trim().length === 0;
  const isValid = Boolean(category) && content.trim().length > 0;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...images];
    let rejected: string | null = null;
    for (const file of Array.from(files)) {
      if (next.length >= SUGGESTION_MAX_IMAGES) {
        rejected = `사진은 최대 ${SUGGESTION_MAX_IMAGES}장까지 첨부할 수 있어요.`;
        break;
      }
      if (!file.type.startsWith("image/")) {
        rejected = "이미지 파일만 첨부할 수 있어요.";
        continue;
      }
      if (file.size > SUGGESTION_MAX_IMAGE_BYTES) {
        rejected = "사진은 한 장당 10MB까지 첨부할 수 있어요.";
        continue;
      }
      const total = next.reduce((sum, f) => sum + f.size, 0) + file.size;
      if (total > SUGGESTION_MAX_TOTAL_BYTES) {
        rejected = "사진은 모두 합쳐 20MB까지 첨부할 수 있어요.";
        continue;
      }
      next.push(file);
    }
    setImages(next);
    if (rejected) showToast(rejected);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!isValid || !category) {
      setShowErrors(true);
      return;
    }
    setSubmitting(true);
    try {
      await postSuggestion(
        { category, content: content.trim(), ...getDeviceInfo() },
        images,
      );
      mixpanelTrack.suggestionSubmitted({
        category,
        imageCount: images.length,
        success: true,
      });
      queryClient.invalidateQueries({ queryKey: SUGGESTION_QUERY_KEY });
      setDoneOpen(true);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      mixpanelTrack.suggestionSubmitted({
        category,
        imageCount: images.length,
        success: false,
        failureReason: status ? `http_${status}` : "network",
      });
      // 입력은 그대로 둔다.
      showToast("전송에 실패했어요. 다시 시도해 주세요.", {
        bottomOffset: 168,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 모달이 history 엔트리를 쓰므로 -1 대신 경로를 지정해 이동한다.
  const finish = () => {
    setDoneOpen(false);
    navigate(ROUTES.MYPAGE.ROOT, { replace: true });
  };

  if (!allowed) return null;

  return (
    <Page>
      <Body>
        <Heading>
          <Title>INTIP을 쓰며 느낀 점을 알려주세요</Title>
          <Sub>남겨주신 의견은 더 나은 INTIP을 만드는 데 참고할게요.</Sub>
        </Heading>

        <Section>
          <Label>
            어떤 내용인가요? <Required>*</Required>
          </Label>
          <Chips role="radiogroup" aria-label="문의 유형">
            {SUGGESTION_CATEGORIES.map((c) => (
              <CategoryChip
                key={c.value}
                type="button"
                role="radio"
                aria-checked={category === c.value}
                $selected={category === c.value}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </CategoryChip>
            ))}
          </Chips>
          {categoryError && <ErrorText>문의 유형을 선택해 주세요.</ErrorText>}
        </Section>

        <Section>
          <Label>
            내용 <Required>*</Required>
          </Label>
          <TextAreaBox $error={contentError}>
            <TextArea
              value={content}
              maxLength={SUGGESTION_CONTENT_MAX}
              onChange={(e) => setContent(e.target.value)}
              aria-label="내용"
            />
            <Counter>
              {content.length} / {SUGGESTION_CONTENT_MAX}
            </Counter>
          </TextAreaBox>
          {contentError && (
            <ErrorText>내용을 입력해 주세요. 공백만으로는 보낼 수 없어요.</ErrorText>
          )}
        </Section>

        <Section>
          <Label>
            사진 첨부 <Optional>(선택)</Optional>
          </Label>
          <Photos>
            <AddPhoto
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= SUGGESTION_MAX_IMAGES}
              aria-label="사진 추가"
            >
              <Icon name="camera" size={24} />
              <span>
                {images.length}/{SUGGESTION_MAX_IMAGES}
              </span>
            </AddPhoto>
            {previews.map((src, i) => (
              <PhotoItem key={src}>
                <img src={src} alt={`첨부 사진 ${i + 1}`} />
                <RemovePhoto
                  type="button"
                  aria-label="사진 삭제"
                  onClick={() =>
                    setImages((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  <Icon name="close-md" size={12} color="var(--text-inverse)" />
                </RemovePhoto>
              </PhotoItem>
            ))}
          </Photos>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </Section>
      </Body>

      <Footer>
        <Notice>
          <Icon name="info" size={16} color="var(--text-tertiary)" />
          <span>
            개별 답변은 드리지 않아요. 사용 문의·1:1 상담은 추후 제공될
            ‘관리자와 채팅’을 이용해 주세요.
          </span>
        </Notice>
        <Submit
          type="button"
          onClick={handleSubmit}
          aria-disabled={!isValid || submitting}
          $inactive={!isValid || submitting}
        >
          {submitting ? "보내는 중…" : "의견 보내기"}
        </Submit>
      </Footer>

      <Modal
        isOpen={doneOpen}
        onClose={finish}
        closeOnOverlayClick={false}
        title="소중한 의견 고마워요"
        description={
          <>
            보내주신 내용은 운영진이 확인할게요.
            <br />
            내가 보낸 의견에서 다시 볼 수 있어요.
          </>
        }
        secondaryButton={{
          text: "내 의견 보기",
          onClick: () => {
            setDoneOpen(false);
            navigate(ROUTES.MYPAGE.SUGGESTION_LIST, { replace: true });
          },
        }}
        primaryButton={{
          text: "확인",
          variant: "brand",
          onClick: finish,
        }}
      />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100svh;
  box-sizing: border-box;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  flex: 1;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 20px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  ${typography.title3}
  margin: 0;
  color: var(--text-primary);
`;

const Sub = styled.p`
  ${typography.body2}
  margin: 0;
  color: var(--text-tertiary);
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.div`
  ${typography.label1}
  color: var(--text-secondary);
`;

const Required = styled.span`
  color: var(--text-brand);
`;

const Optional = styled.span`
  color: var(--text-tertiary);
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CategoryChip = styled.button<{ $selected: boolean }>`
  ${typography.label2}
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-full);
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--border-brand)" : "var(--border-default)"};
  background: ${({ $selected }) =>
    $selected ? "var(--bg-brand)" : "var(--bg-base)"};
  color: ${({ $selected }) =>
    $selected ? "var(--text-brand)" : "var(--text-secondary)"};
  cursor: pointer;
`;

const ErrorText = styled.p`
  ${typography.caption1}
  margin: -4px 0 0;
  color: var(--text-error);
`;

const TextAreaBox = styled.div<{ $error: boolean }>`
  position: relative;
  border: 1px solid
    ${({ $error }) => ($error ? "var(--border-error)" : "var(--border-default)")};
  border-radius: 12px;
  background: var(--bg-base);

  &:focus-within {
    border-color: ${({ $error }) =>
      $error ? "var(--border-error)" : "var(--border-brand)"};
  }
`;

const TextArea = styled.textarea`
  ${typography.body1}
  display: block;
  width: 100%;
  height: 152px;
  box-sizing: border-box;
  padding: 16px 16px 36px;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--text-primary);
`;

const Counter = styled.span`
  ${typography.caption1}
  position: absolute;
  right: 16px;
  bottom: 12px;
  color: var(--text-tertiary);
  pointer-events: none;
`;

const Photos = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const AddPhoto = styled.button`
  ${typography.caption1}
  width: 72px;
  height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px dashed var(--border-strong);
  border-radius: 12px;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
  cursor: pointer;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

const PhotoItem = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--bg-muted);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 11px;
  }
`;

const RemovePhoto = styled.button`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: var(--text-tertiary);
  cursor: pointer;
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 8px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-base);
`;

const Notice = styled.div`
  ${typography.caption1}
  display: flex;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: var(--bg-subtle);
  color: var(--text-tertiary);

  svg,
  i {
    flex-shrink: 0;
  }
`;

const Submit = styled.button<{ $inactive: boolean }>`
  ${typography.title3}
  width: 100%;
  height: 56px;
  border: none;
  border-radius: var(--radius-full);
  background: ${({ $inactive }) =>
    $inactive
      ? "var(--interactive-primary-disabled)"
      : "var(--interactive-primary)"};
  color: ${({ $inactive }) =>
    $inactive ? "var(--text-disabled)" : "var(--text-inverse)"};
  cursor: pointer;

  &:not([aria-disabled="true"]):active {
    background: var(--interactive-primary-pressed);
  }
`;
