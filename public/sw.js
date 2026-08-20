// INTIP 서비스워커 묘비(tombstone) — 등록을 없애기 위해서만 존재하는 워커.
//
// 이 앱은 예전에 PWA였고, PWA를 걷어낼 때(a11f5362) 이미 설치된 서비스워커까지는
// 정리하지 못했다. 남은 워커/캐시 탓에 앱 웹뷰가 배포 후에도 옛 자원을 물고 있어
// 화면이 갱신되지 않았고, 1단계 핫픽스(70238fe4)로 캐시를 비우는 임시 워커를 배포했다.
// 이 파일은 2단계 — 그 임시 워커까지 포함해 서비스워커를 완전히 없앤다.
//
// 새 번들을 받은 클라이언트는 페이지 쪽(`src/utils/pwaCleanup.ts`)에서 직접 등록을
// 해제한다. 이 파일은 아직 옛 번들을 물고 있어 `/sw.js`를 계속 등록하는 클라이언트용
// 회수 경로다. 파일을 지워버리면 안 된다 — Cloudflare Pages는 없는 경로에 SPA 폴백으로
// index.html(text/html)을 내리고, 그러면 워커 업데이트 검사가 MIME 오류로 실패해
// 옛 워커가 영구히 남는다. Mixpanel `[PWA] 잔재 정리 완료` 이벤트가 사실상 0이 된 뒤에
// 이 파일과 pwaCleanup.ts를 함께 지운다.
//
// fetch 핸들러는 일부러 없다. 이 워커는 어떤 요청도 가로채지 않는다.

self.addEventListener("install", () => {
  // 대기하지 않고 곧장 활성화돼야 아래 정리가 이번 방문에 실행된다.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      // 스스로 등록 해제. 이 페이지는 언로드될 때까지 제어를 받지만, 다음 방문부터는
      // 어떤 워커도 붙지 않는다(옛 번들이면 다시 이 묘비를 등록했다가 또 해제할 뿐).
      await self.registration.unregister();
    })(),
  );
});

// 옛 번들이 보내는 SKIP_WAITING 메시지 호환. 없으면 대기 상태로 멈춰 있을 수 있다.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
