import styled from "styled-components";

import type { FontelloIconName } from "./fontelloIcons";

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: FontelloIconName;
  /** 글리프 크기(px). Fontello 글리프는 font-size로 크기가 정해진다. */
  size?: number;
  /** 기본값은 currentColor라 부모의 color를 그대로 상속한다. */
  color?: string;
  className?: string;
  /**
   * 아이콘이 옆의 텍스트와 같은 뜻이면(장식) 생략한다.
   * 아이콘만으로 의미를 전달할 때만 라벨을 넘겨라.
   */
  label?: string;
}

/**
 * Fontello 글리프 아이콘.
 *
 * lucide-react를 대체한다. 호출 형태를 최대한 비슷하게 맞춰
 * `<Bell size={20} />` -> `<Icon name="bell" size={20} />`로 바꿀 수 있게 했다.
 *
 * 글리프가 없는 아이콘은 lucide나 SVG를 그대로 둔다. 비슷하기만 한 글리프로
 * 억지로 대체하면 화면이 조용히 달라진다.
 *
 * `onClick` 등 나머지 HTML 속성은 그대로 전달한다 — 아이콘 자체가 클릭 대상인
 * 곳이 많은데, 그때마다 래퍼를 만들면 마크업만 늘어난다. 다만 아이콘이 유일한
 * 조작 수단이면 `<button>`으로 감싸는 편이 접근성상 낫다.
 */
export default function Icon({
  name,
  size = 16,
  color,
  className,
  label,
  ...rest
}: IconProps) {
  return (
    <Glyph
      {...rest}
      className={`icon-${name}${className ? ` ${className}` : ""}`}
      $size={size}
      $color={color}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

const Glyph = styled.i<{ $size: number; $color?: string }>`
  font-size: ${({ $size }) => $size}px;
  line-height: 1;
  color: ${({ $color }) => $color ?? "currentColor"};

  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  /* fontello.css의 기본 규칙이 글리프마다 오른쪽 여백을 넣는다.
     아이콘 간격은 호출부 레이아웃이 정해야 하므로 여기서 제거한다. */
  &::before {
    margin: 0;
    width: auto;
  }
`;
