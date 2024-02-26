
const CreateFolder= async (token:string,foldername:string) => {
  try {
    const response = await fetch('https://portal.inuappcenter.kr/api/folders', {
      method: 'POST',
      headers: {
        'Auth':token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(foldername),
    });

    if (response.ok) {
      const responseData = await response.json();

      if (response.status === 201) {
        console.log('폴더 생성 성공:', responseData);
      } else if (response.status === 404) {
        console.error('폴더 생성 실패:', response.status);
        alert('스크랩 폴더 생성 실패.');
      }

      return responseData;
    } else {
      console.error('폴더 생성 실패:', response.status);

      // Handle other HTTP status codes if needed
      // throw new Error(`HTTP 에러! 상태 코드: ${response.status}`);
    }
  } catch (error) {
    console.error('에러가 발생했습니다:', error);
    throw error;
  }
};

export default CreateFolder;
