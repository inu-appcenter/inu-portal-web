import styled from "styled-components";
import TitleContentInput from "mobile/components/write/TitleContentInput";
import PhotoUpload from "mobile/components/write/PhotoUpload";
import AnonymousCheck from "mobile/components/write/AnonymousCheck";
import { useEffect, useState } from "react";
import { getPostDetail, postPost, putPost } from "apis/posts";
import { useBeforeUnload, useNavigate } from "react-router-dom";
import { useResetTipsStore } from "reducer/resetTipsStore";
import { useResetWriteStore } from "reducer/resetWriteStore";
import axios, { AxiosError } from "axios";
import useAppStateStore from "stores/useAppStateStore";

interface Props {
  category: string;
  setCategory: (value: string) => void;
}

export default function WriteForm({ category, setCategory }: Props) {
  const navigate = useNavigate();
  const [postId, setPostId] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const triggerResetTips = useResetTipsStore((state) => state.triggerReset);
  const triggerResetWrite = useResetWriteStore((state) => state.triggerReset);
  const { isAppUrl } = useAppStateStore();

  // postId 가져오기
  useEffect(() => {
    if (location.pathname.includes("/write")) {
      const params = new URLSearchParams(location.search);
      setPostId(Number(params.get("id")) || 0);
    }
  }, [location.pathname, location.search]);

  // 수정 시 기존 내용 가져오기
  const fetchPost = async () => {
    try {
      if (postId) {
        const response = await getPostDetail(postId);
        if (!response.data.hasAuthority) {
          alert("수정 권한이 없습니다.");
          navigate(`${isAppUrl}/write`);
        }
        setTitle(response.data.title);
        setContent(response.data.content);
        setCategory(response.data.category);
        setAnonymous(response.data.writer === "횃불이");

        const fetchedImages: File[] = [];
        for (let imageId = 0; imageId < response.data.imageCount; imageId++) {
          const response = await fetch(
            `https://portal.inuappcenter.kr/api/posts/${postId}/images/${
              imageId + 1
            }`
          );
          const blob = await response.blob();
          const file = new File([blob], `image_${imageId}.png`, {
            type: blob.type,
          });
          fetchedImages.push(file);
        }

        setImages(fetchedImages);
      } else {
        setTitle("");
        setContent("");
        setCategory("");
        setAnonymous(false);
        setImages([]);
      }
    } catch (error) {
      console.error("게시글 가져오기 실패", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 404:
            alert("존재하지 않는 게시글입니다.");
            navigate(-1);
            break;
          default:
            alert("게시글 가져오기 실패");
            navigate(-1);
            break;
        }
      }
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // 나갈 때 경고
  useBeforeUnload((event) => {
    event.preventDefault();
  });

  // 이미지 업로드
  const handleImageUpload = (files: File[]) => {
    setImages((prevImages) => [...prevImages, ...files]);
  };

  // 이미지 삭제
  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // 업로드/수정 완료 버튼
  const handleSubmit = async () => {
    if (loading) alert("업로드 진행 중");
    if (content.length > 1999) {
      alert("내용은 2000자 이하로 작성해 주세요.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 작성해 주세요.");
      return;
    }
    if (category.trim() === "") {
      alert("카테고리를 선택해 주세요.");
      return;
    }
    setLoading(true);
    if (postId) {
      try {
        const response = await putPost(
          postId,
          title,
          content,
          category,
          anonymous,
          images
        );
        triggerResetTips();
        triggerResetWrite();
        navigate(`${isAppUrl}/postdetail?id=${response.data}`);
      } catch (error) {
        console.error("게시글 수정 실패", error);
        // refreshError가 아닌 경우 처리
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          switch (error.response.status) {
            case 403:
              alert("이 게시글의 수정/삭제에 대한 권한이 없습니다.");
              break;
            case 404:
              alert("존재하지 않는 회원입니다. / 존재하지 않는 게시글입니다.");
              break;
            default:
              alert("게시글 수정 실패");
              break;
          }
        }
      }
    } else {
      try {
        const response = await postPost(
          title,
          content,
          category,
          anonymous,
          images
        );
        triggerResetTips();
        triggerResetWrite();
        navigate(`${isAppUrl}/postdetail?id=${response.data}`);
      } catch (error) {
        console.error("게시글 등록 실패", error);
        // refreshError가 아닌 경우 처리
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          switch (error.response.status) {
            case 400:
              alert(
                "일정 시간 동안 같은 게시글이나 댓글을 작성할 수 없습니다."
              );
              break;
            case 404:
              alert("존재하지 않는 회원입니다.");
              break;
            default:
              alert("게시글 등록 실패");
              break;
          }
        }
      }
    }

    setLoading(false);
  };

  return (
    <WriteFormWrapper>
      <TitleContentInput
        title={title}
        onTitleChange={(value: string) => setTitle(value)}
        content={content}
        onContentChange={(value: string) => setContent(value)}
      />
      <PhotoUpload
        images={images}
        onImageChange={handleImageUpload}
        onImageRemove={handleImageRemove}
      />
      <AnonymousCheck
        checked={anonymous}
        onChange={(checked: boolean) => setAnonymous(checked)}
      />
      <UploadButton $disabled={loading} onClick={handleSubmit}>
        {loading ? "업로드 중..." : "업로드"}
      </UploadButton>
      <Desc>
        부적절하거나 불쾌감을 줄 수 있는 컨텐츠는 제재를 받을 수 있습니다.
      </Desc>
    </WriteFormWrapper>
  );
}

const WriteFormWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UploadButton = styled.div<{ $disabled: boolean }>`
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: ${({ $disabled }) => ($disabled ? "#CCC" : "#ADC7EC")};
`;

const Desc = styled.span`
  color: gray;
  font-size: 10px;
  text-align: center;
`;
