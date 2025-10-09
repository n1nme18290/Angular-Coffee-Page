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
import { IApiResponseAdmin, IApiResponseMember } from '../../share/service/model';
import { AdminService, MemberService } from '../../share/service/service';

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [CommonModule, NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule, NzGridModule,
    NzRadioModule, NzModalModule, CommonModule, NzTableModule, NzDividerModule, NzCheckboxModule, NzGridModule],
  templateUrl: './permission-management.component.html',
  styleUrl: './permission-management.component.scss'
})
export class PermissionManagementComponent {
  constructor() { }

  router = inject(Router);
  sidebarService = inject(SidebarService);
  memberService = inject(MemberService);
  adminService = inject(AdminService);

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
    this.getPageAdmin(1, 5);
    this.getPageMember(1, 5);
  }

  ngAfterViewInit() {
    // Logic that needs to run after the view has been initialized can go here
  }

  // Admin 頁面數據變更時
  onCurrentPageAdminDataChange(listOfCurrentPageData: readonly IApiResponseAdmin[]): void {
    this.listOfCurrentPageAdminData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }
  // Admin 頁面數據變更時
  onAdminPageIndexChange(pageIndex: number): void {
    this.adminCurrentPage = pageIndex;
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }
  // Admin 一頁幾筆變更時
  onAdminPageSizeChange(pageSize: number): void {
    this.adminPageSize = pageSize;
    this.adminCurrentPage = 1; // 重置到第一頁
    this.getPageAdmin(this.adminCurrentPage, this.adminPageSize);
  }
  // 取得分頁 Admin
  getPageAdmin(page: number, pageSize: number): void {
    this.loading = true;
    this.adminService.getPageAdmins(page, pageSize).subscribe({
      next: (res) => {
        this.adminList = res.data.data || [];
        this.totalAdmin = res.data.total || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Member 頁面數據變更時
  onCurrentPageMemberDataChange(listOfCurrentPageData: readonly IApiResponseMember[]): void {
    this.listOfCurrentPageMemberData = listOfCurrentPageData;
    this.refreshCheckedStatus();
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
        this.memberlist = res.data.data || [];
        this.totalMember = res.data.total || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  // 編輯一般管理員
  editNormalAdmin(): void {
  }
  // 發送點數給會員
  sendPoints(): void {
  }
  
  // 刷新選取狀態
  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageAdminData.filter(({ id }) => id !== undefined);
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

}
