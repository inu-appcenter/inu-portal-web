const postFires = async (param: string, token: string) => {
  try {
    const response = await fetch('https://portal.inuappcenter.kr/api/fires', {
      method: 'POST',
      headers: {
        'Auth': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'param': param
      }),
    });
    console.log(response);
    if (response.status === 201) {
      const data = await response.json();
      return data['data'];
    }
    else {
      if (response.status === 401) { alert('로그인 후 이용이 가능합니다.'); }
      else if (response.status === 400) { alert('이미지 생성 실패'); }
      else { alert('unknown error'); }
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default postFires;