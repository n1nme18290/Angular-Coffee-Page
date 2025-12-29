import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
import { HasPermissionDirective } from '../../feature/auth/permission-directive';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterOutlet, NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule,
    NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule, CommonModule, HasPermissionDirective,
    NzRadioModule, NzMenuModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  public sidebarService = inject(SidebarService);
  
  // 選單項目配置
  menuItems: MenuItem[] = [];
  systemManagementItems: MenuItem[] = [];
  
  // 是否顯示側邊欄（根據使用者角色決定）
  showSidebar: boolean = true;
  
  constructor() { }

  ngOnInit() {
    // 訂閱權限變化，動態更新選單
    this.permissionService.permissions$.subscribe(permissions => {
      console.log('📋 權限已更新，重新計算可見選單', permissions);
      this.updateVisibleMenuItems();
      this.checkSidebarVisibility();
    });
    
    // 初始載入權限
    this.permissionService.loadUserPermissions();
  }
  
  // 顯示側邊欄
  checkSidebarVisibility() {
    // 判斷是否為一般使用者
    const isRegularUser = this.systemManagementItems.length === 0 && this.menuItems.length <= 1;
    
    
    this.showSidebar = !isRegularUser;
    
    console.log('側邊欄顯示狀態:', this.showSidebar ? '顯示' : '隱藏');
  }
  
  updateVisibleMenuItems() {
    // 定義所有選單項目
    const allMenuItems: MenuItem[] = [
      { 
        path: '/personal-info', 
        label: '個人資訊', 
        icon: 'user',
        permissions: [], // 所有人都可見
        method: () => this.GoPersonalInfo()
      }
    ];

    // 定義系統管理子選單
    const allSystemItems: MenuItem[] = [
      { 
        path: '/equipment', 
        label: '設備管理頁面', 
        icon: 'laptop',
        permissions: [],
        // permissions: ['view_devices', 'manage_devices'],
        method: () => this.GoEquipment()
      },
      { 
        path: '/backend-management', 
        label: '兌換資料分析頁面', 
        icon: 'bar-chart',
        permissions: [],
        // permissions: ['view_analytics', 'manage_backend'],
        method: () => this.GoBackendManagement()
      },
      
      { 
        path: '/permission-management', 
        label: '使用者管理', 
        icon: 'team',
        permissions: [],
        // permissions: ['manage_permissions', 'manage_users'],
        method: () => this.GoPermissionManagement()
      },
      { 
        path: '/historical-record', 
        label: '歷史紀錄頁面', 
        icon: 'history',
        permissions: [],
        // permissions: ['view_logs'],
        method: () => this.GoHistoricalRecord()
      }
    ];

    // 過濾出可見的選單項目
    this.menuItems = allMenuItems.filter(item => 
      this.checkPermission(item.permissions)
    );

    // 過濾出可見的系統管理子項目
    this.systemManagementItems = allSystemItems.filter(item => 
      this.checkPermission(item.permissions)
    );
    console.log('✅ 可見的主選單項目:', this.menuItems.length);
    console.log('✅ 可見的系統管理項目:', this.systemManagementItems.length);
  }

  // 檢查權限（無權限要求或擁有任一權限即可）
  checkPermission(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true; // 無權限要求，所有人可見
    }
    return this.permissionService.hasAnyPermission(permissions);
  }

  // 檢查系統管理選單是否可見（至少有一個子項目可見）
  isSystemManagementVisible(): boolean {
    return this.systemManagementItems.length > 0;
  }

  GoLogIn() {
    this.router.navigate(['/log-in']);
  }
  GoPersonalInfo() {
    this.router.navigate(['/personal-info']);
  }
  GoPointInformation() {
    this.router.navigate(['/point-information']);
  }
  GoEquipment() {
    this.router.navigate(['/equipment']);
  }
  GoEquipmentInformation() {
    this.router.navigate(['/equipment-information']);
  }
  GoBackendManagement() {
    this.router.navigate(['/backend-management'])
  }
  GoHistoricalRecord(){
    this.router.navigate(['/historical-record'])
  }
  GoPermissionManagement(){
    this.router.navigate(['/permission-management'])
  }
}

// 選單項目介面
interface MenuItem {
  path: string;
  label: string;
  icon: string;
  permissions: string[];
  method?: () => void;
  children?: MenuItem[];
}