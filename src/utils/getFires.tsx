const getFires = async (id: string) => {
  const apiURL = `https://portal.inuappcenter.kr/api/fires/${id}`;
  try {
    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const imageBlob = await response.blob();
      const imageURL = URL.createObjectURL(imageBlob);
      return imageURL;
    }
    else {
      if (response.status === 404) { alert('존재하지 않는 이미지 번호입니다.'); }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

export default getFires;