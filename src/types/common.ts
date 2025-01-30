export interface ApiResponse<T = any> {
    result: ((prevState: string[]) => string[]) | string[];
    data: T;
    msg: string;
}

export interface Pagination<T = any> {
    pages: number;
    total: number;
    contents: T;
}
