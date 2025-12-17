import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TokenService } from '../../share/service/token.service';
import { SecurityService } from '../../share/service/service';
import { map, catchError, of } from 'rxjs';

// 定義頁面所需的權限
export const ROUTE_PERMISSIONS: { [key: string]: string[] } = {
  'personal-info': [],  // 所有人都可訪問
  'point-information': ['view_points', 'manage_points'],
  'equipment': ['view_devices', 'manage_devices'],
  'equipment-information': ['view_devices', 'manage_devices'],
  'backend-management': ['admin'],
  'historical-record': ['view_logs'],
  'permission-management': ['manage_permissions', 'super_admin'],
};

export const permissionGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const securityService = inject(SecurityService);
  const router = inject(Router);

  // 檢查是否登入
  if (!tokenService.hasToken()) {
    console.log('❌ 未登入，導向登入頁');
    router.navigate(['/log-in']);
    return false;
  }

  // 取得路由路徑
  const routePath = route.routeConfig?.path || '';
  const requiredPermissions = ROUTE_PERMISSIONS[routePath] || [];

  // 如果該路由不需要特定權限，直接允許
  if (requiredPermissions.length === 0) {
    console.log('✅ 此路由無權限限制，允許訪問');
    return true;
  }

  // 取得當前用戶 I
  const memberId = tokenService.getCurrentUserId();
  if (!memberId) {
    console.log('❌ 無法取得用戶 ID');
    router.navigate(['/log-in']);
    return false;
  }

  // 檢查用戶權限
  return securityService.getRolePermission(memberId).pipe(
    map(response => {
      if (response.isSuccess && response.data) {
        const userPermissions = response.data.map((role: any) => role.name || role.permission_name);
        console.log('👤 用戶權限:', userPermissions);
        console.log('🔒 需要權限:', requiredPermissions);

        // 檢查是否有超級管理員權限
        if (userPermissions.includes('super_admin') || userPermissions.includes('admin')) {
          console.log('✅ 超級管理員，允許訪問所有頁面');
          return true;
        }

        // 檢查是否擁有所需權限（只要有其中一個權限即可）
        const hasPermission = requiredPermissions.some(permission =>
          userPermissions.includes(permission)
        );

        if (hasPermission) {
          console.log('✅ 擁有權限，允許訪問');
          return true;
        } else {
          console.log('❌ 權限不足，拒絕訪問');
          router.navigate(['/personal-info'], {
            queryParams: { error: 'permission_denied' }
          });
          return false;
        }
      } else {
        console.log('❌ 無法取得用戶權限');
        router.navigate(['/personal-info']);
        return false;
      }
    }),
    catchError(error => {
      console.error('❌ 檢查權限時發生錯誤:', error);
      router.navigate(['/personal-info']);
      return of(false);
    })
  );
};