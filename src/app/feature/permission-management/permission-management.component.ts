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
import { AdminService, MemberService, SecurityService, PointService } from '../../share/service/service';
import { TokenService } from '../../share/service/token.service';
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
  pointService = inject(PointService);
  tokenService = inject(TokenService);
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

  // 發送點數相關
  sendPointsVisible = false;
  currentSendPointsMember: IApiResponseMember | null = null;
  sendPointsValue: number = 0;
  sendPointsLoading = false;


  ngOnInit() {
    // 先確保角色列表已加載
    this.loadAvailableRoles();
    // 同時加載管理員和會員列表
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  // 載入所有可用角色
  loadAvailableRoles(): void {
    console.log('🔄 開始加載角色列表...');
    this.roleListLoading = true;
    
    this.securityService.getAllRolesList().subscribe({
      next: (res) => {
        console.log('📥 後端返回的原始響應:', res);
        
        if (res?.data) {
          let roleData: any = res.data;
          
          // 如果返回的 data 本身不是數組，嘗試提取內部數據
          if (!Array.isArray(roleData)) {
            console.warn('⚠️ 角色數據不是數組，嘗試提取...');
            if (roleData.data && Array.isArray(roleData.data)) {
              roleData = roleData.data;
            } else if (roleData.list && Array.isArray(roleData.list)) {
              roleData = roleData.list;
            } else if (roleData.roles && Array.isArray(roleData.roles)) {
              roleData = roleData.roles;
            }
          }
          
          if (Array.isArray(roleData) && roleData.length > 0) {
            console.log('📊 找到 ' + roleData.length + ' 個角色');
            console.log('📋 第一個角色的結構:', roleData[0]);
            
            this.availableRoles = roleData.map((role: any) => {
              const mappedRole = {
                role_id: role.role_id || role.id || '',
                role_name: role.role_name || role.name || '',
                description: role.description || '',
                is_owned: false
              };
              console.log('✓ 映射角色:', role, '→', mappedRole);
              return mappedRole;
            });
            
            console.log('✅ 角色列表已加載:', this.availableRoles.length + ' 個角色');
            console.log('📌 最終角色列表:', JSON.stringify(this.availableRoles));
          } else {
            console.warn('⚠️ 角色數據為空或不是數組');
            this.availableRoles = [];
          }
        } else {
          console.warn('⚠️ 響應中沒有 data 字段');
          this.availableRoles = [];
        }
        
        this.roleListLoading = false;
      },
      error: (err) => {
        console.error('❌ 載入角色列表失敗:', err);
        console.error('❌ 錯誤詳情:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          error: err.error
        });
        this.message.error('載入角色列表失敗: ' + (err.error?.message || err.message));
        this.availableRoles = [];
        this.roleListLoading = false;
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
        console.error('取得管理員列表失敗:', err);
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
        console.error('取得會員列表失敗:', err);
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
  adminRolesLoading = false; // 區分：加載管理員已分配的角色
  currentEditAdmin: IApiResponseAdmin | null = null;

  currentAdmin: IApiResponseAdmin = { id: this.tokenService.getCurrentAdminId() || '' } as IApiResponseAdmin;

  // 開啟編輯角色 Modal
  editAdminRoleModal(admin: IApiResponseAdmin): void {
    this.currentEditAdmin = admin;
    this.setOfCheckedRoleId.clear();
    
    // 如果可用角色列表還沒加載完，先加載
    if (this.availableRoles.length === 0) {
      console.log('🔄 角色列表為空，開始加載...');
      this.roleListLoading = true;
      this.loadAvailableRoles();
    } else {
      console.log('✅ 角色列表已存在，直接使用');
    }
    
    // 標記正在加載該管理員的現有角色
    this.adminRolesLoading = true;
    
    // 載入該管理員現有的角色
    this.securityService.getRolePermission(admin.id).subscribe({
      next: (res) => {
        if (res?.data && Array.isArray(res.data)) {
          // 篩選出 is_owned 為 true 的角色，並預先勾選
          const ownedRoles = res.data.filter((role: IApiResponseSecurityRole) => role.is_owned);
          
          console.log('👤 該管理員已擁有的角色:', ownedRoles);
          
          ownedRoles.forEach((role: IApiResponseSecurityRole) => {
            this.setOfCheckedRoleId.add(role.role_id);
          });
        }
        this.adminRolesLoading = false;
        // 無論角色列表是否加載完成，都先打開 modal，讓用戶看到加載狀態
        if (!this.editAdminRoleVisible) {
          this.editAdminRoleVisible = true;
        }
        this.refreshCheckedStatus();
      },
      error: (err) => {
        console.error('取得管理員角色失敗:', err);
        this.message.warning('無法載入現有角色，將顯示空白');
        this.adminRolesLoading = false;
        // 即使出錯也打開 modal
        if (!this.editAdminRoleVisible) {
          this.editAdminRoleVisible = true;
        }
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

    this.adminRolesLoading = true;
    this.securityService.assignRolesToAdmin(
      this.currentEditAdmin.id,
      selectedRoleIds,
      this.currentAdmin.id
    ).subscribe({
      next: (res) => {
        this.message.success('角色設定成功！');
        this.editAdminRoleVisible = false;
        this.setOfCheckedRoleId.clear();
        this.currentEditAdmin = null;
        this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
        this.adminRolesLoading = false;
      },
      error: (err) => {
        console.error('設定角色失敗:', err);
        this.message.error('角色設定失敗：' + (err.error?.message || '請稍後再試'));
        this.adminRolesLoading = false;
      }
    });
  }
  // 取消編輯
  cancelEditAdminRole(): void {
    this.editAdminRoleVisible = false;
    this.setOfCheckedRoleId.clear();
    this.currentEditAdmin = null;
  }

  // 快取管理員的角色名稱
  adminRolesCache: { [adminId: string]: string[] } = {};

  // 取得管理員的角色顯示名稱
  getAdminRoleNames(admin: IApiResponseAdmin): string {
    // 如果已經有快取，直接返回
    if (this.adminRolesCache[admin.id]) {
      return this.adminRolesCache[admin.id].join(', ') || '未設定角色';
    }

    // 如果沒有快取，異步加載
    this.securityService.getRolePermission(admin.id).subscribe({
      next: (res) => {
        if (res?.data && Array.isArray(res.data)) {
          const roleNames = res.data
            .filter((role: IApiResponseSecurityRole) => role.is_owned)
            .map((role: IApiResponseSecurityRole) => role.role_name);
          this.adminRolesCache[admin.id] = roleNames;
        } else {
          this.adminRolesCache[admin.id] = [];
        }
      },
      error: (err) => {
        console.error('取得管理員角色失敗:', err);
        this.adminRolesCache[admin.id] = [];
      }
    });

    return '載入中...';
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

  // 打開發送點數 Modal
  sendPointsToMember(member: IApiResponseMember): void {
    this.currentSendPointsMember = member;
    this.sendPointsValue = 0;
    this.sendPointsVisible = true;
  }

  // 取消發送點數
  cancelSendPoints(): void {
    this.sendPointsVisible = false;
    this.currentSendPointsMember = null;
    this.sendPointsValue = 0;
  }

  // 確認發送點數
  confirmSendPoints(): void {
    if (!this.currentSendPointsMember || !this.sendPointsValue || this.sendPointsValue <= 0) {
      this.message.warning('請輸入有效的點數數量');
      return;
    }

    this.sendPointsLoading = true;
    
    // 發送點數：贈送方不用帶入人員相關參數，只帶目標會員 ID 和點數
    const targetMemberId = this.currentSendPointsMember.student_id;
    const points = this.sendPointsValue;

    // 使用 addMemberpoints API，第一個參數設為空字符串（根據需求，贈送方不需要參數）
    this.pointService.addMemberpoints('', targetMemberId, points).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.message.success(`已成功發送 ${points} 點給 ${this.currentSendPointsMember?.name}`);
          this.sendPointsVisible = false;
          this.currentSendPointsMember = null;
          this.sendPointsValue = 0;
          
          // 刷新會員列表
          this.getPageMember(this.memberCurrentPage, this.memberPageSize);
        } else {
          this.message.error(res.message || '發送點數失敗');
        }
        this.sendPointsLoading = false;
      },
      error: (err) => {
        console.error('❌ 發送點數錯誤:', err);
        this.message.error('發送點數時發生錯誤');
        this.sendPointsLoading = false;
      }
    });
  }
  // 切換側邊欄
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}
