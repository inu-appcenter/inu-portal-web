const getPost = async (postId: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/posts/${postId}`;
  try {
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(response,'response');
    if (response.status == 400) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    else {
        const data = await response.json();
        console.log(data);
        return data;
    }
    

  } catch (error) {
    console.log("에러?", error);
    throw error;
  }
};

export default getPost;