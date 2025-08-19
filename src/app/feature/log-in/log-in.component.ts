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

  email: string = '';
  password: string = '';
  passwordVisible = false;
  
  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  adminLogin() {
    this.authService.adminLogin(this.email, this.password).subscribe({
      next: (response) => {
        // 處理成功登入的邏輯
        console.log('登入成功', response.message);
        // 登入成功導航到主頁面
        this.router.navigate(['/personal-info']);
      },
      error: (error) => {
        // 處理登入失敗的邏輯
        console.error('登入失敗', error);
      }
    });
  }
  //連結
  GoRegister(){
    this.router.navigate(['/register']);
  }
  // GoPersonalInfo(){
  //   this.router.navigate(['/personal-info']);
  // }

}
