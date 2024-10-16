// global.d.ts
declare global {
  interface DocState {
    query: string;
    docType: string;
    selectedCategory: string;
    sort: string;
    page: string;
  }

  interface Post {
    id: string;
    title: string;
    category: string;
    writer: string;
    content: string;
    like: number;
    scrap: number;
    view: number;
    isLiked: boolean;
    isScraped: boolean;
    hasAuthority: boolean;
    createDate: string;
    modifiedDate: string;
    imageCount: number;
    bestReplies: Replies;
    replies: Replies[];
    url: string;
  }

  interface Replies {
    id: number;
    writer: string;
    content: string;
    like: number;
    isLiked: boolean;
    isAnonymous: boolean;
    hasAuthority: boolean;
    createDate: string;
    modifiedDate: string;
    reReplies: Replies[];
  }

  interface Folder {
    id: number;
    name: string;
  }
}

export {};
