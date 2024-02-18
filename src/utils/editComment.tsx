const editComment = async (token: string, replyId: number, content: string, anonymous: boolean) => {
  const apiURL = `https://portal.inuappcenter.kr/api/replies/${replyId}`;
  try {
    const response = await fetch(apiURL, {
      method: 'PUT',
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
    if (response.status == 200) {
        return 200;
    }
    else if (response.status == 403) {
      return 403;
    }
    else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    

  } catch (error) {
    console.log("에러?", error);
    throw error;
  }
};

export default editComment;