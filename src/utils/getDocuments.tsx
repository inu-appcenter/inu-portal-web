const getDocuments = async (category: string) => {
  let apiURL;
  if (category === '전체'){
    apiURL = 'https://portal.inuappcenter.kr/api/posts/all';
  }
  else {
    apiURL = `https://portal.inuappcenter.kr/api/posts/all/${category}`;
  }
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
        return data['data'];  // data['msg']가 결과, data['data']가 글 목록
    }
    

  } catch (error) {
    console.log("에러?", error);
    throw error;
  }
};

export default getDocuments;