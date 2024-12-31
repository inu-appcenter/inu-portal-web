import styled from "styled-components";

interface PostContentProps {
  id: number;
  content: string;
  imageCount: number;
  type: string;
}

export default function PostContent({
  id,
  content,
  imageCount,
  type,
}: PostContentProps) {
  return (
    <>
      <div className="post-contents">
        <div className="contents-img-container">
          {Array.from({ length: imageCount }, (_, index) => (
            <ContentImg
              key={index}
              src={
                type === "TIPS"
                  ? `https://portal.inuappcenter.kr/api/posts/${id}/images/${
                      index + 1
                    }`
                  : `https://portal.inuappcenter.kr/api/councilNotices/${id}/images/${
                      index + 1
                    }`
              }
              alt={`이미지 ${index + 1}`}
              onClick={() =>
                window.open(
                  type === "TIPS"
                    ? `https://portal.inuappcenter.kr/api/posts/${id}/images/${
                        index + 1
                      }`
                    : `https://portal.inuappcenter.kr/api/councilNotices/${id}/images/${
                        index + 1
                      }`
                )
              }
            />
          ))}
        </div>
        <div className="contents">{content}</div>
      </div>
    </>
  );
}

const ContentImg = styled.img`
  max-width: 100%;
`;
