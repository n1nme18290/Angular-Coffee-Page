import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, finalize, forkJoin, map, catchError } from 'rxjs';
import { SecurityService } from './service';
import { TokenService } from './token.service';
import { IApiResponseSecurityRole } from './model';
import { ROLE_ROUTE_ACCESS } from '../../core/config/role-permissions.config';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private permissionsSubject = new BehaviorSubject<string[]>([]);
    private rolesSubject = new BehaviorSubject<string[]>([]);
    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    private lastLoadedAdminId: string | null = null; // 記錄上次載入的 admin id
    
    // 角色類型快取（動態分類）
    private roleTypesCache: {
        adminRoles: Set<string>;
        maintenanceRoles: Set<string>;
        logViewerRoles: Set<string>;
        studentRoles: Set<string>;
    } = {
        adminRoles: new Set(),
        maintenanceRoles: new Set(),
        logViewerRoles: new Set(),
        studentRoles: new Set()
    };
    
    // 角色路由訪問權限快取
    private roleRouteAccessCache: Map<string, string[]> = new Map();

    public permissions$ = this.permissionsSubject.asObservable();
    public roles$ = this.rolesSubject.asObservable();
    public isLoading$ = this.isLoadingSubject.asObservable();

    constructor(
        private securityService: SecurityService,
        private tokenService: TokenService
    ) {
        // 初始化角色路由訪問快取（從配置載入）
        this.initializeRoleRouteAccess();
    }
    
    /**
     * 初始化角色路由訪問權限
     */
    private initializeRoleRouteAccess(): void {
        Object.entries(ROLE_ROUTE_ACCESS).forEach(([roleName, routes]) => {
            this.roleRouteAccessCache.set(roleName, routes);
        });
        console.log('🛡️ 角色路由訪問權限已載入:', this.roleRouteAccessCache);
    }

    /**
     * 載入使用者權限（從 API 動態取得）
     */
    loadUserPermissions(): Observable<void> {
        const adminId = this.tokenService.getCurrentAdminId();

        if (!adminId) {
            this.setDefaultPermissions();
            return of(void 0);
        }

        // 如果已經載入過該使用者的權限，就不再載入
        if (this.lastLoadedAdminId === adminId && this.rolesSubject.value.length > 0) {
            console.log('✅ 權限已從快取載入，跳過 API 呼叫');
            return of(void 0);
        }

        // 標記為正在載入中
        this.isLoadingSubject.next(true);

        return this.securityService.getRolePermission(adminId).pipe(
            switchMap((res) => {
                if (res.isSuccess && res.data) {
                    // 過濾出使用者擁有的角色（is_owned: true）
                    const ownedRoles = res.data.filter((role: IApiResponseSecurityRole) => role.is_owned);

                    if (ownedRoles.length === 0) {
                        console.log('⚠️ 該管理員沒有分配任何角色');
                        this.setDefaultPermissions();
                        return of(void 0);
                    }

                    // 儲存角色名稱
                    const roleNames = ownedRoles.map((role: IApiResponseSecurityRole) => role.role_name);
                    this.rolesSubject.next(roleNames);
                    this.lastLoadedAdminId = adminId;
                    
                    // 動態分類角色類型
                    this.categorizeRoles(roleNames);

                    console.log('📥 已取得角色列表:', roleNames);
                    console.log('🎯 角色分類:', {
                        admin: Array.from(this.roleTypesCache.adminRoles),
                        maintenance: Array.from(this.roleTypesCache.maintenanceRoles),
                        logViewer: Array.from(this.roleTypesCache.logViewerRoles),
                        student: Array.from(this.roleTypesCache.studentRoles)
                    });

                    // 為每個角色呼叫 getRolePermissions API
                    const permissionRequests = ownedRoles.map((role: IApiResponseSecurityRole) =>
                        this.securityService.getRolePermissions(role.role_id).pipe(
                            map(permRes => {
                                if (permRes && permRes.data && Array.isArray(permRes.data)) {
                                    // 提取權限代碼（code）
                                    return permRes.data.map((perm: any) => perm.code);
                                }
                                return [];
                            }),
                            catchError(err => {
                                console.error(`❌ 取得角色 ${role.role_name} 的權限失敗:`, err);
                                return of([]);
                            })
                        )
                    );

                    // 等待所有權限 API 請求完成
                    return forkJoin(permissionRequests).pipe(
                        map((allPermissions: string[][]) => {
                            // 合併所有權限，去除重複
                            const mergedPermissions = new Set<string>();
                            allPermissions.forEach(permissions => {
                                permissions.forEach(permission => mergedPermissions.add(permission));
                            });

                            const finalPermissions = Array.from(mergedPermissions);
                            this.permissionsSubject.next(finalPermissions);
                            
                            console.log('✅ 已從 API 載入權限:', finalPermissions);
                            return void 0;
                        })
                    );
                } else {
                    this.setDefaultPermissions();
                    return of(void 0);
                }
            }),
            finalize(() => {
                this.isLoadingSubject.next(false);
            })
        );
    }

    /**
     * 清除權限（登出時使用）
     */
    clearPermissions(): void {
        this.permissionsSubject.next([]);
        this.rolesSubject.next([]);
        this.lastLoadedAdminId = null;
        this.isLoadingSubject.next(false);
    }

    /**
     * 設定預設權限（學生角色）
     */
    private setDefaultPermissions(): void {
        this.rolesSubject.next(['學生']);
        this.permissionsSubject.next([]);
        console.log('⚠️ 使用預設學生權限（無特殊權限）');
    }

    hasAnyPermission(requiredPermissions: string[]): boolean {
        const userPermissions = this.permissionsSubject.value;

        // 萬用權限檢查
        if (userPermissions.includes('*')) {
            return true;
        }

        return requiredPermissions.some(permission =>
            userPermissions.includes(permission)
        );
    }

    hasAllPermissions(requiredPermissions: string[]): boolean {
        const userPermissions = this.permissionsSubject.value;

        if (userPermissions.includes('*')) {
            return true;
        }

        return requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );
    }

    hasRole(role: string): boolean {
        return this.rolesSubject.value.includes(role);
    }

    hasAnyRole(roles: string[]): boolean {
        const userRoles = this.rolesSubject.value;
        return roles.some(role => userRoles.includes(role));
    }

    getPermissions(): string[] {
        return this.permissionsSubject.value;
    }

    getRoles(): string[] {
        return this.rolesSubject.value;
    }
    
    /**
     * 動態分類角色類型（根據角色名稱和權限）
     */
    private categorizeRoles(roleNames: string[]): void {
        // 清空舊的分類
        this.roleTypesCache.adminRoles.clear();
        this.roleTypesCache.maintenanceRoles.clear();
        this.roleTypesCache.logViewerRoles.clear();
        this.roleTypesCache.studentRoles.clear();
        
        roleNames.forEach(roleName => {
            // 根據角色名稱分類
            if (roleName === 'SuperAdmin' || roleName === 'Admin' || roleName === '管理人員') {
                this.roleTypesCache.adminRoles.add(roleName);
            } else if (roleName === '維護人員' || roleName === 'Maintenance') {
                this.roleTypesCache.maintenanceRoles.add(roleName);
            } else if (roleName === 'Log Viewer' || roleName.includes('log') || roleName.includes('viewer')) {
                this.roleTypesCache.logViewerRoles.add(roleName);
            } else if (roleName === '學生' || roleName === 'Student') {
                this.roleTypesCache.studentRoles.add(roleName);
            } else {
                // 預設為學生角色
                this.roleTypesCache.studentRoles.add(roleName);
            }
        });
    }
    
    /**
     * 檢查是否為管理員
     */
    isAdmin(): boolean {
        const userRoles = this.rolesSubject.value;
        return userRoles.some(role => this.roleTypesCache.adminRoles.has(role));
    }
    
    /**
     * 檢查是否為維護人員
     */
    isMaintenance(): boolean {
        const userRoles = this.rolesSubject.value;
        return userRoles.some(role => this.roleTypesCache.maintenanceRoles.has(role));
    }
    
    /**
     * 檢查是否為日誌查看者
     */
    isLogViewer(): boolean {
        const userRoles = this.rolesSubject.value;
        return userRoles.some(role => this.roleTypesCache.logViewerRoles.has(role));
    }
    
    /**
     * 檢查是否為學生
     */
    isStudent(): boolean {
        const userRoles = this.rolesSubject.value;
        return userRoles.some(role => this.roleTypesCache.studentRoles.has(role));
    }
    
    /**
     * 根據角色取得可訪問的路由列表
     */
    getAccessibleRoutesByRole(roleName: string): string[] {
        return this.roleRouteAccessCache.get(roleName) || [];
    }
    
    /**
     * 檢查用戶是否可以訪問特定路由（根據角色）
     */
    canAccessRouteByRole(routePath: string): boolean {
        const userRoles = this.rolesSubject.value;
        
        // 檢查是否有任何角色允許訪問該路由
        return userRoles.some(role => {
            const accessibleRoutes = this.getAccessibleRoutesByRole(role);
            // 如果角色可以訪問所有頁面（'*'）
            if (accessibleRoutes.includes('*')) {
                return true;
            }
            // 檢查是否包含該路由
            return accessibleRoutes.includes(routePath);
        });
    }
}