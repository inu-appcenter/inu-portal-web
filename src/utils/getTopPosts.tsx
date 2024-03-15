const getTopPosts =  async () => {
    const apiURL = `https://portal.inuappcenter.kr/api/posts/top`;
    try {
      const response = await fetch(apiURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response, 'response');
    if (response.status == 200) {
      const data = await response.json();
      console.log(data.data);
      return data.data;
    }
  } catch (error) {
    console.log('에러?', error);
    throw error;
  }
};

export  default getTopPosts;