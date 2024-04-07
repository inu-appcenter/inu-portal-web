interface UserInfo {
  nickname: string;
  fireId: string;
  // 다른 필요한 속성들도 여기에 추가할 수 있습니다.
}

const getUser = async (token: string): Promise<UserInfo> => {
  try {
    const response = await fetch('https://portal.inuappcenter.kr/api/members', {
      method: 'GET',
      headers: {
        Auth: token,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const userData = await response.json();

      return userData.data;
    } else if (response.status === 404) {
      console.error('존재하지 않는 회원입니다.');
      throw new Error('존재하지 않는 회원입니다.');
    } else {
      console.error('회원 정보 가져오기 실패:', response.status);
      throw new Error(`HTTP 에러! 상태 코드: ${response.status}`);
    }
  } catch (error) {
    console.error('에러가 발생했습니다:', error);
    throw error;
  }
};

export default getUser;
