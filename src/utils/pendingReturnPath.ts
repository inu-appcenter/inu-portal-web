// 참여 링크로 들어온 사람이 로그인·가입·프로필 설정을 거친 뒤 원래 화면으로 돌아오게 하는 표식.
// 로그인은 `?redirect=`로 돌아오지만, 최초 로그인 사용자는 그 뒤에 프로필 설정으로 한 번 더
// 보내지므로(RootLayout) 경로를 따로 기억해 둔다. 탭을 닫으면 사라지도록 sessionStorage에 둔다.

const STORAGE_KEY = "__intipPendingReturnPath";

const isInternalPath = (path: string | null): path is string =>
  Boolean(path) && path!.startsWith("/") && !path!.startsWith("//");

export const setPendingReturnPath = (path: string) => {
  try {
    if (isInternalPath(path)) sessionStorage.setItem(STORAGE_KEY, path);
  } catch {
    // 저장소를 못 쓰는 환경이면 홈으로 가는 기존 동작으로 남는다.
  }
};

export const clearPendingReturnPath = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
};

/** 기억해 둔 경로를 꺼내고 지운다. 없으면 null. */
export const consumePendingReturnPath = (): string | null => {
  try {
    const path = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return isInternalPath(path) ? path : null;
  } catch {
    return null;
  }
};
