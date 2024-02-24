const postImage = async (token: string, postId: number, images: File[]) => {
    const apiURL = `https://portal.inuappcenter.kr/api/posts/images/${postId}`;
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append('images', image, `image${index}`);
      });
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Auth': token,
        },
        body: formData,
      });
  
      console.log(response, 'response');
  
      if (response.status === 201) {
        console.log('이미지 등록 성공');
        return 201;
      } else if (response.status === 404) {
        console.error('존재하지 않는 게시물입니다.');
        throw new Error('Not Found');
      } else {
        console.error('이미지 등록 실패:', response.status);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('에러:', error);
      throw error;
    }
  };
  
  export default postImage;
  