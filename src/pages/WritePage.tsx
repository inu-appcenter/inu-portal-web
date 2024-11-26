import {
  getPostDetail,
  postImages,
  postPost,
  putImages,
  putPost,
} from "apis/posts";
import axios, { AxiosError } from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { useBeforeUnload, useNavigate } from "react-router-dom";
import styled from "styled-components";
import picture from "resources/assets/write/picture.svg";
import checkedCheckbox from "resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "resources/assets/posts/unchecked-checkbox.svg";
import CategorySelect from "components/write/CategorySelect";

export default function WritePage() {
  const navigate = useNavigate();
  const [postId, setPostId] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // 스크롤 맨 위로 이동
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // postId 가져오기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setPostId(Number(params.get("id")) || 0);
  }, [location.search]);

  // 수정 시 기존 내용 가져오기
  const fetchPost = async () => {
    try {
      if (postId) {
        const response = await getPostDetail(postId);
        if (!response.data.hasAuthority) {
          alert("수정 권한이 없습니다.");
          navigate(-1);
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

  // 나갈 때 경고
  const handleBackButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    const confirmLeave = window.confirm(
      "작성 중인 내용이 사라질 수 있습니다. 계속하시겠습니까?"
    );
    if (!confirmLeave) {
      event.preventDefault();
      return;
    }
    navigate(-1);
  };

  // 이미지 업로드
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages((prevImages) => [...prevImages, ...Array.from(files)]);
    }
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
          anonymous
        );
        if (images.length > 0) {
          await putImages(response.data, images);
        } else {
          await putImages(response.data, []);
        }
        navigate(`/posts?id=${response.data}`);
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
        const response = await postPost(title, content, category, anonymous);
        if (images.length > 0) {
          await postImages(response.data, images);
        }
        navigate(`/posts?id=${response.data}`);
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
    <WritePageWrapper>
      <button className="back-button" onClick={handleBackButton}>
        ⬅️ 이전
      </button>
      <header>
        <label className="image-input" htmlFor="imageUpload">
          <img src={picture} alt="" />
          <span>사진</span>
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <span className="anonymous-upload">
          <span
            className="anonymous-wrapper"
            onClick={() => setAnonymous(!anonymous)}
          >
            <img src={anonymous ? checkedCheckbox : uncheckedCheckbox} alt="" />
            <span>익명</span>
          </span>
          <button onClick={handleSubmit} disabled={loading}>
            {postId ? "수정 완료" : "업로드"}
          </button>
        </span>
      </header>
      <div className="title-category">
        <input
          className="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
        />
        <CategorySelect category={category} setCategory={setCategory} />
      </div>
      <textarea
        className="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용을 입력하세요."
      />
      <ImagesWrapper>
        {images.map((image, index) => (
          <div key={index}>
            <img src={URL.createObjectURL(image)} alt={`preview ${index}`} />
            <button onClick={() => handleImageRemove(index)}>X</button>
          </div>
        ))}
      </ImagesWrapper>
    </WritePageWrapper>
  );
}

const WritePageWrapper = styled.div`
  padding: 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .back-button {
    background-color: transparent;
    padding: 6px 12px;
    color: #888888;
    border: 1px solid #888888;
    border-radius: 6px;
    font-size: 20px;
    width: 120px;
  }

  header {
    height: 80px;
    border-bottom: 4px solid #eaeaea;
    background: linear-gradient(0deg, #ffffff -50%, #dbebff 100%);
    display: flex;
    align-items: center;
    padding: 0 32px;
    justify-content: space-between;
    .image-input {
      padding-top: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 80px;
      height: 100%;
      img {
        width: 36px;
      }
      span {
        font-weight: 500;
        color: #969696;
      }
    }
    .anonymous-upload {
      display: flex;
      align-items: center;
      gap: 32px;
      .anonymous-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        img {
          width: 36px;
        }
        font-size: 24px;
        color: rgba(159, 163, 166, 1);
      }
      button {
        background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 20px;
        font-weight: 700;
        padding: 8px 16px;
      }
    }
  }
  .title-category {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title {
    width: 1024px;
    border: 0;
    font-size: 32px;
    font-weight: 500;
    text-align: left;
    border-bottom: 2px solid #969696;
    padding: 16px;
  }
  .content {
    width: 1024px;
    height: 400px;
    border: 0;
    font-size: 20px;
    font-weight: 500;
    resize: none;
    border-bottom: 2px solid #969696;
    padding: 16px;
    font-family: inherit;
  }
`;

const ImagesWrapper = styled.div`
  width: 1024px;
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: scroll;
  div {
    position: relative;
  }
  img {
    max-height: 200px;
    border: 2px solid #dbebff;
    border-radius: 8px;
  }

  button {
    position: absolute;
    top: 8px;
    right: 8px;
    border: none;
    border-radius: 100%;
    width: 32px;
    height: 32px;
    background-color: rgba(234, 109, 91);
  }
`;
