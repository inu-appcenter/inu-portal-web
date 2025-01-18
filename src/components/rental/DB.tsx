export interface Goods {
    id: number;
    category: string;
    name: string;
    availableQuantity: number;
    deposit: number;
}

export const broadcasting: Goods[] = [
    {id: 1, category: "방송장비", name: "무선마이크", availableQuantity: 1, deposit: 5000},
    {id: 2, category: "방송장비", name: "유선마이크", availableQuantity: 1, deposit: 5000},
    {id: 3, category: "방송장비", name: "리드선", availableQuantity: 4, deposit: 5000},
    {id: 4, category: "방송장비", name: "블루투스 스피커", availableQuantity: 1, deposit: 10000},
];

export const tents: Goods[] = [
    {id: 5, category: "천막", name: "천막", availableQuantity: 7, deposit: 10000},
];

export const athleticGoods: Goods[] = [
    {id: 6, category: "체육물품", name: "축구공", availableQuantity: 3, deposit: 5000},
    {id: 7, category: "체육물품", name: "조끼 (빨강)", availableQuantity: 13, deposit: 5000},
    {id: 8, category: "체육물품", name: "조끼 (형광)", availableQuantity: 20, deposit: 5000},
];

export const elses: Goods[] = [
    {id: 9, category: "기타", name: "테이블 (사각형)", availableQuantity: 14, deposit: 10000},
    {id: 10, category: "기타", name: "테이블 (원형)", availableQuantity: 4, deposit: 10000},
    {id: 11, category: "기타", name: "의자", availableQuantity: 63, deposit: 10000},
    {id: 12, category: "기타", name: "듀라테이블(접이식)", availableQuantity: 3, deposit: 15000},
    {id: 13, category: "기타", name: "듀라테이블(일체형)", availableQuantity: 3, deposit: 15000},
];
