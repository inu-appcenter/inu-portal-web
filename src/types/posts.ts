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
