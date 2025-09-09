export interface IApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string;
}
export interface IApiResponseNormal {
    data: boolean;
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

export interface IApiResponseAdminLogin {
    admin_id: string
    name: string
    email: string
    premission: number
    status: string
    token: string
}

export interface IApiResponseDevice {
    id: string
    name: string
    location: string
    status: string
    bean_level: number
    water_level: number
    created_at: string
    updated_at: string
}

export interface IApiResponseAdmin {
    id: string
    name: string
    email: string
    premission: number
    status: string
    created_at: string
    updated_at: string
}

export interface IApiResponseMember {
    id: string
    student_id: string
    card_id: string
    title: string
    identityLev: number
    name: string
    email: string
    status: string
    created_at: string
    updated_at: string
}
export interface IApiResponseGetPageProduct {
    id: string
    name: string
    description: string
    category: string
    points_required: number
    status: number
    created_at: string
    updated_at: string
}
export interface IApiResponseGetProduct {
    id: string
    member_id: string
    product_id: string
    product_name: string
    quantity: number
    updated_at: string
}
export interface IApiResponseProductList {
    data: IApiResponseGetProduct[];
    isSuccess: boolean;
    message: string;
}