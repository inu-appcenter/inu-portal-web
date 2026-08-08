import { useState } from "react";
import styled from "styled-components";
import ImageModal from "@/components/mobile/chat/ImageModal";

interface PostContentProps {
  id: number;
  content: string;
  imageCount: number;
  type: string;
  modifiedDate: string;
}

export default function PostContent({
  id,
  content,
  imageCount,
  type,
  modifiedDate,
}: PostContentProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageUrls = Array.from({ length: imageCount }, (_, index) => {
    return type === "TIPS"
      ? `https://portal.inuappcenter.kr/images/post/${id}-${
          index + 1
        }?v=${modifiedDate}`
      : type === "COUNCILNOTICE"
        ? `https://portal.inuappcenter.kr/images/councilNotice/${id}-${
            index + 1
          }?v=${modifiedDate}`
        : type === "PETITION"
          ? `https://portal.inuappcenter.kr/images/petition/${id}-${
              index + 1
            }?v=${modifiedDate}`
          : "";
  }).filter(Boolean);

  const handleImageClick = (url: string) => {
    setSelectedImageUrl(url);
    setIsModalOpen(true);
  };

  return (
    <>
      <PostContentWrapper className="post-contents">
        <ContentText>{content}</ContentText>

        {imageCount === 1 && imageUrls.length > 0 && (
          <SingleImageWrapper>
            <SingleImage
              src={imageUrls[0]}
              alt="게시글 이미지 1"
              onClick={() => handleImageClick(imageUrls[0])}
            />
          </SingleImageWrapper>
        )}

        {imageCount >= 2 && imageUrls.length > 0 && (
          <MultiImageScrollContainer>
            {imageUrls.map((url, index) => (
              <ThumbnailImage
                key={index}
                src={url}
                alt={`게시글 이미지 ${index + 1}`}
                onClick={() => handleImageClick(url)}
              />
            ))}
          </MultiImageScrollContainer>
        )}
      </PostContentWrapper>

      <ImageModal
        imageUrl={selectedImageUrl}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

const PostContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ContentText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Pretendard, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-primary, #191f28);
`;

const SingleImageWrapper = styled.div`
  margin-top: 16px;
  width: 100%;
`;

const SingleImage = styled.img`
  max-width: 100%;
  border-radius: 16px;
  cursor: pointer;
  object-fit: cover;
  transition: opacity 0.15s ease-in-out;

  &:active {
    opacity: 0.85;
  }
`;

const MultiImageScrollContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-top: 16px;
  padding-bottom: 6px;
  width: 100%;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
`;

const ThumbnailImage = styled.img`
  width: 128px;
  height: 128px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.12s ease-in-out, opacity 0.12s ease-in-out;

  &:active {
    transform: scale(0.96);
    opacity: 0.85;
  }
`;
