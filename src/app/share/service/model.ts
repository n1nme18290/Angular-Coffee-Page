export interface IApiResponse <T> {
    data: T;
    isSuccess: boolean;
    message: string;
}
export interface IApiResponsePagePoints<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}
export interface IApiResponsePoints {
    id: string;
    member_id: string;
    balance: number;
    updated_at: string;
}