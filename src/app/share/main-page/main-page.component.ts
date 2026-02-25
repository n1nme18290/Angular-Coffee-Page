import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, ɵEmptyOutletComponent } from '@angular/router';
import { CommonModule } from '@angular/common';
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
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { SidebarService } from '../service/sidebar.service';
import { PermissionService } from '../service/permission.service';
import { AuthService } from '../service/service';
import { HostListener } from '@angular/core';
import { MAIN_MENU_ITEMS, SYSTEM_MANAGEMENT_ITEMS, MenuItemConfig } from '../../core/config/role-permissions.config';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterOutlet, NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule,
    NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule, CommonModule,
    NzRadioModule, NzMenuModule, NzModalModule, ɵEmptyOutletComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private modal = inject(NzModalService);
  public sidebarService = inject(SidebarService);

  menuItems: MenuItem[] = [];
  systemManagementItems: MenuItem[] = [];

  get showSidebar(): boolean {
    return this.sidebarService.showSidebar;
  }

  constructor() { }

  ngOnInit() {
    this.sidebarService.isCollapsed = true; // 預設收合
    this.sidebarService.setShowSidebar(true);

    // 訂閱權限變化，自動更新菜單
    this.permissionService.permissions$.subscribe(() => {
      this.updateVisibleMenuItems();
      this.checkSidebarVisibility();
    });

    // 檢查權限是否已經載入，如果已經載入過就不再請求
    if (this.permissionService.getRoles().length === 0) {
      console.log('🔄 首次進入主頁面，載入權限...');
      this.permissionService.loadUserPermissions().subscribe();
    } else {
      console.log('✅ 權限已在快取中，無需重新載入');
      // 手動觸發菜單更新
      this.updateVisibleMenuItems();
      this.checkSidebarVisibility();
    }
  }

  private checkSidebarVisibility() {
    const hasAnyMenu = this.menuItems.length > 0 || this.systemManagementItems.length > 0;
    this.sidebarService.setShowSidebar(hasAnyMenu);
  }

  private updateVisibleMenuItems() {
    const allMenuItems: MenuItem[] = MAIN_MENU_ITEMS.map(item => ({
      ...item,
      method: () => this.navigateTo(item.path)
    }));

    const allSystemItems: MenuItem[] = SYSTEM_MANAGEMENT_ITEMS.map(item => ({
      ...item,
      method: () => this.navigateTo(item.path)
    }));

    this.menuItems = allMenuItems.filter(item => this.checkPermission(item.roles));
    this.systemManagementItems = allSystemItems.filter(item => this.checkPermission(item.roles));
  }

  private checkPermission(roles: string[]): boolean {
    // 無任何要求，所有人可見
    if (!roles || roles.length === 0) {
      return true;
    }

    // 只檢查角色
    return this.permissionService.hasAnyRole(roles);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isSystemManagementVisible(): boolean {
    return this.systemManagementItems.length > 0;
  }

  // 導航方法
  GoLogIn() {
    // 先清除權限和 Token
    this.authService.logout();
    this.permissionService.clearPermissions();

    // 顯示登出成功彈窗（響應式寬度）
    this.modal.success({
      nzTitle: '登出成功',
      nzContent: '您已成功登出系統，即將關閉此分頁',
      nzOkText: '確定',
      nzWidth: this.getModalWidth(),
      nzCentered: true,
      nzOnOk: () => {
        // 嘗試關閉分頁
        this.closeTabOrRedirect();
      }
    });
  }

  /**
   * 取得 Modal 響應式寬度
   */
  private getModalWidth(): string {
    const width = window.innerWidth;
    if (width <= 576) {
      return '90%';  // 手機
    } else if (width <= 768) {
      return '80%';  // 平板直向
    } else if (width <= 992) {
      return '500px'; // 平板橫向
    } else {
      return '520px'; // 桌面
    }
  }

  /**
   * 嘗試關閉分頁，如果無法關閉則導向登出成功頁面
   */
  private closeTabOrRedirect(): void {
    // 嘗試關閉分頁（只有在特定情況下才能成功）
    window.close();

    // 如果 0.5 秒後分頁還沒關閉，則導向到登出成功頁面
    setTimeout(() => {
      // 如果分頁還在（沒被關閉），則導向到登出成功頁
      this.router.navigate(['/logout-success']);
    }, 500);
  }
  GoPersonalInfo() { this.router.navigate(['/personal-info']); }
  GoPointInformation() { this.router.navigate(['/point-information']); }
  GoEquipment() { this.router.navigate(['/equipment']); }
  GoEquipmentInformation() { this.router.navigate(['/equipment-information']); }
  GoBackendManagement() { this.router.navigate(['/backend-management']); }
  GoHistoricalRecord() { this.router.navigate(['/historical-record']); }
  GoPermissionManagement() { this.router.navigate(['/permission-management']); }

  toggleCollapsed(): void { //遮罩 點擊空白處即可關側欄
    this.sidebarService.toggleCollapsed();
  }

  // 依照裝置寬度動態回傳側欄寬度數值
  get sidebarWidth(): number {
    const width = window.innerWidth;
    if (width <= 420) return 180;
    if (width <= 768) return 220;
    return 300;
  }

  // 監聽視窗大小變化事件
  // 當使用者旋轉螢幕或縮放視窗時，Angular 會重新計算 sidebarWidth
  @HostListener('window:resize')
  onResize() { }
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  roles: string[];  // 只保留角色檢查
  method?: () => void;
}