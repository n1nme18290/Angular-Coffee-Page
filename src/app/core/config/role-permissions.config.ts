// 基於角色的路由訪問配置（完整版）
export interface RoleRouteAccess {
    [roleName: string]: string[];  // 角色名稱 -> 可訪問路由列表
}

export const ROLE_ROUTE_ACCESS: RoleRouteAccess = {
    'SuperAdmin': ['*'],  // 可訪問所有頁面
    'Admin': ['*'],  // 可訪問所有頁面
    '管理人員': ['permission-management', 'historical-record'],
    '維護人員': ['equipment', 'equipment-information', 'backend-management'],
    'Log Viewer': ['historical-record'],
};

// 所有登入用戶都可訪問的路由（無需角色限制）
export const PUBLIC_ROUTES = ['personal-info', 'point-information'];

export interface MenuItemConfig {
    path: string;
    label: string;
    icon: string;
    roles: string[];  // 只保留角色檢查
}

export const MAIN_MENU_ITEMS: MenuItemConfig[] = [
    {
        path: '/personal-info',
        label: '個人資訊',
        icon: 'user',
        roles: []  // 所有人可見
    }
];

export const SYSTEM_MANAGEMENT_ITEMS: MenuItemConfig[] = [
    {
        path: '/backend-management',
        label: '兌換資料分析頁面',
        icon: 'bar-chart',
        roles: ['SuperAdmin', 'Admin', '維護人員']
    },
    {
        path: '/equipment',
        label: '設備管理頁面',
        icon: 'laptop',
        roles: ['SuperAdmin', 'Admin', '維護人員']
    },
    {
        path: '/permission-management',
        label: '使用者管理',
        icon: 'team',
        roles: ['SuperAdmin', 'Admin', '管理人員']
    },
    {
        path: '/historical-record',
        label: '歷史紀錄頁面',
        icon: 'history',
        roles: ['SuperAdmin', 'Admin', '管理人員', 'Log Viewer']
    }
];