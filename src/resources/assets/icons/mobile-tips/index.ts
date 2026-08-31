import GridViewIcon from "./grid-view-icon.svg?react";
import ListViewIcon from "./list-view-icon.svg?react";
import CommentIcon from "./comment-icon.svg?react";

/**
 * 모바일 TIPS 게시판 UI 아이콘.
 *
 * grid-view/list-view는 원래 파란색(#9CAFE2, 활성)·회색(#D6D1D5, 비활성) 두 장씩
 * 총 4장이었다. path가 완전히 동일해 currentColor 한 장씩으로 합쳤다
 * (ViewModeButtons.tsx에서 활성 여부에 따라 color CSS로 전환).
 *
 * CommentIcon(원래 #757575)은 어디서도 참조되지 않는다(이관 전 원본도 미참조 —
 * 감사 보고서 [3a]). 별도 판단 없이 삭제하지 않고 세트의 일부로 이관만 한다.
 */
export { GridViewIcon, ListViewIcon, CommentIcon };
