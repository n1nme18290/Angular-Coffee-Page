import { Component, inject } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../share/service/service';


@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule,
    NzRadioModule,],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {

  //使用者輸入的 Email 帳號欄位
  email: string = '';
  //使用者輸入的密碼欄位
  password: string = '';
  //控制密碼是否顯示在畫面上，眼睛 icon開關
  passwordVisible = false;
  
  constructor(private router: Router, private authService: AuthService) {}

  // 登入
  onLogin(email: string, password: string): void {
    this.authService.loginAndSaveToken(email, password).subscribe({
      next: (response) => {
        //登入成功，Token 已在 AuthService 儲存
        if (response.isSuccess) {
          console.log('登入成功，token 已儲存');
          // 登入成功導航到主頁面
          this.router.navigate(['/personal-info']);
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

  //登出
  onLogout(): void {
    this.authService.logout();
    //清除Token
    console.log('已登出，token 已清除');
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

  // 導到註冊頁面
  GoRegister(){
    this.router.navigate(['/register']);
  }

  //sso 單一登入流程
  onSSOLogin(): void {
    this.authService.ssoLoginAndSaveToken().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          console.log('登入成功，token 已儲存');
          this.router.navigate(['/personal-info']);
        }
      },
      error: (error) => {
        console.error('SSO 登入錯誤:', error);
      }
    });
  }
}
