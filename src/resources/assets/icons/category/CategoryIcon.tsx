import {
  CATEGORY_ICON_SLUGS,
  FALLBACK_CATEGORY_ICON_SLUG,
  RASTER_CATEGORY_ICONS,
  VECTOR_CATEGORY_ICONS,
  type CategoryName,
} from "@/resources/assets/icons/category";

interface CategoryIconProps {
  /**
   * 서버/URL에서 오는 카테고리명(한글). 알려지지 않은 값이어도 런타임에
   * 폴백 아이콘("전체")으로 표시되므로 타입은 string으로 넓게 받는다.
   */
  name: string;
  /**
   * 선택된 상태 여부. 벡터 아이콘은 `currentColor`를 상속하므로 색은 항상
   * 호출부의 CSS(color)가 결정하며 이 prop과 무관하다. "전체" 카테고리만
   * gray/white 두 개의 래스터 파일을 갖고 있어, 그 경우에만 이 prop으로
   * 파일을 선택한다.
   */
  active?: boolean;
  size?: number;
  className?: string;
}

export default function CategoryIcon({
  name,
  active = false,
  size = 25,
  className,
}: CategoryIconProps) {
  const slug =
    CATEGORY_ICON_SLUGS[name as CategoryName] ?? FALLBACK_CATEGORY_ICON_SLUG;

  // 아이콘 옆에 항상 카테고리명 텍스트가 함께 표시되므로(Categories, PostsTop),
  // 아이콘 자체는 장식 요소로 취급해 스크린리더에서 숨긴다.
  const raster = RASTER_CATEGORY_ICONS[slug as keyof typeof RASTER_CATEGORY_ICONS];
  if (raster) {
    return (
      <img
        src={active ? raster.white : raster.gray}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={className}
      />
    );
  }

  const Icon = VECTOR_CATEGORY_ICONS[slug];
  if (!Icon) {
    // 이론상 도달하지 않지만, 매핑 누락 시에도 깨지지 않도록 폴백 처리.
    const fallback = RASTER_CATEGORY_ICONS[FALLBACK_CATEGORY_ICON_SLUG];
    return (
      <img
        src={active ? fallback.white : fallback.gray}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return (
    <Icon
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  );
}
