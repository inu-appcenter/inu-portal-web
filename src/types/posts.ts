// 카테고리별 최신 게시글 가져오기
export interface CategoryPosts {
  category: string;
  posts: Post[];
}

export interface Post {
  id: number;
  title: string;
  category: string;
  writer: string;
  content: string;
  like: number;
  scrap: number;
  replyCount: number;
  imageCount: number;
  createDate: string;
  modifiedDate: string;
}

export interface Reply {
  id: number;
  writer: string;
  fireId: number;
  content: string;
  like: number;
  isLiked: boolean;
  isAnonymous: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  reReplies?: Reply[];
}

export interface PostDetail {
  id: number;
  title: string;
  category: string;
  writer: string;
  fireId: number;
  content: string;
  like: number;
  scrap: number;
  view: number;
  replyCount: number;
  isLiked: boolean;
  isScraped: boolean;
  hasAuthority: boolean;
  createDate: string;
  modifiedDate: string;
  imageCount: number;
  bestReplies: Reply[];
  replies: Reply[];
}
