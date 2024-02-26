import React, { useEffect, useState } from "react";
import getPostsImages from '../../../utils/getPostsImages';

interface PostContentProps {
  id: number;
  writer: string;
  content: string;
  imageCount: number;
}

export default function PostContent({ id, writer, content, imageCount }: PostContentProps) {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        let fetchedImages = [];
        for (let imageId = 1; imageId <= imageCount; imageId++) {
          const imageUrl = await getPostsImages(id, imageId);
          fetchedImages.push(imageUrl);
        }
        setImages(fetchedImages);
      }
      catch (error) {
        console.log(error);
      }
    };

    fetchImages();
  }, [id, imageCount]);

  return (
    <>
      <div className='post-contents'>
        <h3>{writer}</h3>
        <div className='contents'>{content}</div>
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Image ${index + 1}`} />
        ))}
      </div>
    </>
  );
}
