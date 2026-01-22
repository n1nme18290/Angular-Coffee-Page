import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SecurityService } from './service';
import { TokenService } from './token.service';

// 角色介面定義
interface UserRole {
    role_id: string;
    role_name: string;
    description: string;
    is_owned: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private permissionsSubject = new BehaviorSubject<string[]>([]);
    public permissions$ = this.permissionsSubject.asObservable();
    
    private rolesSubject = new BehaviorSubject<string[]>([]);
    public roles$ = this.rolesSubject.asObservable();

    // 角色到權限的映射表
    private readonly ROLE_PERMISSIONS_MAP: { [roleName: string]: string[] } = {
        'SuperAdmin': ['*'], // 超級管理員擁有所有權限
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

    constructor(
        private securityService: SecurityService,
        private tokenService: TokenService
    ) { }

    // 載入用戶角色和權限
    loadUserPermissions(): Observable<string[]> {
        const adminId = this.tokenService.getCurrentAdminId();

        if (!adminId) {
            this.permissionsSubject.next([]);
            this.rolesSubject.next([]);
            return this.permissions$;
        }

        this.securityService.getRolePermission(adminId).subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    // 過濾出用戶擁有的角色（is_owned: true）
                    const ownedRoles = response.data
                        .filter((role: UserRole) => role.is_owned)
                        .map((role: UserRole) => role.role_name);
                    
                    console.log('👤 用戶擁有的角色:', ownedRoles);
                    this.rolesSubject.next(ownedRoles);

                    // 根據角色映射取得對應的權限
                    const permissions = this.mapRolesToPermissions(ownedRoles);
                    console.log('📋 用戶權限已載入:', permissions);
                    this.permissionsSubject.next(permissions);
                } else {
                    this.permissionsSubject.next([]);
                    this.rolesSubject.next([]);
                }
            },
            error: (error) => {
                console.error('❌ 載入權限失敗:', error);
                this.permissionsSubject.next([]);
                this.rolesSubject.next([]);
            }
        });

        return this.permissions$;
    }

    // 將角色映射為權限清單
    private mapRolesToPermissions(roles: string[]): string[] {
        const permissionsSet = new Set<string>();

        roles.forEach(role => {
            const rolePermissions = this.ROLE_PERMISSIONS_MAP[role] || [];
            
            // 如果角色有 '*' 權限（超級管理員），返回所有權限
            if (rolePermissions.includes('*')) {
                permissionsSet.add('*');
                permissionsSet.add('super_admin');
                return;
            }

            rolePermissions.forEach(permission => {
                permissionsSet.add(permission);
            });
        });

        return Array.from(permissionsSet);
    }

    // 檢查是否有特定權限
    hasPermission(permission: string): boolean {
        const permissions = this.permissionsSubject.value;
        
        // 超級管理員擁有所有權限
        if (permissions.includes('*') || permissions.includes('super_admin')) {
            return true;
        }
        
        return permissions.includes(permission);
    }

    // 檢查是否有任一權限
    hasAnyPermission(permissions: string[]): boolean {
        // 如果沒有權限要求，返回 true
        if (!permissions || permissions.length === 0) {
            return true;
        }
        return permissions.some(p => this.hasPermission(p));
    }

    // 檢查是否有所有權限
    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(p => this.hasPermission(p));
    }

    // 取得當前權限列表
    getPermissions(): string[] {
        return this.permissionsSubject.value;
    }

    // 取得當前角色列表
    getRoles(): string[] {
        return this.rolesSubject.value;
    }

    // 檢查是否有特定角色
    hasRole(roleName: string): boolean {
        const roles = this.rolesSubject.value;
        return roles.includes(roleName);
    }

    // 檢查是否有任一角色
    hasAnyRole(roleNames: string[]): boolean {
        const roles = this.rolesSubject.value;
        return roleNames.some(roleName => roles.includes(roleName));
    }

    // 清除權限和角色
    clearPermissions(): void {
        this.permissionsSubject.next([]);
        this.rolesSubject.next([]);
    }

    // 是否為超級管理員
    isSuperAdmin(): boolean {
        return this.hasPermission('*') || 
               this.hasPermission('super_admin') || 
               this.hasRole('SuperAdmin') ||
               this.hasRole('Admin');
    }

    // 取得用戶角色的詳細資訊（用於除錯）
    getUserInfo(): { roles: string[]; permissions: string[] } {
        return {
            roles: this.getRoles(),
            permissions: this.getPermissions()
        };
    }
}