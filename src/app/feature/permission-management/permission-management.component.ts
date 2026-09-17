import { Component, inject } from '@angular/core';
import { forkJoin, of, switchMap, map } from 'rxjs';
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
import { CommonHeaderComponent } from '../../share/common-header/common-header.component';


@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule, NzGridModule,
    NzRadioModule, NzModalModule, CommonModule, NzTableModule, NzDividerModule, NzCheckboxModule, NzTagModule,
    CommonHeaderComponent],
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
  /**
   * 獲取當前用戶名稱
   */
  get currentUsername(): string {
    return this.tokenService.getUsername();
  }
  adminList: IApiResponseAdmin[] = [];
  memberlist: IApiResponseMember[] = [];

  // 篩選模式下的完整資料快取（前端分頁用）
  private allAdminData: IApiResponseAdmin[] = [];
  private allMemberData: IApiResponseMember[] = [];

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

  // 發送點數相關
  sendPointsVisible = false;
  currentSendPointsMember: IApiResponseMember | null = null;
  sendPointsValue: number = 0;
  sendPointsLoading = false;

  // 綁定管理員相關
  bindAdminVisible = false;
  currentBindMember: IApiResponseMember | null = null;
  bindAdminLoading = false;

  // 管理人員搜尋篩選
  adminSearchName: string = '';
  adminFilterRole: string = '全部角色';

  // 會員搜尋篩選
  memberSearchId: string = '';
  memberFilterCard: string = '全部類別';

  // 卡片類別映射
  cardTypeMap: { [key: string]: string } = {
    'student': '學生卡',
    'staff': '教職員卡',
  };

  // 角色映射
  roleTypeMap: { [key: string]: string } = {
    'admin': '管理員',
    'manager': '學生'
  };

  ngOnInit() {
    this.loadAvailableRoles();
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  // ==================== 管理人員搜尋篩選功能 ====================

  // 管理人員搜尋
  searchAdmin(): void {
    this.adminCurrentPage = 1;
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }

  // 清除管理人員搜尋
  clearAdminSearch(): void {
    this.adminSearchName = '';
    this.adminFilterRole = '全部角色';
    this.adminCurrentPage = 1;
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }

  // 管理人員角色篩選變更
  onAdminRoleFilterChange(role: string): void {
    this.adminFilterRole = role;
    this.adminCurrentPage = 1;
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }

  // 取得管理人員角色篩選標籤
  getAdminRoleFilterLabel(role: string): string {
    return role;
  }

  // ==================== 會員搜尋篩選功能 ====================

  // 會員搜尋
  searchMember(): void {
    this.memberCurrentPage = 1;
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  // 清除會員搜尋
  clearMemberSearch(): void {
    this.memberSearchId = '';
    this.memberFilterCard = '全部類別';
    this.memberCurrentPage = 1;
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  // 會員卡片類別篩選變更
  onMemberCardFilterChange(card: string): void {
    this.memberFilterCard = card;
    this.memberCurrentPage = 1;
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  // 取得會員卡片類別篩選標籤
  getMemberCardFilterLabel(card: string): string {
    return card;
  }

  // 載入所有可用角色
  loadAvailableRoles(): void {
    this.roleListLoading = true;

    this.securityService.getAllRolesList().subscribe({
      next: (res) => {
        if (res?.data) {
          let roleData: any = res.data;

          if (!Array.isArray(roleData)) {
            if (roleData.data && Array.isArray(roleData.data)) {
              roleData = roleData.data;
            } else if (roleData.list && Array.isArray(roleData.list)) {
              roleData = roleData.list;
            } else if (roleData.roles && Array.isArray(roleData.roles)) {
              roleData = roleData.roles;
            }
          }

          if (Array.isArray(roleData) && roleData.length > 0) {
            this.availableRoles = roleData.map((role: any) => ({
              role_id: role.role_id || role.id || '',
              role_name: role.role_name || role.name || '',
              description: role.description || '',
              is_owned: false
            }));
          } else {
            this.availableRoles = [];
          }
        } else {
          this.availableRoles = [];
        }

        this.roleListLoading = false;
      },
      error: (err) => {
        console.error('載入角色列表失敗:', err);
        this.message.error('載入角色列表失敗');
        this.availableRoles = [];
        this.roleListLoading = false;
      }
    });
  }

  // Admin 頁面數據變更時
  onAdminPageIndexChange(pageIndex: number): void {
    this.adminCurrentPage = pageIndex;
    if (this.isAdminFiltering()) {
      this.applyAdminPage();
    } else {
      this.getPageAdmin(pageIndex, this.adminPageSize);
    }
  }

  // Admin 每頁筆數變更時
  onAdminPageSizeChange(pageSize: number): void {
    this.adminPageSize = pageSize;
    this.adminCurrentPage = 1;
    if (this.isAdminFiltering()) {
      this.applyAdminPage();
    } else {
      this.getPageAdmin(1, pageSize);
    }
  }

  // 平行拉完所有頁（per_page 固定用 20，符合後端限制）
  private fetchAllAdmins() {
    return this.adminService.getPageAdmins(1, 20).pipe(
      switchMap(first => {
        const firstData = first?.data?.data ?? [];
        const totalPages = first?.data?.total_pages ?? 1;
        if (totalPages <= 1) return of(firstData);
        const rest = Array.from({ length: totalPages - 1 }, (_, i) =>
          this.adminService.getPageAdmins(i + 2, 20)
        );
        return forkJoin(rest).pipe(
          map(pages => [...firstData, ...pages.flatMap(r => r?.data?.data ?? [])])
        );
      })
    );
  }

  private fetchAllMembers() {
    return this.memberService.getPageMembers(1, 20).pipe(
      switchMap(first => {
        const firstData = first?.data?.data ?? [];
        const totalPages = first?.data?.total_pages ?? 1;
        if (totalPages <= 1) return of(firstData);
        const rest = Array.from({ length: totalPages - 1 }, (_, i) =>
          this.memberService.getPageMembers(i + 2, 20)
        );
        return forkJoin(rest).pipe(
          map(pages => [...firstData, ...pages.flatMap(r => r?.data?.data ?? [])])
        );
      })
    );
  }

  private isAdminFiltering(): boolean {
    return !!(this.adminSearchName?.trim()) || this.adminFilterRole !== '全部角色';
  }

  private applyAdminPage(): void {
    const start = (this.adminCurrentPage - 1) * this.adminPageSize;
    this.adminList = this.allAdminData.slice(start, start + this.adminPageSize);
  }

  // 取得分頁 Admin
  getPageAdmin(page: number, pageSize: number): void {
    this.loading = true;

    if (this.isAdminFiltering()) {
      this.fetchAllAdmins().subscribe({
        next: (allData) => {
          let data = allData;
          if (this.adminSearchName?.trim()) {
            const lower = this.adminSearchName.toLowerCase().trim();
            data = data.filter(a => a.name.toLowerCase().includes(lower));
          }
          if (this.adminFilterRole !== '全部角色') {
            data = data.filter(a => this.getAdminRoleNames(a).includes(this.adminFilterRole));
          }
          this.allAdminData = data;
          this.totalAdmin = data.length;
          this.adminCurrentPage = 1;
          this.applyAdminPage();
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
    } else {
      // 無篩選：後端分頁
      this.adminService.getPageAdmins(page, pageSize).subscribe({
        next: (res) => {
          this.adminList = res?.data?.data ?? [];
          this.totalAdmin = res?.data?.total ?? this.adminList.length;
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
  }

  // Member 頁面數據變更時
  onMemberPageIndexChange(pageIndex: number): void {
    this.memberCurrentPage = pageIndex;
    if (this.isMemberFiltering()) {
      this.applyMemberPage();
    } else {
      this.getPageMember(pageIndex, this.memberPageSize);
    }
  }

  // Member 一頁幾筆變更時
  onMemberPageSizeChange(pageSize: number): void {
    this.memberPageSize = pageSize;
    this.memberCurrentPage = 1;
    if (this.isMemberFiltering()) {
      this.applyMemberPage();
    } else {
      this.getPageMember(1, pageSize);
    }
  }

  private isMemberFiltering(): boolean {
    return !!(this.memberSearchId?.trim()) || this.memberFilterCard !== '全部類別';
  }

  private applyMemberPage(): void {
    const start = (this.memberCurrentPage - 1) * this.memberPageSize;
    this.memberlist = this.allMemberData.slice(start, start + this.memberPageSize);
  }

  // 取得分頁 Member
  getPageMember(page: number, pageSize: number): void {
    this.loading = true;

    if (this.isMemberFiltering()) {
      this.fetchAllMembers().subscribe({
        next: (allData) => {
          let data = allData;
          if (this.memberSearchId?.trim()) {
            const searchId = this.memberSearchId.trim();
            data = data.filter(m => m.student_id.includes(searchId));
          }
          if (this.memberFilterCard !== '全部類別') {
            data = data.filter(m => {
              const cardType = this.cardTypeMap[m.title] || m.title;
              return cardType === this.memberFilterCard;
            });
          }
          this.allMemberData = data;
          this.totalMember = data.length;
          this.memberCurrentPage = 1;
          this.applyMemberPage();
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
    } else {
      // 無篩選：後端分頁
      this.memberService.getPageMembers(page, pageSize).subscribe({
        next: (res) => {
          this.memberlist = res?.data?.data ?? [];
          this.totalMember = res?.data?.total ?? this.memberlist.length;
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
    
    if (this.availableRoles.length === 0) {
      this.loadAvailableRoles();
    }
    
    // 標記正在加載該管理員的現有角色
    this.adminRolesLoading = true;
    
    // 載入該管理員現有的角色
    this.securityService.getRolePermission(admin.id).subscribe({
      next: (res) => {
        if (res?.data && Array.isArray(res.data)) {
          const ownedRoles = res.data.filter((role: IApiResponseSecurityRole) => role.is_owned);
          ownedRoles.forEach((role: IApiResponseSecurityRole) => {
            this.setOfCheckedRoleId.add(role.role_id);
          });
        }
        this.adminRolesLoading = false;
        // 無論角色列表是否加載完成,都先打開 modal，讓用戶看到加載狀態
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
        
        // 清除該管理員的角色快取
        if (this.currentEditAdmin) {
          delete this.adminRolesCache[this.currentEditAdmin.id];
        }
        
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
    // 使用 addMemberpoints API
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

  // 打開綁定管理員 Modal
  bindMemberToAdmin(member: IApiResponseMember): void {
    this.currentBindMember = member;
    this.bindAdminVisible = true;
  }

  // 取消綁定管理員
  cancelBindAdmin(): void {
    this.bindAdminVisible = false;
    this.currentBindMember = null;
  }
  
  // 確認綁定管理員
  confirmBindAdmin(): void {
    if (!this.currentBindMember) {
      this.message.warning('請選擇要綁定的會員');
      return;
    }
    // 檢查該會員是否已經是管理員
    if (this.currentBindMember.is_admin_bound) {
      this.message.warning('該會員已經是管理員');
      return;
    }
    this.bindAdminLoading = true;
    const targetMemberId = this.currentBindMember.id;
    this.adminService.bindMember(targetMemberId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.message.success(`已成功將 ${this.currentBindMember?.name} 綁定為管理員`);
          this.bindAdminVisible = false;
          this.currentBindMember = null;
          
          // 刷新管理員和會員列表
          this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
          this.getPageMember(this.memberCurrentPage, this.memberPageSize);
        } else {
          this.message.error(res.message || '綁定管理員失敗');
        }
        this.bindAdminLoading = false;
      },
      error: (err) => {
        console.error('❌ 綁定管理員錯誤:', err);
        this.message.error('綁定管理員時發生錯誤');
        this.bindAdminLoading = false;
      }
    });
  }

  // 切換側邊欄
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}