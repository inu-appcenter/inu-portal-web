const postReComment = async (token: string, replyId: number, content: string, anonymous: boolean) => {
  const apiURL = `https://portal.inuappcenter.kr/api/replies/${replyId}/re-replies`;
  try {
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Auth': token
      },
      body: JSON.stringify({
        'content': content,
        'anonymous': anonymous
      })
    });

    console.log(response,'response');
    if (response.status == 201) {
        return 201;
    }
    else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    

  } catch (error) {
    console.log("에러?", error);
    throw error;
  }
};

export default postReComment;