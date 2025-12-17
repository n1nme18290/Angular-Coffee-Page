import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SecurityService } from './service';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    private permissionsSubject = new BehaviorSubject<string[]>([]);
    public permissions$ = this.permissionsSubject.asObservable();

    constructor(
        private securityService: SecurityService,
        private tokenService: TokenService
    ) { }

    // 載入用戶權限
    loadUserPermissions(): Observable<string[]> {
        const memberId = this.tokenService.getCurrentUserId();

        if (!memberId) {
            this.permissionsSubject.next([]);
            return this.permissions$;
        }

        this.securityService.getRolePermission(memberId).subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    const permissions = response.data.map((role: any) =>
                        role.name || role.permission_name
                    );
                    console.log('📋 用戶權限已載入:', permissions);
                    this.permissionsSubject.next(permissions);
                } else {
                    this.permissionsSubject.next([]);
                }
            },
            error: (error) => {
                console.error('❌ 載入權限失敗:', error);
                this.permissionsSubject.next([]);
            }
        });

        return this.permissions$;
    }

    // 檢查是否有特定權限
    hasPermission(permission: string): boolean {
        const permissions = this.permissionsSubject.value;
        return permissions.includes(permission) ||
            permissions.includes('super_admin') ||
            permissions.includes('admin');
    }

    // 檢查是否有任一權限
    hasAnyPermission(permissions: string[]): boolean {
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

    // 清除權限
    clearPermissions(): void {
        this.permissionsSubject.next([]);
    }

    // 是否為超級管理員
    isSuperAdmin(): boolean {
        return this.hasPermission('super_admin') || this.hasPermission('admin');
    }
}