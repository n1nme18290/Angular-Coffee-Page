import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { SecurityService } from './service';
import { TokenService } from './token.service';
import { IApiResponseSecurityRole } from './model';
import { ROLE_PERMISSIONS } from '../../core/config/role-permissions.config';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private permissionsSubject = new BehaviorSubject<string[]>([]);
    private rolesSubject = new BehaviorSubject<string[]>([]);

    public permissions$ = this.permissionsSubject.asObservable();
    public roles$ = this.rolesSubject.asObservable();

    constructor(
        private securityService: SecurityService,
        private tokenService: TokenService
    ) { }

    loadUserPermissions(): Observable<void> {
        const adminId = this.tokenService.getCurrentAdminId();

        if (!adminId) {
            this.setDefaultPermissions();
            return of(void 0);
        }

        return this.securityService.getRolePermission(adminId).pipe(
            switchMap((res) => {
                if (res.isSuccess && res.data) {
                    // 過濾出使用者擁有的角色（is_owned: true）
                    const ownedRoles = res.data
                        .filter((role: IApiResponseSecurityRole) => role.is_owned)
                        .map((role: IApiResponseSecurityRole) => role.role_name);

                    this.rolesSubject.next(ownedRoles);

                    // 根據角色映射權限
                    const permissions = this.mapRolesToPermissions(ownedRoles);
                    this.permissionsSubject.next(permissions);
                } else {
                    this.setDefaultPermissions();
                }
                return of(void 0);
            })
        );
    }

    private setDefaultPermissions(): void {
        // 設定預設角色為「學生」
        this.rolesSubject.next(['學生']);
        this.permissionsSubject.next(ROLE_PERMISSIONS['學生'] || []);
    }

    private mapRolesToPermissions(roles: string[]): string[] {
        const permissions = new Set<string>();

        roles.forEach(role => {
            const rolePermissions = ROLE_PERMISSIONS[role];

            if (rolePermissions) {
                // 萬用權限 (*) 直接新增
                if (rolePermissions.includes('*')) {
                    permissions.add('*');
                } else {
                    rolePermissions.forEach(permission => permissions.add(permission));
                }
            }
        });

        return Array.from(permissions);
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

    clearPermissions(): void {
        this.permissionsSubject.next([]);
        this.rolesSubject.next([]);
    }
}