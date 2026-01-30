import { Component, inject } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../share/service/service';
import { PermissionService } from '../../share/service/permission.service';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [NzLayoutModule, NzButtonModule, NzIconModule, NzTypographyModule, NzInputModule, FormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {

  studentId: string = '';

  private permissionService = inject(PermissionService);
  private router = inject(Router)
  private authService = inject(AuthService);
  constructor() { }

  // 登入
  onLogin(email: string, password: string): void {
    this.authService.loginAndSaveToken(email, password).subscribe({
      next: (response) => {
        //登入成功，Token 已在 AuthService 儲存
        if (response.isSuccess) {
          console.log('登入成功，token 已儲存');
          // 登入成功導航到主頁面
          this.permissionService.loadUserPermissions().subscribe(() => {
            console.log('使用者權限已載入');
            this.router.navigate(['/personal-info']);
          });
        } else {
          //回傳錯誤訊息
          console.error('登入失敗:', response.message);
        }
      },
      // 處理登入失敗的邏輯
      error: (error) => {
        console.error('登入錯誤:', error);
      }
    });
  }

  // adminLogin() {
  //   this.authService.adminLogin(this.email, this.password).subscribe({
  //     next: (response) => {
  //       // 處理成功登入的邏輯
  //       console.log('登入成功', response.message);
  //       // 登入成功導航到主頁面
  //       this.router.navigate(['/personal-info']);
  //     },
  //     error: (error) => {
  //       // 處理登入失敗的邏輯
  //       console.error('登入失敗', error);
  //     }
  //   });
  // }

  //sso 單一登入流程
  onSSOLogin(): void {
    this.authService.ssoLoginAndSaveToken(this.studentId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          console.log('登入成功，token 已儲存');
          this.permissionService.loadUserPermissions().subscribe(() => {
            console.log('使用者權限已載入');
            this.router.navigate(['/personal-info']);
          });
        }
      },
      error: (error) => {
        console.error('SSO 登入錯誤:', error);
      }
    });
  }
    //登出
  onLogout(): void {
    this.authService.logout();
    this.permissionService.clearPermissions();
  }
}
