import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { of, switchMap, catchError } from 'rxjs';
import { TokenService } from '../../share/service/token.service';
import { PermissionService } from '../../share/service/permission.service';
import { PUBLIC_ROUTES } from '../../core/config/role-permissions.config';

/**
 * 基於角色的路由守衛（簡化版）
 * 完全使用角色來驗證，不再檢查權限
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // 檢查是否登入
  if (!tokenService.hasToken()) {
    console.log('❌ 未登入，導向 SSO 入口');
    router.navigate(['/']);
    return false;
  }

  // 取得路由路徑
  const routePath = route.routeConfig?.path || '';

  // 檢查是否為公開路由（所有登入用戶都可訪問）
  if (PUBLIC_ROUTES.includes(routePath)) {
    console.log(`✅ ${routePath} 為公開路由，允許訪問`);
    return true;
  }

  const checkAccess = () => {
    if (permissionService.canAccessRouteByRole(routePath)) {
      return true;
    }
    router.navigate(['/personal-info'], { queryParams: { error: 'permission_denied' } });
    return false;
  };

  // 角色已載入：直接決定
  const cachedRoles = permissionService.getRoles();
  if (cachedRoles.length > 0) {
    return checkAccess();
  }

  // 角色未載入（例如頁面重新整理）：先載入再決定，避免未驗證即放行
  return permissionService.loadUserPermissions().pipe(
    switchMap(() => of(checkAccess())),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};