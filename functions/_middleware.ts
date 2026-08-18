/**
 * Cloudflare Pages Functions — 친구추가 초대 링크의 OG 태그를 edge에서 주입한다.
 *
 * 이 앱은 SPA라 `index.html`에 정적 OG 태그가 하나뿐이다(제목 "INTIP" 고정). 카카오톡 등
 * 링크 미리보기 크롤러는 JS를 실행하지 않고 서버가 내려준 HTML만 보므로, 친구추가 링크를
 * 공유해도 항상 사이트 기본 미리보기만 뜬다. 이 미들웨어는 `/friend/invite/:code` 요청에
 * 한해 응답 HTML의 OG 메타를 친구추가 전용 문구/이미지로 치환해 내려준다.
 *
 * 초대 주인의 닉네임 등 개인정보는 절대 넣지 않는다 — og 태그는 검색엔진/링크 미리보기
 * 봇이 그대로 긁어가 캐싱·색인할 수 있어, 문구는 항상 고정값이어야 한다.
 *
 * 매칭 경로는 src/constants/routes.ts 의 FRIEND.INVITE_PATTERN 과 맞춰져 있다.
 */

const FRIEND_INVITE_PATH = /^\/friend\/invite\/[^/]+\/?$/;

const OG_IMAGE_PATH = "/og-image-friend-add.png";
// public/og-image-friend-add.png 실제 픽셀 크기. 크롤러가 미리보기를 즉시 올바른
// 비율로 그릴 수 있게 og:image:width/height로 같이 내려준다.
const OG_IMAGE_WIDTH = "1024";
const OG_IMAGE_HEIGHT = "541";

const TITLE = "친구 요청 수락 - INTIP";
const DESCRIPTION = "INTIP에서 친구를 맺고 공강을 비교해보세요!";

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
  if (!FRIEND_INVITE_PATH.test(url.pathname)) return context.next();

  const response = await context.next();
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const values: OgValues = {
    title: TITLE,
    description: DESCRIPTION,
    image: `${url.origin}${OG_IMAGE_PATH}`,
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
