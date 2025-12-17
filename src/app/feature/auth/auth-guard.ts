import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TokenService } from '../../share/service/token.service';

export const authGuard: CanActivateFn = (route, state) => {
    const tokenService = inject(TokenService);
    const router = inject(Router);

    const hasToken = tokenService.hasToken();

    if (!hasToken) {
        console.log('❌ 未登入，導向登入頁');
        router.navigate(['/log-in']);
        return false;
    }

    console.log('✅ 已登入，允許訪問');
    return true;
};