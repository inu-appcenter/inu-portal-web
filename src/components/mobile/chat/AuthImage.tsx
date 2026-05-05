import React, { useEffect, useState } from "react";
import tokenInstance from "@/apis/tokenInstance";

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const AuthImage = ({ src, ...props }: AuthImageProps) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    const fetchImage = async () => {
      try {
        const response = await tokenInstance.get(src, {
          responseType: "blob",
        });

        const url = URL.createObjectURL(response.data);
        setImgUrl(url);

        // 메모리 누수 방지를 위한 cleanup
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        console.error("이미지 로드 오류:", error);
      }
    };

    fetchImage();
  }, [src]);

  // 로딩 중이거나 에러 시 빈 영역 또는 스켈레톤 처리
  if (!imgUrl)
    return (
      <div
        style={{
          width: "100%",
          height: "200px",
          background: "#eee",
          borderRadius: "12px",
        }}
      />
    );

  return <img src={imgUrl} {...props} />;
};

export default AuthImage;
