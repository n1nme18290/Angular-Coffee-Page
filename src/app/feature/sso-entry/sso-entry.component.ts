import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService } from '../../share/service/service';
import { PermissionService } from '../../share/service/permission.service';
import { TokenService } from '../../share/service/token.service';

@Component({
  selector: 'app-sso-entry',
  standalone: true,
  imports: [NzSpinModule],
  templateUrl: './sso-entry.component.html',
  styleUrl: './sso-entry.component.scss'
})
export class SsoEntryComponent implements OnInit {
  
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  ngOnInit(): void {
    // 檢查是否已經登入
    if (this.tokenService.hasToken()) {
      console.log('已有有效 Token，導向個人資訊頁');
      this.router.navigate(['/personal-info']);
      return;
    }

    // 嘗試從 URL 獲取 SSO Token 或學號
    this.handleSSOLogin();
  }

  /**
   * 處理 SSO 登入邏輯
   * 可以從 URL query parameters 獲取 SSO token 或學號
   */
  private handleSSOLogin(): void {
    // 方案 1: 從 URL 獲取 SSO token (例如: /?sso_token=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('sso_token');
    const studentId = urlParams.get('student_id');

    if (ssoToken) {
      // 使用 SSO token 登入
      this.loginWithSSOToken(ssoToken);
    } else if (studentId) {
      // 使用學號登入 (現有流程)
      this.loginWithStudentId(studentId);
    } else {
      // 沒有任何憑證，導向錯誤頁或顯示訊息
      console.error('缺少 SSO 登入憑證');
      // 可以導向一個說明頁面或顯示錯誤訊息
      setTimeout(() => {
        this.router.navigate(['/sso-error']);
      }, 2000);
    }
  }

  /**
   * 使用 SSO Token 登入（需要後端 API 支援）
   */
  private loginWithSSOToken(ssoToken: string): void {
    // TODO: 呼叫後端驗證 SSO Token 的 API
    // this.authService.validateSSOToken(ssoToken).subscribe({
    //   next: (response) => {
    //     if (response.isSuccess) {
    //       this.proceedToApp();
    //     } else {
    //       this.handleLoginError('SSO Token 無效');
    //     }
    //   },
    //   error: (error) => {
    //     this.handleLoginError('SSO 驗證失敗');
    //   }
    // });
    
    console.log('TODO: 實作 SSO Token 驗證流程');
  }

  /**
   * 使用學號登入（現有流程）
   */
  private loginWithStudentId(studentId: string): void {
    this.authService.ssoLoginAndSaveToken(studentId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.proceedToApp();
        } else {
          this.handleLoginError('學號登入失敗');
        }
      },
      error: (error) => {
        this.handleLoginError('SSO 登入錯誤');
      }
    });
  }

  /**
   * 載入權限並導向主頁
   */
  private proceedToApp(): void {
    console.log('登入成功，載入使用者權限');
    this.permissionService.loadUserPermissions().subscribe(() => {
      console.log('權限載入完成，導向個人資訊頁');
      this.router.navigate(['/personal-info']);
    });
  }

  /**
   * 處理登入錯誤
   */
  private handleLoginError(message: string): void {
    console.error(message);
    // 可以顯示錯誤訊息或導向錯誤頁面
    setTimeout(() => {
      this.router.navigate(['/sso-error']);
    }, 2000);
  }
}
