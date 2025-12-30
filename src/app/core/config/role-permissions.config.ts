/**
 * 角色權限配置檔
 * 
 * 說明：
 * - 此配置檔定義前端 UI 層級的權限控制
 * - 角色資料來自後端 API（/Security/Role/list）
 * - 請確保此處的 role_name 與後端回傳的完全一致
 * 
 * 注意：後端若已實作角色-權限 API，建議改用後端資料，移除此配置檔
 */

export interface RolePermissionsConfig {
    [roleName: string]: string[];
}

/**
 * 角色到權限的映射表
 * 
 * 角色列表（與後端 API 一致）：
 * - SuperAdmin (9A8F63D8-665B-4CA4-839D-CC67B5045FFA) - 測試用全開
 * - Admin (699B02B6-3578-47CA-BD2F-E33CE86AF816) - 全開（高風險操作另行管控）
 * - 管理人員 (20B02577-2E0F-43BD-B6A3-7A92DABFBB6E) - 可配發點數/累積事件
 * - Log Viewer (3FF365A8-2680-4898-89FD-F5E1BE41F607) - 日誌查閱（唯讀）
 * - 學生 (ED40CF6B-5582-497C-A5BF-89F74478470A) - 自用查詢與兌換
 * - CoffeeMachine (ac19f107-7052-46ff-99f6-6493b7ff8218) - 供咖啡機連線使用
 * 
 * 權限說明（前端定義）：
 * - * : 萬用權限（SuperAdmin）
 * - view_analytics : 查看數據分析
 * - manage_backend : 管理後台
 * - view_devices : 查看設備
 * - manage_devices : 管理設備
 * - view_logs : 查看日誌
 * - manage_permissions : 管理權限
 * - manage_users : 管理用戶
 * - manage_points : 管理點數
 * - view_personal : 查看個人資訊
 * - view_own_points : 查看自己的點數
 * - machine_access : 機器訪問權限
 */
export const ROLE_PERMISSIONS: RolePermissionsConfig = {
    // 測試用全開（此範例只綁上面三個）
    'SuperAdmin': ['*'],

    // 全開（高風險操作另行管控）
    'Admin': [
        'view_analytics',
        'manage_backend',
        'view_devices',
        'manage_devices',
        'view_logs',
        'manage_permissions',
        'manage_users',
        'manage_points'
    ],

    // 可配發點數/累積事件
    '管理人員': [
        'view_analytics',
        'manage_backend',
        'view_devices',
        'manage_devices',
        'manage_points'
    ],

    // 日誌查閱（唯讀）
    'Log Viewer': [
        'view_logs',
        'view_analytics'
    ],

    // 自用查詢與兌換
    '學生': [
        'view_personal',
        'view_own_points'
    ],

    // 供咖啡機連線使用
    'CoffeeMachine': [
        'machine_access'
    ]
};

/**
 * 路由權限配置
 * 定義每個路由所需的權限
 */
export interface RoutePermissionsConfig {
    [routePath: string]: string[];
}

export const ROUTE_PERMISSIONS: RoutePermissionsConfig = {
    // 個人資訊頁面：所有登入用戶都可訪問
    'personal-info': [],

    // 點數資訊頁面：需要查看點數權限
    'point-information': ['view_own_points', 'manage_points'],

    // 設備管理頁面：需要查看或管理設備權限
    'equipment': ['view_devices', 'manage_devices'],
    'equipment-information': ['view_devices', 'manage_devices'],

    // 後台管理頁面：需要管理後台權限
    'backend-management': ['view_analytics', 'manage_backend'],

    // 歷史紀錄頁面：需要查看日誌權限
    'historical-record': ['view_logs'],

    // 權限管理頁面：需要管理權限或用戶的權限
    'permission-management': ['manage_permissions', 'manage_users'],
};

/**
 * 選單項目權限配置
 * 用於側邊欄選單的動態顯示
 */
export interface MenuItemConfig {
    path: string;
    label: string;
    icon: string;
    permissions: string[];
    roles?: string[]; // 可選：直接指定角色而不是權限
}

export const MAIN_MENU_ITEMS: MenuItemConfig[] = [
    {
        path: '/personal-info',
        label: '個人資訊',
        icon: 'user',
        permissions: [] // 所有人可見
    }
];

export const SYSTEM_MANAGEMENT_ITEMS: MenuItemConfig[] = [
    {
        path: '/backend-management',
        label: '兌換資料分析頁面',
        icon: 'bar-chart',
        permissions: ['view_analytics', 'manage_backend']
    },
    {
        path: '/equipment',
        label: '設備管理頁面',
        icon: 'laptop',
        permissions: ['view_devices', 'manage_devices']
    },
    {
        path: '/permission-management',
        label: '使用者管理',
        icon: 'team',
        permissions: ['manage_permissions', 'manage_users'],
        roles: ['Admin', 'SuperAdmin'] // 也可以直接指定角色
    },
    {
        path: '/historical-record',
        label: '歷史紀錄頁面',
        icon: 'history',
        permissions: ['view_logs']
    }
];
