const getPostsImages = async (postId: number, imageId: number) => {
  const apiURL = `https://portal.inuappcenter.kr/api/posts/images?postId=${postId}&imageId=${imageId}`;
  try {
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.status == 200) {
      const imageBlob = await response.blob();  // 이미지는 .json() 대신 .blob()
      const imageURL = URL.createObjectURL(imageBlob);
      return imageURL;
    }
    else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

  } catch (error) {
    throw error;
  }
};

export default getPostsImages;