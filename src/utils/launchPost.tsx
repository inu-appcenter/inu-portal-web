interface PostData{
    title: string,
    content: string,
    category: string,

}


const launchPost = async (data: PostData, token: string) => {
    
    try {
      const response = await fetch(`https://portal.inuappcenter.kr/api/posts`, {
        method: 'POST',
        headers: {
         'Auth': token,
         'Content-Type': 'application/json',
        },
      body: JSON.stringify(data),
      });

    console.log(response, 'response');
    if (response.status == 404) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    else {
        const token = response.text();
        console.log("게시글 등록 성공", token);
        
        return token; 

    }

} catch (error) {
    console.log("에러?", error);
    alert("게시에 실패하였습니다.")
    throw error;
  }
};


export default launchPost;