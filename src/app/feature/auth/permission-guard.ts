import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
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

  // 取得當前用戶角色
  const cachedRoles = permissionService.getRoles();
  
  console.log(`🔍 檢查路由 ${routePath} 的訪問權限`);
  console.log('👤 用戶角色:', cachedRoles);

  // 如果角色還沒載入完成，先允許訪問，避免卡住
  if (cachedRoles.length === 0) {
    console.log('⚠️ 角色尚未載入，暫時允許訪問');
    return true;
  }

  // 使用角色路由訪問權限檢查
  if (permissionService.canAccessRouteByRole(routePath)) {
    console.log(`✅ 角色允許訪問 ${routePath}`);
    return true;
  }

  console.log('❌ 角色權限不足，拒絕訪問');
  console.log('🛡️ 用戶角色:', cachedRoles);
  console.log('📍 嘗試訪問:', routePath);
  router.navigate(['/personal-info'], {
    queryParams: { error: 'permission_denied' }
  });
  return false;
};