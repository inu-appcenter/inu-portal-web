// getPost.tsx

const getPost = async (token: string, postId: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/posts/${postId}`;  // 확인 필요
  try {
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'Auth': token,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

  } catch (error) {
    console.log("에러?", error);
    throw error;
  }
};

export default getPost;
