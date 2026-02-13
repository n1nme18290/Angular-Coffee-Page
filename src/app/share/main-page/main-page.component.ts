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
import { Router } from '@angular/router';
import { SidebarService } from '../service/sidebar.service';
import { PermissionService } from '../service/permission.service';
import { AuthService } from '../service/service';
import { MAIN_MENU_ITEMS, SYSTEM_MANAGEMENT_ITEMS, MenuItemConfig } from '../../core/config/role-permissions.config';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterOutlet, NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule,
    NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule, CommonModule,
    NzRadioModule, NzMenuModule, ɵEmptyOutletComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  public sidebarService = inject(SidebarService);

  menuItems: MenuItem[] = [];
  systemManagementItems: MenuItem[] = [];

  get showSidebar(): boolean {
    return this.sidebarService.showSidebar;
  }

  constructor() { }

  ngOnInit() {
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

    this.menuItems = allMenuItems.filter(item => this.checkPermission(item.permissions, item.roles));
    this.systemManagementItems = allSystemItems.filter(item => this.checkPermission(item.permissions, item.roles));
  }

  private checkPermission(permissions: string[], roles?: string[]): boolean {
    // 無任何要求，所有人可見
    if ((!permissions || permissions.length === 0) && (!roles || roles.length === 0)) {
      return true;
    }

    // 檢查角色
    if (roles && roles.length > 0) {
      if (this.permissionService.hasAnyRole(roles)) {
        return true;
      }
    }

    // 檢查權限
    if (permissions && permissions.length > 0) {
      return this.permissionService.hasAnyPermission(permissions);
    }

    return false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isSystemManagementVisible(): boolean {
    return this.systemManagementItems.length > 0;
  }

  // 導航方法
  GoLogIn() {
    this.authService.logout();
    this.permissionService.clearPermissions();
    this.router.navigate(['/']);
  }
  GoPersonalInfo() { this.router.navigate(['/personal-info']); }
  GoPointInformation() { this.router.navigate(['/point-information']); }
  GoEquipment() { this.router.navigate(['/equipment']); }
  GoEquipmentInformation() { this.router.navigate(['/equipment-information']); }
  GoBackendManagement() { this.router.navigate(['/backend-management']); }
  GoHistoricalRecord() { this.router.navigate(['/historical-record']); }
  GoPermissionManagement() { this.router.navigate(['/permission-management']); }
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  permissions: string[];
  roles?: string[];
  method?: () => void;
}