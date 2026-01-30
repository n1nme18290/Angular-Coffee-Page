export interface RolePermissionsConfig {
    [roleName: string]: string[];
}

export const ROLE_PERMISSIONS: RolePermissionsConfig = {
    'SuperAdmin': ['*'],
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
    '管理人員': [
        'view_analytics',
        'manage_backend',
        'view_devices',
        'manage_devices',
        'manage_points'
    ],
    '維護人員': [
        'view_devices',
    ],
    'Log Viewer': [
        'view_logs',
        'view_analytics'
    ],
    '學生': [
        'view_personal',
        'view_own_points'
    ],
    'CoffeeMachine': [
        'machine_access'
    ]
};

export interface RoutePermissionsConfig {
    [routePath: string]: string[];
}

export const ROUTE_PERMISSIONS: RoutePermissionsConfig = {
    'personal-info': ['view_personal'],
    'point-information': ['view_own_points', 'manage_points'],
    'equipment': ['view_devices', 'manage_devices'],
    'equipment-information': ['view_devices', 'manage_devices'],
    'backend-management': ['view_analytics', 'manage_backend'],
    'historical-record': ['view_logs'],
    'permission-management': ['manage_permissions', 'manage_users'],
};

export interface MenuItemConfig {
    path: string;
    label: string;
    icon: string;
    permissions: string[];
    roles?: string[];
}

export const MAIN_MENU_ITEMS: MenuItemConfig[] = [
    {
        path: '/personal-info',
        label: '個人資訊',
        icon: 'user',
        permissions: []  // 所有人可見
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
        roles: ['Admin', 'SuperAdmin']
    },
    {
        path: '/historical-record',
        label: '歷史紀錄頁面',
        icon: 'history',
        permissions: ['view_logs']
    }
];