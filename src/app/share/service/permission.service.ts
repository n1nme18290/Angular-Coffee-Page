import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, finalize, forkJoin, map, catchError } from 'rxjs';
import { SecurityService } from './service';
import { TokenService } from './token.service';
import { IApiResponseSecurityRole } from './model';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private permissionsSubject = new BehaviorSubject<string[]>([]);
    private rolesSubject = new BehaviorSubject<string[]>([]);
    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    private lastLoadedAdminId: string | null = null; // 記錄上次載入的 admin id

    public permissions$ = this.permissionsSubject.asObservable();
    public roles$ = this.rolesSubject.asObservable();
    public isLoading$ = this.isLoadingSubject.asObservable();

    constructor(
        private securityService: SecurityService,
        private tokenService: TokenService
    ) { }

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

                    console.log('📥 已取得角色列表:', roleNames);

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
}