interface PostData {
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
}

const launchPost = async (data: PostData, token: string) => {
  try {
    const response = await fetch('https://portal.inuappcenter.kr/api/posts', {
      method: 'POST',
      headers: {
        Auth: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();

      if (response.status === 201) {
        console.log('게시글 등록 성공:', responseData);
        alert('게시글이 성공적으로 등록되었습니다.');
      } else if (response.status === 402) {
        console.error('존재하지 않는 회원입니다:', response.status);
        alert('존재하지 않는 회원입니다.');
      }

      return responseData;
    } else {
      console.error('게시글 등록 실패:', response.status);

      // Handle other HTTP status codes if needed
      throw new Error(`HTTP 에러! 상태 코드: ${response.status}`);
    }
  } catch (error) {
    console.error('에러가 발생했습니다:', error);
    alert('게시에 실패하였습니다.'); // 에러 발생 시 알림 표시
    throw error;
  }
};

export default launchPost;
