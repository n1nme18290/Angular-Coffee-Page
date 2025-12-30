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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';

import { SidebarService } from '../../share/service/sidebar.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { IApiResponseAdmin, IApiResponseMember, IApiResponseSecurityRole } from '../../share/service/model';
import { AdminService, MemberService, SecurityService } from '../../share/service/service';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ROLE_PERMISSIONS } from '../../core/config/role-permissions.config';


@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule, NzGridModule,
    NzRadioModule, NzModalModule, CommonModule, NzTableModule, NzDividerModule, NzCheckboxModule, NzTagModule],
  templateUrl: './permission-management.component.html',
  styleUrl: './permission-management.component.scss'
})
export class PermissionManagementComponent {
  constructor() { }

  router = inject(Router);
  sidebarService = inject(SidebarService);
  memberService = inject(MemberService);
  adminService = inject(AdminService);
  securityService = inject(SecurityService);
  message = inject(NzMessageService);

  adminList: IApiResponseAdmin[] = [];
  memberlist: IApiResponseMember[] = [];

  checked = false;
  loading = false;
  indeterminate = false;
  setOfCheckedRoleId = new Set<string>();

  adminCurrentPage = 1;
  adminPageSize = 5;
  totalAdmin = 0;
  memberCurrentPage = 1;
  memberPageSize = 5;
  totalMember = 0;

  // 角色相關
  availableRoles: IApiResponseSecurityRole[] = [];
  rolePermissions = ROLE_PERMISSIONS;


