import { postBooks, putBooks } from "apis/books";
import { useEffect, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import styled from "styled-components";

export default function UploadBook({
  onBookUploaded,
  initialData,
  isOpen,
  onClose,
}: {
  onBookUploaded: () => void;
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [price, setPrice] = useState<number | "">(initialData?.price || "");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    // 초기 데이터를 변경 시 필드 업데이트
    if (initialData) {
      setName(initialData.name);
      setAuthor(initialData.author);
      setContent(initialData.content);
      setPrice(initialData.price || "");
    }
  }, [initialData]);

  // 이미지 선택 핸들러
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  // 책 등록 핸들러
  const handlePostBooks = async () => {
    if (!name || !author || !content || !price || selectedImages.length < 1) {
      alert("모든 필드를 입력하고 이미지를 선택하세요.");
      return;
    }

    try {
      if (initialData) {
        await putBooks(
          initialData.id,
          name,
          author,
          content,
          Number(price),
          selectedImages
        );
        alert("책이 수정되었습니다!");
      } else {
        await postBooks(name, author, content, Number(price), selectedImages);
        alert("책이 등록되었습니다!");
      }
      resetForm();
      onBookUploaded();
      onClose(); // 닫기
    } catch (error) {
      console.error("Error posting book:", error);
      alert("책 등록 중 오류가 발생했습니다.");
    }
  };

  // 입력 필드 초기화
  const resetForm = () => {
    setName("");
    setAuthor("");
    setContent("");
    setPrice("");
    setSelectedImages([]);
  };

  return (
    isOpen && (
      <BottomSheet open={isOpen} onDismiss={onClose}>
        <FormWrapper>
          <h2>{initialData ? "책 수정" : "책 등록"}</h2>
          <InputWrapper>
            <label>책 제목</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="책 제목을 입력하세요"
            />
          </InputWrapper>
          <InputWrapper>
            <label>저자</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="저자를 입력하세요"
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
          <InputWrapper>
            <label>가격</label>
            <input
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="가격을 입력하세요"
            />
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
            <button onClick={handlePostBooks}>
              {initialData ? "수정 완료" : "등록 완료"}
            </button>{" "}
            <button onClick={onClose}>닫기</button>
          </ButtonWrapper>
        </FormWrapper>
      </BottomSheet>
    )
  );
}

const FormWrapper = styled.div`
  padding: 16px;
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
  }

  button:first-child {
    background-color: #007bff;
    color: white;
  }

  button:last-child {
    background-color: #ccc;
  }
`;
