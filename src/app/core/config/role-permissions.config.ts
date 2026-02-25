// 基於角色的路由訪問配置
export interface RoleRouteAccess {
    [roleName: string]: string[];  // 角色名稱 -> 可訪問路由列表
}

/**
 * 角色路由訪問權限配置
 * 
 * 頁面編號對應：
 * 1. /log-in - 登入頁面
 * 2. /sso-entry - SSO 入口頁
 * 3. /personal-info - 個人資訊頁
 * 4. /permission-management - 權限管理頁
 * 5. /equipment - 設備管理頁
 * 6. /historical-record - 歷史紀錄頁
 * 7. /backend-management - 後台管理頁
 * 
 * 角色權限：
 * - SuperAdmin: 全部
 * - Admin: 5、6、7、8
 * - 維護人員: 6、7、8
 * - 僅可檢視: 7、8
 * - 一般: 1、2、3
 */
export const ROLE_ROUTE_ACCESS: RoleRouteAccess = {
    'SuperAdmin': ['*'],  // 可訪問所有頁面
    'Admin': [
        'permission-management',    // 4
        'equipment',                // 5
        'historical-record',        // 6
        'backend-management'        // 7
    ],
    '維護人員': [
        'equipment',                // 5
        'historical-record',        // 6 (僅 tab 2，前端組件內部控制)
        'backend-management'        // 7
    ],
    '僅可檢視': [
        'historical-record',        // 6
        'backend-management'        // 7
    ],
    '一般': [
        'personal-info'             // 3 (1 和 2 是公開路由)
    ]
};

// 所有登入用戶都可訪問的路由（無需角色限制）
export const PUBLIC_ROUTES = ['personal-info'];

/**
 * 操作權限配置
 * 定義哪些角色可以進行新增、編輯、刪除等操作
 */
export const OPERATION_PERMISSIONS = {
    // 可以進行編輯、刪除、新增等操作的角色
    canEdit: ['SuperAdmin', 'Admin'],
    // 可以標記設備已清潔的角色（包含維護人員）
    canMarkCleaned: ['SuperAdmin', 'Admin', '維護人員'],
    // 只能查看，不能操作的角色
    readOnly: ['僅可檢視']
};

export interface MenuItemConfig {
    path: string;
    label: string;
    icon: string;
    roles: string[];  // 允許訪問的角色
}

export const MAIN_MENU_ITEMS: MenuItemConfig[] = [
    {
        path: '/personal-info',
        label: '個人資訊',
        icon: 'user',
        roles: []  // 所有登入用戶可見
    }
];

export const SYSTEM_MANAGEMENT_ITEMS: MenuItemConfig[] = [
    {
        path: '/backend-management',
        label: '兌換資料分析',
        icon: 'bar-chart',
        roles: ['SuperAdmin', 'Admin', '維護人員', '僅可檢視']
    },
    {
        path: '/equipment',
        label: '設備管理',
        icon: 'laptop',
        roles: ['SuperAdmin', 'Admin', '維護人員']
    },
    {
        path: '/permission-management',
        label: '權限管理',
        icon: 'team',
        roles: ['SuperAdmin', 'Admin']
    },
    {
        path: '/historical-record',
        label: '歷史紀錄',
        icon: 'history',
        roles: ['SuperAdmin', 'Admin', '維護人員', '僅可檢視']
    }
];