const getNotices = async (category: string, sort: string, page:string) => {
  try {
    let response;
    if (category === '전체') {
      const apiURL = `https://portal.inuappcenter.kr/api/notices?sort=${sort}&page=${page}`;
      response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    else {
      const apiURL = `https://portal.inuappcenter.kr/api/notices?category=${category}&sort=${sort}&page=${page}`;
      response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    console.log(response,'response');
    if (response.status == 200) {
      const data = await response.json();
      console.log(data);
      return data['data'];  // data['msg']가 결과, data['data']가 글 목록
    }
    else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    

  } catch (error) {
    console.log("에러?", error);
    throw error;
  }
};

export default getNotices;