  ngOnInit() {
    this.loadAvailableRoles();
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  // 載入所有可用角色
  loadAvailableRoles(): void {
    this.securityService.getAllRolesList().subscribe({
      next: (res) => {
        if (res?.data && Array.isArray(res.data)) {
          this.availableRoles = res.data.map((role: IApiResponseSecurityRole) => ({
            role_id: role.role_id,
            role_name: role.role_name,
            description: role.description,
            is_owned: false // 這裡的 is_owned 只是預設值，實際狀態由 getRolePermission 取得
          }));
          console.log('✅ 可用角色載入成功:', this.availableRoles);
        }
      },
      error: (err) => {
        console.error('❌ 載入角色列表失敗', err);
        this.message.error('載入角色列表失敗');
      }
    });
  }

  // Admin 頁面數據變更時
  onAdminPageIndexChange(pageIndex: number): void {
    this.adminCurrentPage = pageIndex;
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }

  // Admin 每頁筆數變更時
  onAdminPageSizeChange(pageSize: number): void {
    this.adminPageSize = pageSize;
    this.adminCurrentPage = 1;
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }

  // 取得分頁 Admin
  getPageAdmin(page: number, pageSize: number): void {
    this.loading = true;
    this.adminService.getPageAdmins(page, pageSize).subscribe({
      next: (res) => {
        const data = res?.data?.data;
        if (Array.isArray(data)) {
          this.adminList = data;
        } else {
          this.adminList = [];
        }
        this.totalAdmin = res?.data?.total ?? 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ 取得管理員列表失敗', err);
        this.message.error('取得管理員列表失敗');
        this.adminList = [];
        this.totalAdmin = 0;
        this.loading = false;
      }
    });
  }
  // Member 頁面數據變更時
  onMemberPageIndexChange(pageIndex: number): void {
    this.memberCurrentPage = pageIndex;
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  // Member 一頁幾筆變更時
  onMemberPageSizeChange(pageSize: number): void {
    this.memberPageSize = pageSize;
    this.memberCurrentPage = 1;
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  // 取得分頁 Member
  getPageMember(page: number, pageSize: number): void {
    this.loading = true;
    this.memberService.getPageMembers(page, pageSize).subscribe({
      next: (res) => {
        const data = res?.data?.data;
        if (Array.isArray(data)) {
          this.memberlist = data;
        } else {
          this.memberlist = [];
        }
        this.totalMember = res?.data?.total ?? 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ 取得會員列表失敗', err);
        this.message.error('取得會員列表失敗');
        this.memberlist = [];
        this.totalMember = 0;
        this.loading = false;
      }
    });
  }
  // 編輯管理員角色彈跳視窗
  editAdminRoleVisible = false;
  roleListLoading = false;
  currentEditAdmin: IApiResponseAdmin | null = null;

  // 開啟編輯角色 Modal
  editAdminRoleModal(admin: IApiResponseAdmin): void {
    this.currentEditAdmin = admin;
    this.setOfCheckedRoleId.clear();
    this.roleListLoading = true;
    
    // 載入該管理員現有的角色（使用 getRolePermission 取得 is_owned 為 true 的角色）
    this.securityService.getRolePermission(admin.id).subscribe({
      next: (res) => {
        console.log('🔍 管理員角色資料:', res);
        if (res?.data && Array.isArray(res.data)) {
          // 篩選出 is_owned 為 true 的角色，並預先勾選
          const ownedRoles = res.data.filter((role: IApiResponseSecurityRole) => role.is_owned);
          console.log('✅ 已擁有的角色:', ownedRoles);
          
          ownedRoles.forEach((role: IApiResponseSecurityRole) => {
            this.setOfCheckedRoleId.add(role.role_id);
          });
        }
        this.roleListLoading = false;
        this.editAdminRoleVisible = true;
        this.refreshCheckedStatus();
      },
      error: (err) => {
        console.error('❌ 取得管理員角色失敗', err);
        this.message.warning('無法載入現有角色，將顯示空白');
        this.roleListLoading = false;
        this.editAdminRoleVisible = true;
      }
    });
  }
  // 儲存角色分配
  saveAdminRoles(): void {
    if (!this.currentEditAdmin) {
      this.message.error('請先選擇要編輯的管理員');
      return;
    }

    const selectedRoleIds = Array.from(this.setOfCheckedRoleId);
    
    if (selectedRoleIds.length === 0) {
      this.message.warning('請至少選擇一個角色');
      return;
    }

    this.roleListLoading = true;
    this.securityService.assignRolesToAdmin(
      this.currentEditAdmin.id,
      selectedRoleIds
    ).subscribe({
      next: (res) => {
        console.log('✅ 角色設定成功:', res);
        this.message.success('角色設定成功！');
        this.editAdminRoleVisible = false;
        this.setOfCheckedRoleId.clear();
        this.currentEditAdmin = null;
        this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
        this.roleListLoading = false;
      },
      error: (err) => {
        console.error('❌ 設定角色失敗:', err);
        this.message.error('角色設定失敗：' + (err.error?.message || '請稍後再試'));
        this.roleListLoading = false;
      }
    });
  }
  // 取消編輯
  cancelEditAdminRole(): void {
    this.editAdminRoleVisible = false;
    this.setOfCheckedRoleId.clear();
    this.currentEditAdmin = null;
  }

  // 取得管理員的角色顯示名稱
  getAdminRoleNames(admin: IApiResponseAdmin): string {
    // 注意：這裡只是快速顯示，實際角色資料需要透過 API 查詢
    // 如果需要即時顯示，建議在 getPageAdmin 時一併查詢角色資訊
    if (admin.permission === 0 || admin.permission === null || admin.permission === undefined) {
      return '未設定角色';
    }
    // 根據 permission 值顯示對應角色名稱（需要根據後端實際映射調整）
    return `權限等級 ${admin.permission}`;
  }

  // 取得角色對應的權限列表
  getRolePermissions(roleName: string): string[] {
    return this.rolePermissions[roleName] || [];
  }

  // 全選/取消全選角色
  onAllRolesChecked(checked: boolean): void {
    this.availableRoles.forEach(role => 
      this.updateCheckedRoleSet(role.role_id, checked)
    );
    this.refreshCheckedStatus();
  }

  // 單項角色勾選變更
  onRoleItemChecked(roleId: string, checked: boolean): void {
    this.updateCheckedRoleSet(roleId, checked);
    this.refreshCheckedStatus();
  }

  // 更新角色選取集合
  updateCheckedRoleSet(roleId: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedRoleId.add(roleId);
    } else {
      this.setOfCheckedRoleId.delete(roleId);
    }
  }

  // 刷新選取狀態
  refreshCheckedStatus(): void {
    if (this.availableRoles.length === 0) {
      this.checked = false;
      this.indeterminate = false;
      return;
    }
    const allChecked = this.availableRoles.every(role => 
      this.setOfCheckedRoleId.has(role.role_id)
    );
    const someChecked = this.availableRoles.some(role => 
      this.setOfCheckedRoleId.has(role.role_id)
    );
    this.checked = allChecked;
    this.indeterminate = someChecked && !allChecked;
  }

  // 發送點數給會員（待實作）
  sendPointsToMember(member: IApiResponseMember): void {
    this.message.info('發送點數功能開發中');
  }
  // 切換側邊欄
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}
