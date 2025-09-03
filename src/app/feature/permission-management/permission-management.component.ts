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
import { IApiResponseAdmin } from '../../share/service/model';
import { AdminService } from '../../share/service/service';

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
  adminService = inject(AdminService);

  adminList: IApiResponseAdmin[] = [];
  listOfCurrentPageData: readonly IApiResponseAdmin[] = [];
  checked = false;
  loading = false;
  indeterminate = false;
  setOfCheckedId = new Set<string>();

  currentPage = 1;
  pageSize = 5;
  total = 0;


  ngOnInit() {
    // Initialization logic can go here
    this.getPageAdmin(1, 5);
  }

  ngAfterViewInit() {
    // Logic that needs to run after the view has been initialized can go here
  }
  // 當前頁面數據變更時
  onCurrentPageDataChange(listOfCurrentPageData: readonly IApiResponseAdmin[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }
  // 刷新選取狀態
  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({ id }) => id !== undefined);
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }
  // 當前頁面數據變更時
  onPageIndexChange(pageIndex: number): void {
    this.currentPage = pageIndex;
    this.getPageAdmin(this.currentPage, this.pageSize);
  }
  // 一頁幾筆變更時，
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1; // 重置到第一頁
    this.getPageAdmin(this.currentPage, this.pageSize);
  }
  // 取得分頁 Admin
  getPageAdmin(page: number, pageSize: number): void {
    this.loading = true;
    this.adminService.getPageAdmins(page, pageSize).subscribe({
      next: (res) => {
        this.adminList = res.data.data || [];
        this.total = res.data.total || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

}
