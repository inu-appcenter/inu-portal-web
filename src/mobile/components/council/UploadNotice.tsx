import { postCouncilNotices, putCouncilNotices } from "apis/councilNotices";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";
import { CouncilNotice } from "types/councilNotices";

export default function UploadNotice({
  onUploaded,
  initialData,
  isOpen,
  onClose,
}: {
  onUploaded: () => void;
  initialData?: CouncilNotice;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPost = async () => {
    // 초기 데이터를 변경 시 필드 업데이트
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      console.log(initialData);
      if (initialData.imageCount && initialData.id) {
        const fetchedImages: File[] = [];
        for (let imageId = 0; imageId < initialData.imageCount; imageId++) {
          const responseImage = await fetch(
            `https://portal.inuappcenter.kr/images/councilNotice/${
              initialData.id
            }-${imageId + 1}?v=${initialData.modifiedDate}`
          );
          const blob = await responseImage.blob();
          const file = new File([blob], `image_${imageId}.png`, {
            type: blob.type,
          });
          fetchedImages.push(file);
        }

        setSelectedImages(fetchedImages);
      }
    }
  };

  useEffect(() => {
    fetchPost();
  }, [initialData]);

  // 이미지 선택 핸들러
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  // 등록 핸들러
  const handlePost = async () => {
    if (!title || !content || selectedImages.length < 1) {
      alert("모든 필드를 입력하고 이미지를 선택하세요.");
      return;
    }

    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      if (initialData) {
        await putCouncilNotices(initialData.id, title, content, selectedImages);
        alert("총학생회 공지사항이 수정되었습니다!");
      } else {
        await postCouncilNotices(title, content, selectedImages);
        alert("총학생회 공지사항이 등록되었습니다!");
      }
      resetForm();
      onUploaded();
      setIsLoading(false);
      onClose();
    } catch (error) {
      setIsLoading(false);
      console.error("Error posting:", error);
      // refreshError가 아닌 경우 처리
      if (
        axios.isAxiosError(error) &&
        !(error as AxiosError & { isRefreshError?: boolean }).isRefreshError &&
        error.response
      ) {
        switch (error.response.status) {
          case 403:
            alert("이 게시글의 수정/삭제에 대한 권한이 없습니다.");
            break;
          case 404:
            alert("존재하지 않는 게시글입니다.");
            break;
          default:
            alert("총학생회 공지사항 등록 중 오류가 발생했습니다.");
            break;
        }
      }
    }
  };

  // 입력 필드 초기화
  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedImages([]);
  };

  return (
    isOpen && (
      <BottomSheet open={isOpen} onDismiss={onClose}>
        <FormWrapper>
          <h2>
            {initialData ? "총학생회 공지사항 수정" : "총학생회 공지사항 등록"}
          </h2>
          <InputWrapper>
            <label>제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="총학생회 공지사항 제목을 입력하세요"
            />
          </InputWrapper>
          <InputWrapper>
            <label>내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
            ></textarea>
          </InputWrapper>
          <FileInputWrapper>
            <label htmlFor="imageInput">이미지 선택</label>
            <input
              type="file"
              id="imageInput"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <ImagePreview>
              {selectedImages.map((image, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(image)}
                  alt={`Selected ${index}`}
                />
              ))}
            </ImagePreview>
          </FileInputWrapper>
          <ButtonWrapper>
            <button onClick={handlePost} disabled={isLoading}>
              {isLoading ? "등록 중" : initialData ? "수정 완료" : "등록 완료"}
            </button>{" "}
            <button onClick={onClose} disabled={isLoading}>
              닫기
            </button>
          </ButtonWrapper>
        </FormWrapper>
      </BottomSheet>
    )
  );
}

const FormWrapper = styled.div`
  padding: 16px;
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: bold;
  }

  input,
  textarea {
    box-sizing: border-box;
    width: 100%;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: bold;
  }

  input[type="file"] {
    margin-top: 8px;
  }
`;

const ImagePreview = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    padding: 8px 16px;
    font-size: 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  button:first-child {
    background-color: #007bff;
    color: white;
  }

  button:last-child {
    background-color: #ccc;
  }
`;
