const handleLike = async (token: string, postId: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/posts/${postId}/like`;
  try {
    const response = await fetch(apiURL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Auth': token
      },
    });

    console.log(response,'response');
    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else if (response.status === 400) {
      window.alert('본인의 게시글에는 좋아요를 누를 수 없습니다.');
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    

  } catch (error) {
    console.log("에러?", error);
    throw error;
  }
};

export default handleLike;