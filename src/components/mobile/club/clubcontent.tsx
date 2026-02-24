import styled from "styled-components";

interface PostContentProps {
  id: string;
  content: string;
  imageCount: number;
  modifiedDate: string;
}

export default function ClubContent({
  id,
  content,
  imageCount,
  modifiedDate,
}: PostContentProps) {
  return (
    <ClubContentWrapper>
      <div className="post-contents">
        <div className="contents-img-container">
          {Array.from({ length: imageCount }, (_, index) => {
            const imageUrl = `https://portal.inuappcenter.kr/images/clubRecruit/${id}-${
              index + 1
            }?v=${modifiedDate}`;
            return (
              <ContentImg
                key={index}
                src={imageUrl}
                alt={`이미지 ${index + 1}`}
                onClick={() => window.open(imageUrl)}
              />
            );
          })}
        </div>
        <ContentText>{content}</ContentText>
      </div>
    </ClubContentWrapper>
  );
}

const ClubContentWrapper = styled.div``;

const ContentImg = styled.img`
  max-width: 100%;
`;

const ContentText = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
`;
