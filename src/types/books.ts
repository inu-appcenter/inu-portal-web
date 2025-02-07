export interface BookSummary {
  id: number;
  name: string;
  author: string;
  thumbnail: string;
  transactionStatus: string;
  imageCount: number;
  price: number;
<<<<<<< Updated upstream
  modifiedDate: string;
=======
>>>>>>> Stashed changes
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
