import { Component, inject } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
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
  isLoading = false;

  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  onLogin(email: string, password: string): void {
    const isBackdoor = window.location.pathname.includes('backdoor-login');
    this.isLoading = true;

    this.authService.loginAndSaveToken(email, password, isBackdoor).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.permissionService.loadUserPermissions().subscribe(() => {
            this.isLoading = false;
            this.router.navigate(['/personal-info']);
          });
        } else {
          this.isLoading = false;
          this.message.error(response.message || '帳號或密碼錯誤');
        }
      },
      error: () => {
        this.isLoading = false;
        this.message.error('登入失敗，請稍後再試');
      }
    });
  }

  onSSOLogin(): void {
    if (!this.studentId.trim()) {
      this.message.warning('請輸入學號');
      return;
    }

    this.isLoading = true;

    this.authService.ssoLoginAndSaveToken(this.studentId.trim()).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.permissionService.loadUserPermissions().subscribe(() => {
            this.isLoading = false;
            this.router.navigate(['/personal-info']);
          });
        } else {
          this.isLoading = false;
          this.message.error(response.message || '學號登入失敗');
        }
      },
      error: () => {
        this.isLoading = false;
        this.message.error('登入失敗，請稍後再試');
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.permissionService.clearPermissions();
  }
}
