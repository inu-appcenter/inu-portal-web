export interface BookSummary {
    id: number;
    name: string;
    author: string;
    thumbnail: string;
    transactionStatus: string;
    imageCount: number;
    price: number;
    modifiedDate: string;

}

export interface Book {
    id: number;
    name: string;
    author: string;
    price: number;
    content: string;
    transactionStatus: string;
    imageCount: number;
    image: string[];
    modifiedDate: string;
}
