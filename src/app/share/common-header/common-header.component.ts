import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { SidebarService } from '../service/sidebar.service';
import { PermissionService } from '../service/permission.service';
import { AuthService } from '../service/service';
import { TokenService } from '../service/token.service';

@Component({
  selector: 'app-common-header',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, NzButtonModule, NzIconModule, NzTypographyModule, NzModalModule],
  templateUrl: './common-header.component.html',
  styleUrl: './common-header.component.scss'
})
export class CommonHeaderComponent {
  @Input() title = '';
  @Input() showToggle = true;
  @Input() showUser = true;
  @Input() showLogout = true;

  sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private tokenService = inject(TokenService);
  private modal = inject(NzModalService);
  private router = inject(Router);

  get currentUsername(): string {
    return this.tokenService.getUsername();
  }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

  logout(): void {
    this.authService.logout();
    this.permissionService.clearPermissions();

    this.modal.success({
      nzTitle: '登出成功',
      nzContent: '您已成功登出系統，即將關閉此分頁',
      nzOkText: '確定',
      nzWidth: this.getModalWidth(),
      nzCentered: true,
      nzOnOk: () => {
        this.closeTabOrRedirect();
      }
    });
  }

  private getModalWidth(): string {
    const width = window.innerWidth;
    if (width <= 576) {
      return '90%';
    } else if (width <= 768) {
      return '80%';
    } else if (width <= 992) {
      return '500px';
    }
    return '520px';
  }

  private closeTabOrRedirect(): void {
    window.close();
    setTimeout(() => {
      this.router.navigate(['/logout-success']);
    }, 500);
  }

  @HostListener('window:resize')
  onResize(): void {}
}
