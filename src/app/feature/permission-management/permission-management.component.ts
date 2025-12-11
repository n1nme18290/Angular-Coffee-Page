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

import { SidebarService } from '../../share/service/sidebar.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { IApiResponseAdmin, IApiResponseMember, IApiResponseSecurityRole } from '../../share/service/model';
import { AdminService, MemberService, SecurityService } from '../../share/service/service';
import { NzTagModule } from 'ng-zorro-antd/tag';


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

  adminList: IApiResponseAdmin[] = [];
  listOfCurrentPageAdminData: readonly IApiResponseAdmin[] = [];
  memberlist: IApiResponseMember[] = [];
  listOfCurrentPageMemberData: readonly IApiResponseMember[] = [];

  checked = false;
  loading = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();

  adminCurrentPage = 1;
  adminPageSize = 5;
  totalAdmin = 0;
  memberCurrentPage = 1;
  memberPageSize = 5;
  totalMember = 0;


  ngOnInit() {
    // Initialization logic can go here
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
    this.getPageMember(this.memberCurrentPage, this.memberPageSize);
  }

  ngAfterViewInit() {
    // Logic that needs to run after the view has been initialized can go here
  }
  // Admin 頁面數據變更時
  onAdminPageIndexChange(pageIndex: number): void {
    this.adminCurrentPage = pageIndex;
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }
  // Admin 每頁筆數變更時
  onAdminPageSizeChange(pageSize: number): void {
    this.adminPageSize = pageSize;
    this.adminCurrentPage = 1; // 重置到第一頁
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }
  // 取得分頁 Admin（加入 debug 資訊）
  getPageAdmin(page: number, pageSize: number): void {
    this.loading = true;
    console.log(`🔄 載入管理員列表: 第 ${page} 頁，每頁 ${pageSize} 筆`);

    this.adminService.getPageAdmins(page, pageSize).subscribe({
      next: (res) => {
        console.log('✅ API 回應:', res);
        console.log(`   後端設定: per_page=${res?.data?.per_page}, 實際資料筆數=${res?.data?.data?.length}`);

        const data = res?.data?.data;
        if (Array.isArray(data)) {
          this.adminList = data;
        } else {
          console.warn('資料格式錯誤:', data);
          this.adminList = [];
        }

        this.totalAdmin = res?.data?.total ?? 0;

        console.log(`📊 目前顯示: ${this.adminList.length} 筆，總共: ${this.totalAdmin} 筆`);
        console.log(`   前端設定: pageSize=${this.adminPageSize}, 後端回傳: per_page=${res?.data?.per_page}`);

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ 取得管理員列表失敗', err);
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
  // Member 一頁幾筆變更時，
  onMemberPageSizeChange(pageSize: number): void {
    this.memberPageSize = pageSize;
    this.memberCurrentPage = 1; // 重置到第一頁
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
          console.warn('會員資料格式錯誤:', data);
          this.memberlist = [];
        }
        this.totalMember = res?.data?.total ?? 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ 取得會員列表失敗', err);
        this.memberlist = [];
        this.totalMember = 0;
        this.loading = false;
      }
    });
  }
  // 編輯一般管理員彈跳視窗
  editNormalAdminVisible = false;
  roleListLoading = false;
  roleList: readonly IApiResponseSecurityRole[] = [];
  currentEditAdmin: IApiResponseAdmin | null = null;

  editNormalAdminModal(admin: IApiResponseAdmin): void {
    // 儲存當前編輯的管理員
    this.currentEditAdmin = admin;
    // 清空之前的勾選
    this.setOfCheckedId.clear();
    // 載入所有角色列表
    this.roleListLoading = true;
    this.securityService.getAllRolesList().subscribe({
      next: (res) => {
        this.roleList = res.data.data || [];
        // 如果管理員已有權限，預先勾選（假設 admin.permissions 是權限 ID 陣列）
        if (admin.permission && Array.isArray(admin.permission)) {
          admin.permission.forEach((permissionId: string) => {
            this.setOfCheckedId.add(permissionId);
          });
          this.refreshCheckedStatus();
        }

        this.roleListLoading = false;
        this.editNormalAdminVisible = true;
      },
      error: (err) => {
        console.error('❌ 取得所有權限失敗', err);
        this.roleListLoading = false;
        alert('載入權限列表失敗，請稍後再試');
      }
    });
  }
  // 編輯一般管理員
  editNormalAdminhandleOk(): void {
    // 確認有選擇要編輯的管理員
    if (!this.currentEditAdmin) {
      console.error('❌ 沒有選擇要編輯的管理員');
      alert('請先選擇要編輯的管理員');
      return;
    }
    // 從 Set 轉換為陣列
    const selectedPermissions = Array.from(this.setOfCheckedId);
    // 如果沒有選擇任何權限，提示用戶確認
    if (selectedPermissions.length === 0) {
      const confirmRemoveAll = confirm('未選擇任何權限，這將移除該管理員的所有權限。確定要繼續嗎？');
      if (!confirmRemoveAll) {
        return;
      }
    }
    // 呼叫 API 設定權限
    // role_id 應該是管理員的 ID，permissions 是權限 ID 陣列
    // replace 參數：true = 替換所有權限，false = 新增權限
    const replace = true; // 根據需求決定是替換還是新增

    this.roleListLoading = true;
    this.securityService.setPermissions(
      this.currentEditAdmin.id,
      selectedPermissions,
      replace
    ).subscribe({
      next: (res) => {
        console.log('✅ 設定權限成功:', res);
        alert('權限設定成功！');

        // 關閉 Modal
        this.editNormalAdminVisible = false;

        // 清空選擇
        this.setOfCheckedId.clear();
        this.currentEditAdmin = null;

        // 重新載入管理員列表
        this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);

        this.roleListLoading = false;
      },
      error: (err) => {
        console.error('❌ 設定權限失敗:', err);
        alert('權限設定失敗：' + (err.error?.message || '請稍後再試'));
        this.roleListLoading = false;
      }
    });
  }
  // 新增：取消編輯，清理狀態
  editNormalAdminhandleCancel(): void {
    this.editNormalAdminVisible = false;
    this.setOfCheckedId.clear();
    this.currentEditAdmin = null;
    this.roleList = [];
  }
  // 新增：取得已選擇的權限資訊（用於顯示或除錯）
  getSelectedPermissionsInfo(): IApiResponseSecurityRole[] {
    return this.roleList.filter(role => this.setOfCheckedId.has(role.id));
  }
  // 發送點數給會員
  sendPoints(): void {
  }
  // 當前頁面數據變更時
  onCurrentPageDataChange(listOfCurrentPageData: readonly IApiResponseSecurityRole[]): void {
    this.roleList = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }
  // 單項選取狀態變更時
  onAllChecked(checked: boolean): void {
    this.roleList
      // 加角色本身已經有的權限會怎樣？怎麼辦？
      // .filter(({ disabled }) => !disabled)
      .forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }
  // 刷新選取狀態
  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageAdminData.filter(({ id }) => id !== undefined);
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }
  // 單項選取狀態變更時
  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }
  // 更新選取的ID集合
  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

}
