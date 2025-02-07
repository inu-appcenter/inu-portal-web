import styled from "styled-components";

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
  return (
    <>
      <div className="post-contents">
        <div className="contents-img-container">
          {Array.from({ length: imageCount }, (_, index) => {
            const imageUrl =
              type === "TIPS"
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
        <div className="contents">{content}</div>
      </div>
    </>
  );
}

const ContentImg = styled.img`
  max-width: 100%;
`;
