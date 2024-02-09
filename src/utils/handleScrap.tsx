const handleScrap = async (token: string, postId: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/posts/scrap/${postId}`;
  try {
    const response = await fetch(apiURL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Auth': token
      },
    });

    console.log(response,'response');
    if (response.status == 400) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    else {
        const data = await response.json();
        return data;
    }
    

  } catch (error) {
    console.log("에러?", error);
    throw error;
  }
};

export default handleScrap;