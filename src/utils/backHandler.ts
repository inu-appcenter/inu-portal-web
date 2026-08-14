type BackCallback = () => boolean | void;

class BackHandlerManager {
  private handlers: BackCallback[] = [];
  private pageHasUnsavedChanges: boolean = false;
  private pageBackHandler?: () => boolean;

  constructor() {
    if (typeof window !== "undefined") {
      window.__intipHasUnsavedChanges = false;
      window.__intipHandleNativeBackRequest = () => this.handleBack();
    }
  }

  // 핸들러 등록 (LIFO)
  pushHandler(handler: BackCallback) {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
    }
    this.updateActiveStatus();
  }

  // 핸들러 해제
  popHandler(handler: BackCallback) {
    this.handlers = this.handlers.filter((h) => h !== handler);
    this.updateActiveStatus();
  }

  // 페이지 단위의 저장이탈 방지 설정 (기존 학점 계산기 등)
  setPageUnsavedChanges(hasChanges: boolean, onPageBack?: () => boolean) {
    this.pageHasUnsavedChanges = hasChanges;
    this.pageBackHandler = onPageBack;
    this.updateActiveStatus();
  }

  private updateActiveStatus() {
    if (typeof window !== "undefined") {
      window.__intipHasUnsavedChanges =
        this.handlers.length > 0 || this.pageHasUnsavedChanges;
    }
  }

  /**
   * 등록된 핸들러로 뒤로가기를 소비했는지 반환한다.
   * 구앱은 `window.__intipHandleNativeBackRequest` 로, 신앱은 브릿지의
   * `checkBack` 경로(`nativeBackRequest.ts`)로 같은 로직을 탄다.
   */
  handleBack(): boolean {
    // 1. 등록된 오버레이 핸들러가 있으면 가장 최근 등록된 핸들러 실행
    if (this.handlers.length > 0) {
      const handler = this.handlers[this.handlers.length - 1];
      const prevented = handler();
      if (prevented !== false) {
        return true; // 백키 차단
      }
    }

    // 2. 페이지 단위 이탈 방지 핸들러 실행
    if (this.pageHasUnsavedChanges && this.pageBackHandler) {
      return this.pageBackHandler();
    }

    return false; // 백키 허용 (네이티브가 웹뷰를 닫음)
  }
}

export const backHandler = new BackHandlerManager();
