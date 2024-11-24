import styled from "styled-components";

interface PostContentProps {
  id: number;
  content: string;
  imageCount: number;
}

export default function PostContent({
  id,
  content,
  imageCount,
}: PostContentProps) {
  return (
    <>
      <div className="post-contents">
        <div className="contents-img-container">
          {Array.from({ length: imageCount }, (_, index) => (
            <ContentImg
              key={index}
              src={`https://portal.inuappcenter.kr/api/posts/${id}/images/${
                index + 1
              }`}
              alt={`이미지 ${index + 1}`}
              onClick={() =>
                window.open(
                  `https://portal.inuappcenter.kr/api/posts/${id}/images/${
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
