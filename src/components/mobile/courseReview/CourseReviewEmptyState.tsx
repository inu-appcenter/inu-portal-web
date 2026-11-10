import styled from "styled-components";
import EmptyState from "@/components/common/EmptyState";
import CapsuleButton from "@/components/common/CapsuleButton";

interface CourseReviewEmptyStateProps {
  courseName?: string;
  professorName?: string;
  onWriteClick: () => void;
}

export default function CourseReviewEmptyState({
  courseName = "이 강의",
  professorName,
  onWriteClick,
}: CourseReviewEmptyStateProps) {
  const handleEverytimeSearch = () => {
    const keyword =
      professorName && professorName !== "all" ? professorName : courseName;
    window.open(
      `https://everytime.kr/lecture/search?keyword=${encodeURIComponent(keyword)}&condition=professor`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <EmptyState padding="56px 20px">
      <ContentWrapper>
        <EmptyTitle>아직 등록된 강의평이 없어요</EmptyTitle>
        <EmptyDescription>
          {courseName} 수업을 들어보셨다면
          <br />
          첫 번째 후기를 남겨 후배들에게 도움을 주세요!
        </EmptyDescription>

        <ButtonGroup>
          <CapsuleButton variant="primary" fullWidth onClick={onWriteClick}>
            첫 후기 작성하기
          </CapsuleButton>
          <EverytimeButton type="button" onClick={handleEverytimeSearch}>
            에브리타임에서 관련 후기 검색하기 ›
          </EverytimeButton>
        </ButtonGroup>
      </ContentWrapper>
    </EmptyState>
  );
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
  gap: 12px;
`;

const EmptyTitle = styled.h4`
  margin: 0;
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
`;

const EmptyDescription = styled.p`
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-tertiary);
  line-height: 1.5;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 12px;
  margin-top: 12px;
`;

const EverytimeButton = styled.button`
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  padding: 6px 12px;
  transition: color 0.15s ease;

  &:hover {
    color: var(--text-secondary);
  }

  &:active {
    transform: scale(0.98);
  }
`;
