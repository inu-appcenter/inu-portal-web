import { useEffect, useState } from "react";
import { getImages } from "old/utils/API/Posts";
import styled from "styled-components";

interface PostContentProps {
  id: string;
  content: string;
  imageCount: number;
}

const ImageModal = ({ src, onClose }: { src: string; onClose: () => void }) => {
  return (
    <ImageModalWrapper>
      <ModalButtonWrapper>
        <ModalButtonRed onClick={onClose}></ModalButtonRed>
        <ModalButtonGreen
          onClick={() => window.open(src, "_blank")}
        ></ModalButtonGreen>
      </ModalButtonWrapper>
      <ModalImage src={src} alt="Modal" onClick={onClose} />
    </ImageModalWrapper>
  );
};

export default function PostContent({
  id,
  content,
  imageCount,
}: PostContentProps) {
  const [images, setImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        let fetchedImages = [];
        for (let imageId = 1; imageId <= imageCount; imageId++) {
          const response = await getImages(id, imageId);
          if (response.status === 200) {
            const imageUrl = URL.createObjectURL(response.body);
            fetchedImages.push(imageUrl);
          }
        }
        setImages(fetchedImages);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [id, imageCount]);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setShowModal(true);
  };

  return (
    <PostContents>
      <ContentsImageContainer>
        {images.map((image, index) => (
          <ContentsImage
            key={index}
            src={image}
            alt={`Image ${index + 1}`}
            onClick={() => handleImageClick(image)}
          />
        ))}
      </ContentsImageContainer>
      <ContentsText>{content}</ContentsText>
      {showModal && (
        <ImageModal src={selectedImage} onClose={() => setShowModal(false)} />
      )}
    </PostContents>
  );
}

// Styled Components
const PostContents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentsImageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
`;

const ContentsImage = styled.img`
  height: 200px;
  width: auto;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 5px;
  cursor: pointer;
`;

const ContentsText = styled.div`
  white-space: pre-wrap;
  width: 90%;
  margin: 10px;
  padding: 10px;
  margin-bottom: 50px;

  @media screen and (max-width: 600px) {
    min-width: 350px;
    width: 100%;
    margin: 0;
    padding: 0;
    margin-bottom: 50px;
  }
`;

const ImageModalWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  height: auto;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalButtonWrapper = styled.div`
  position: absolute;
  background: linear-gradient(
    90deg,
    rgba(194, 205, 255, 1) 0%,
    rgba(197, 223, 255, 1) 100%
  );
  border-radius: 16px 16px 0px 0px;
  top: -40px;
  left: 0px;
  height: 40px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ModalButtonRed = styled.div`
  width: 20px;
  height: 20px;
  margin: 4px;
  margin-left: 12px;
  border-radius: 50%;
  background-color: rgba(234, 109, 91);
`;

const ModalButtonGreen = styled.div`
  width: 20px;
  height: 20px;
  margin: 4px;
  border-radius: 50%;
  background-color: rgba(103, 196, 78);
`;

const ModalImage = styled.img`
  min-width: 300px;
  max-width: 75vw;
  max-height: 75vh;
  object-fit: contain;
  cursor: pointer;
`;
