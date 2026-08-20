/**
 * Cloudflare Pages Functions — 공유 링크의 OG 태그를 edge에서 주입한다.
 *
 * 이 앱은 SPA라 `index.html`에 정적 OG 태그가 하나뿐이다(제목 "INTIP" 고정). 카카오톡 등
 * 링크 미리보기 크롤러는 JS를 실행하지 않고 서버가 내려준 HTML만 보므로, 어떤 링크를
 * 공유해도 항상 사이트 기본 미리보기만 뜬다. 이 미들웨어는 아래 OG_ROUTES에 등록된
 * 경로에 한해 응답 HTML의 OG 메타를 해당 상황 전용 문구/이미지로 치환해 내려준다.
 *
 * 게시글 제목·초대 주인 닉네임 같은 개별 콘텐츠/개인정보는 절대 넣지 않는다 — og 태그는
 * 검색엔진/링크 미리보기 봇이 그대로 긁어가 캐싱·색인할 수 있어, 문구는 항상 고정값이어야
 * 한다. 그래서 경로별로 "무슨 종류의 링크인지"만 알려주는 카드 한 장씩을 쓴다.
 *
 * 매칭 경로는 src/constants/routes.ts 의 ROUTES 와 맞춰져 있다.
 *
 * 이미지는 `public/og/` 아래에 둔다. `public/app-links/`는 `_headers`에서
 * `Content-Type: application/json`이 걸려 있어(딥링크 증명 파일용) 이미지를 두면 안 된다.
 */

interface OgRoute {
  /** 요청 경로 매칭. 쿼리스트링을 보는 경우 test에 URL을 함께 넘긴다. */
  match: (url: URL) => boolean;
  title: string;
  description: string;
  /** public/ 기준 절대경로. 모두 1200x630 PNG. */
  image: string;
}

// 카드 이미지는 전부 1200x630. 크롤러가 미리보기를 즉시 올바른 비율로 그릴 수 있게
// og:image:width/height로 같이 내려준다.
const OG_IMAGE_WIDTH = "1200";
const OG_IMAGE_HEIGHT = "630";

const OG_ROUTES: OgRoute[] = [
  // 친구 초대 링크 — ROUTES.FRIEND.INVITE_PATTERN
  {
    match: (url) => /^\/friend\/invite\/[^/]+\/?$/.test(url.pathname),
    title: "친구 요청 수락 - INTIP",
    description: "INTIP에서 친구를 맺고 공강을 비교해보세요!",
    image: "/og/friend-request.png",
  },
  // 채팅방 — ROUTES.CHAT (`/chat/:roomId`). `/chat/list`, `/chat/create/...`는 방이 아니다.
  {
    match: (url) =>
      /^\/chat\/[^/]+\/?$/.test(url.pathname) && !/^\/chat\/list\/?$/.test(url.pathname),
    title: "채팅방 초대 - INTIP",
    description: "INTIP 채팅방에 초대되었어요. 들어와서 함께 이야기해요!",
    image: "/og/chat-invite.png",
  },
  // 게시글 상세 — ROUTES.DETAIL.POST(`/postdetail?id=`), ROUTES.BOARD.TIPS_DETAIL(`/home/tips/:id`),
  // ROUTES.DETAIL.PETITION(`/petitiondetail`)
  {
    match: (url) =>
      /^\/postdetail\/?$/.test(url.pathname) ||
      /^\/petitiondetail\/?$/.test(url.pathname) ||
      /^\/home\/tips\/\d+\/?$/.test(url.pathname),
    title: "게시글 - INTIP",
    description: "INTIP 커뮤니티에서 공유된 게시글이에요.",
    image: "/og/post-share.png",
  },
  // 공지사항 — ROUTES.BOARD.NOTICE, DEPT_NOTICE, ROUTES.DETAIL.COUNCIL_NOTICE
  {
    match: (url) =>
      /^\/home\/notice\/?$/.test(url.pathname) ||
      /^\/home\/deptnotice\/?$/.test(url.pathname) ||
      /^\/councilnoticedetail\/?$/.test(url.pathname),
    title: "공지사항 - INTIP",
    description: "인천대학교 공지사항을 INTIP에서 확인해보세요.",
    image: "/og/notice-share.png",
  },
];

interface OgValues {
  title: string;
  description: string;
  image: string;
  url: string;
}

class OgMetaHandler {
  constructor(private readonly values: OgValues) {}

  element(element: Element) {
    const property = element.getAttribute("property");

    if (property === "og:title") {
      element.setAttribute("content", this.values.title);
    } else if (property === "og:description") {
      element.setAttribute("content", this.values.description);
    } else if (property === "og:url") {
      element.setAttribute("content", this.values.url);
    } else if (property === "og:image") {
      element.setAttribute("content", this.values.image);
      element.after(
        `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}">` +
          `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}">` +
          `<meta property="og:image:type" content="image/png">`,
        { html: true },
      );
    }
  }
}

class DescriptionMetaHandler {
  constructor(private readonly description: string) {}

  element(element: Element) {
    element.setAttribute("content", this.description);
  }
}

class TitleTagHandler {
  constructor(private readonly title: string) {}

  element(element: Element) {
    element.setInnerContent(this.title);
  }
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const route = OG_ROUTES.find((candidate) => candidate.match(url));
  if (!route) return context.next();

  const response = await context.next();
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const values: OgValues = {
    title: route.title,
    description: route.description,
    image: `${url.origin}${route.image}`,
    url: url.toString(),
  };

  return new HTMLRewriter()
    .on('meta[property="og:title"]', new OgMetaHandler(values))
    .on('meta[property="og:image"]', new OgMetaHandler(values))
    .on('meta[property="og:url"]', new OgMetaHandler(values))
    .on('meta[property="og:description"]', new OgMetaHandler(values))
    .on('meta[name="description"]', new DescriptionMetaHandler(values.description))
    .on("title", new TitleTagHandler(values.title))
    .transform(response);
};
