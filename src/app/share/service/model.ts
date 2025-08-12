export interface IApiResponse <T> {
    data: T;
    isSuccess: boolean;
    message: string;
}
export interface IApiResponsePages<T> {
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

export interface IApiResponsePointsHistory {
    id: string;
    member_id: string;
    type: string;
    amount: number;
    before_balance: number
    after_balance: number
    target_member_id: any
    status: number
    description: string
    created_at: string
}
