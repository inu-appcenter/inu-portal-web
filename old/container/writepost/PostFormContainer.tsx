import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TitleInput from "../../component/writepost/TitleInput";
import ContentInput from "../../component/writepost/ContentInput";
import CategorySelect from "../../component/writepost/CategorySelect";
import AnonymousCheckbox from "../../component/writepost/AnonymousCheckbox";
import { useSelector } from "react-redux";
import ImageInput from "../../component/writepost/ImageInput";
import {
  postPosts,
  getPost,
  putPost,
  putImages,
  getImages,
  postImages,
} from "old/utils/API/Posts";
import styled from "styled-components";
import inuLogoImg from "../../resource/assets/inu-logo-img.svg";

interface Post {
  id: number;
  title: string;
  category: string;
  writer: string;
  content: string;
  like: number;
  scrap: number;
  view: number;
  isLiked: boolean;
  isScraped: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  imageCount: number;
  bestReplies: Replies;
  replies: Replies[];
}

interface Replies {
  id: number;
  writer: string;
  content: string;
  like: number;
  isLiked: boolean;
  isAnonymous: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies: Replies[];
}

export default function PostFormContainer() {
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: any) => state.user.token);
  const [type, setType] = useState("");
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageCount, setImageCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTitleChange = (value: string) => setTitle(value);
  const handleContentChange = (value: string) => setContent(value);
  const handleCategoryChange = (value: string) => setCategory(value);
  const handleAnonymousChange = (checked: boolean) => setAnonymous(checked);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImages((prevImages) => [...prevImages, file]);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (location.pathname.includes("/update")) {
      setType("update");
    } else if (location.pathname.includes("/write")) {
      setType("create");
    }
  }, [location.pathname]);

  // setPost, 수정 권한 확인
  useEffect(() => {
    if (type === "update" && id) {
      const fetchPost = async () => {
        const response = await getPost(token, id);
        if (response.status === 200) {
          setPost(response.body.data);
          if (!response.body.data.hasAuthority) {
            window.alert("수정 권한이 없습니다");
            window.close();
          }
        }
      };
      fetchPost();
    }
  }, [id, token]);

  // post 변경 시 set
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setImageCount(post.imageCount);
    }
  }, [post]);

  useEffect(() => {
    const fetchImagesData = async () => {
      if (id === undefined) {
        console.log("ID is undefined");
        return;
      }
      try {
        let images: File[] = [];
        for (let imageId = 1; imageId <= imageCount; imageId++) {
          try {
            const response = await getImages(id, imageId);
            if (response.status === 200) {
              const imageBlob = response.body;
              const imageFile = new File([imageBlob], `image_${imageId}.png`);
              images.push(imageFile);
            }
          } catch (error) {
            console.error(`Error fetching image:`, error);
          }
        }
        setImages(images);
      } catch (error) {
        console.error(error);
      }
    };
    fetchImagesData();
  }, [id, imageCount]);

  // 버튼 클릭
  const handlePostSubmit = async () => {
    if (loading) return;
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
    try {
      if (type === "create") {
        let postId;
        const response = await postPosts(
          { title, content, category, anonymous },
          token,
        );
        if (response.status === 201) {
          postId = response.body.data;
          if (images.length) {
            const responseImage = await postImages(token, postId, images);
            if (responseImage.status === 201) {
              window.alert("게시글 등록 성공");
              window.close();
            }
          } else {
            window.alert("게시글 등록 성공");
            window.close();
          }
        } else if (response.status === 404) {
          console.error("존재하지 않는 회원입니다:", response.status);
          alert("존재하지 않는 회원입니다.");
        } else {
          console.error("게시글 등록 실패:", response.status);
        }
      } else if (type === "update") {
        if (id === undefined) {
          console.error("ID is undefined");
          return;
        }
        let postId = id;
        const response = await putPost(
          { title, content, category, anonymous },
          token,
          postId,
        );
        if (response.status === 200) {
          if (images.length) {
            const responseImage = await putImages(token, postId, images);
            if (responseImage.status === 200) {
              window.alert("게시글 수정 성공");
              window.close();
            }
          } else {
            window.alert("게시글 수정 성공");
            window.close();
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 나갈 때 경고
  const handleGetOut = () => {
    const result = window.confirm(
      "해당 페이지를 나가시겠습니까? 변경사항이 저장되지 않을 수 있습니다.",
    );
    if (result) {
      navigate("/");
    } else {
      return;
    }
  };

  return (
    <PostFormContainerWrapper>
      <Bar>
        <img
          onClick={handleGetOut}
          src={inuLogoImg}
          alt="INU logo"
          style={{ width: "180px", cursor: "pointer" }}
        />
        <PostFormButtons>
          <ImageInput onImageChange={handleImageChange} />
          <AnonymousCheckbox
            checked={anonymous}
            onChange={handleAnonymousChange}
          />
          <PostButton onClick={handlePostSubmit} disabled={loading}>
            {type === "create" ? <span>업로드</span> : <span>수정 완료</span>}
          </PostButton>
        </PostFormButtons>
      </Bar>
      <Container1>
        <Container2>
          <TitleInput value={title} onChange={handleTitleChange} />
          <WriteLine />
          <ContentInput value={content} onChange={handleContentChange} />
          <WriteLine />
          <div>
            {images.map((image, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  display: "inline-block",
                  margin: "10px",
                }}
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt={`preview ${index}`}
                  style={{ maxWidth: "200px", maxHeight: "200px" }}
                />
                <button
                  onClick={() => handleImageRemove(index)}
                  style={{ position: "absolute", top: 0, right: 0 }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </Container2>
        <CategorySelect value={category} onChange={handleCategoryChange} />
      </Container1>
    </PostFormContainerWrapper>
  );
}

// Styled Components
const PostFormContainerWrapper = styled.div`
  width: 100%;
  height: 500px;
  background: linear-gradient(0deg, #ffffff 75.5%, #dbebff 96%);
`;

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 5px solid #eaeaea;
  justify-content: space-between;
  padding: 10px 20px;
  height: 50px;

  @media (max-width: 768px) {
    flex-direction: column;
    height: 140px;
  }
`;

const PostFormButtons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

const PostButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 63px;
  height: 26px;
  border-radius: 10px;
  background: linear-gradient(90deg, #6f84e2 0%, #7babe5 100%);
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  border: none;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const Container1 = styled.div`
  padding: 35px;
  display: flex;
  flex-direction: row;
  z-index: 1;
  background-color: white;
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
  }
`;

const Container2 = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const WriteLine = styled.div`
  height: 1px;
  width: 90%;
  background-color: #969696;
  margin-top: 10px;
  margin-bottom: 10px;
`;
