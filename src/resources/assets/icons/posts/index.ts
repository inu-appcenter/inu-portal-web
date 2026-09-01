import checkedCheckbox from "./checked-checkbox.svg";
import eye from "./eye.svg";
import heartBlue from "./heart-blue.svg";
import heartEmpty from "./heart-empty.svg";
import heartFilled from "./heart-filled.svg";
import pencilWhite from "./pencil-white.svg";
import uncheckedCheckbox from "./unchecked-checkbox.svg";

/**
 * 게시글·댓글 목록에서 쓰는 소형 아이콘.
 *
 * 대응하는 Fontello 글리프가 없어 SVG로 남았다. 상태(선택/좋아요)를 색이 아니라
 * **채움 여부**로 표현하는 세트라, 외곽선 글리프 하나로는 두 상태를 구분할 수 없다
 * (`heart-off`/`bookmark-off`는 "해제"가 아니라 빗금 친 금지 표시라 의미가 다르다).
 *
 * 색을 그대로 둔 이유: 상태별로 색이 다르다(heart-empty #FF0000 /
 * heart-filled #FFADAD / heart-blue #4071B9). currentColor로 합치면 호출부가
 * 두 색을 모두 지정해야 해서 지금은 원본 색을 유지한다.
 */
export {
  checkedCheckbox,
  eye,
  heartBlue,
  heartEmpty,
  heartFilled,
  pencilWhite,
  uncheckedCheckbox,
};
