import styled from "styled-components";
import TitleContentInput from "@/components/mobile/write/TitleContentInput";
import WriteBottomBar from "@/components/mobile/write/WriteBottomBar";
import { useEffect, useState } from "react";
import { getPostDetail, postPost, putPost } from "@/apis/posts";
import { useBeforeUnload, useNavigate, useParams } from "react-router-dom";
import { useResetTipsStore } from "@/reducer/resetTipsStore";
import { useResetWriteStore } from "@/reducer/resetWriteStore";
import axios, { AxiosError } from "axios";
import useAppStateStore from "@/stores/useAppStateStore";
import { mixpanelTrack } from "@/utils/mixpanel";
import { X } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  category: string;
  setCategory: (value: string) => void;
}

export default function WriteForm({ category, setCategory }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: routeId } = useParams<{ id?: string }>();
  const postId = routeId ? Number(routeId) : 0;
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [anonymous, setAnonymous] = useState<boolean>(true);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const triggerResetTips = useResetTipsStore((state) => state.triggerReset);
  const triggerResetWrite = useResetWriteStore((state) => state.triggerReset);
  const { isAppUrl } = useAppStateStore();

  // 수정 시 기존 내용 가져오기
  const fetchPost = async () => {
    try {
      if (postId) {
        const response = await getPostDetail(postId);
        if (!response.data.hasAuthority) {
          alert("수정 권한이 없습니다.");
          navigate(`/write`);
        }
        setTitle(response.data.title);
        setContent(response.data.content);
        setCategory(response.data.category);
        setAnonymous(response.data.writer === "횃불이");

        const fetchedImages: File[] = [];
        for (let imageId = 0; imageId < response.data.imageCount; imageId++) {
          const responseImage = await fetch(
            `https://portal.inuappcenter.kr/images/post/${postId}-${
              imageId + 1
            }?v=${response.data.modifiedDate}`,
          );
          const blob = await responseImage.blob();
          const file = new File([blob], `image_${imageId}.png`, {
            type: blob.type,
          });
          fetchedImages.push(file);
        }

        setImages(fetchedImages);
      } else {
        setTitle("");
        setContent("");
        setAnonymous(true);
        setImages([]);
      }
    } catch (error) {
      console.error("게시글 가져오기 실패", error);
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
    if (isAppUrl === "/m") {
      event.preventDefault();
    }
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
        await putPost(postId, title, content, category, anonymous, images);
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        triggerResetTips();
        triggerResetWrite();
        navigate(-1);
      } catch (error) {
        console.error("게시글 수정 실패", error);
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
          images,
        );
        mixpanelTrack.boardInteraction("Write", "TIPS", category);
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        triggerResetTips();
        triggerResetWrite();
        navigate(ROUTES.BOARD.TIPS_DETAIL(response.data), { replace: true });
      } catch (error) {
        console.error("게시글 등록 실패", error);
        if (
          axios.isAxiosError(error) &&
          !(error as AxiosError & { isRefreshError?: boolean })
            .isRefreshError &&
          error.response
        ) {
          switch (error.response.status) {
            case 400:
              alert(
                "일정 시간 동안 같은 게시글이나 댓글을 작성할 수 없습니다.",
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

      {images.length > 0 && (
        <ImagePreviewRow>
          {images.map((image, index) => (
            <ThumbnailContainer key={index}>
              <img src={URL.createObjectURL(image)} alt={`preview ${index}`} />
              <RemoveImageButton
                onClick={() => handleImageRemove(index)}
                type="button"
              >
                <X size={12} color="#FFF" />
              </RemoveImageButton>
            </ThumbnailContainer>
          ))}
        </ImagePreviewRow>
      )}

      <WriteBottomBar
        anonymous={anonymous}
        onAnonymousChange={(checked) => setAnonymous(checked)}
        onImageChange={handleImageUpload}
        onSubmit={handleSubmit}
        loading={loading}
        imageCount={images.length}
      />
    </WriteFormWrapper>
  );
}

const WriteFormWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 70px;
  box-sizing: border-box;
`;

const ImagePreviewRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0 16px;
  width: 100%;
`;

const ThumbnailContainer = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-default, #e5e8eb);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
`;
