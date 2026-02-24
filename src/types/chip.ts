export interface ChipItem {
  iconSrc: string;
  title: string;
  isExternalLink?: string;
  isAIButton?: boolean;
  onClick?: () => void;
}
