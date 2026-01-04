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
export interface IApiResponseNormal2 {
    data: string;
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
    member_name: string;
    balance: number;
    updated_at: string;
}
export interface IApiResponseMemberInfo {
    id: string;
    student_id: string;
    card_id: string;
    title: string;
    identityLev: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface IApiResponsePointsHistory {
    id: string;
    member_id: string;
    member_name: string;
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
    permission: number
    status: string
    jwt: string
}

export interface IApiResponseMemberSSOLogin {
    admin_id: string
    member_id: string
    name: string
    email: string
    status: string
    sso_token: string
    isNew: boolean
    jwt: string
}

export interface IApiResponseDevice {
    id: string
    name: string
    location: string
    status: string
    machine_id: string
    machine_ip: string
    // bean_level: number
    cleaned_at: string
    water_level: string
    created_at: string
    updated_at: string
}

export interface IApiResponseAdmin {
    id: string
    name: string
    email: string
    permission: number
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
export interface IApiResponseDeviceState {
    total:number
    online: number
    offline: number
    maintenance: number
}

export interface IApiResponseGetPageDeviceLog {
    id: string
    device_id: string
    device_name: string
    member_id: string
    operation_type: string
    operation: string
    amount: number
    created_at: string
}
export interface IApiResponseSecurityRole {
    role_id: string
    role_name: string
    description: string
    is_owned: boolean
}

export interface IApiResponseAdminRole {
    id: string
    name: string
    description: string
    status: string
}

export interface IApiResponseRoleListItem {
    id: string
    name: string
    description: string
    status: string
    created_at?: string
    updated_at?: string
}
// export interface IApiResponseCreateSecurityRole {
//     id: string
//     name: string
//     description: string
//     status: string
//     created_at: string
//     updated_at: string
// }