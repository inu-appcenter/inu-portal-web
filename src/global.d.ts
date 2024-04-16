// global.d.ts
declare global {
  interface DocState {
    docType: string;
    selectedCategory: string;
    sort: string;
    page: string;
  }
}

export {};
