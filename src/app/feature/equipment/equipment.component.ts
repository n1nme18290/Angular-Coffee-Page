import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // 新增這個

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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { SidebarService } from '../../share/service/sidebar.service';
import { DeviceService } from '../../share/service/service';
import { IApiResponseDevice } from '../../share/service/model';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { TokenService } from '../../share/service/token.service';
@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    CommonModule, // 新增 CommonModule
    NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule, NzGridModule,
    NzRadioModule, NzModalModule, CommonModule, NzTableModule, NzDividerModule, NzCheckboxModule],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent {
  constructor() { }

  router = inject(Router);
  sidebarService = inject(SidebarService);
  deviceService = inject(DeviceService);
  tokenService = inject(TokenService);

  devicesList: IApiResponseDevice[] = [];
  checked = false;
  loading = false;
  indeterminate = false;
  listOfCurrentPageData: readonly IApiResponseDevice[] = [];
  setOfCheckedId = new Set<string>();

  currentPage = 1;
  pageSize = 5;
  total = 0;


  createDeviceVisible = false;
  updateDeviceVisible = false;
  editingDeviceId: string | null = null;
  deviceName: string = '';
  deviceLocation: string = '';
  deviceStatus: string = '';
  machine_id: string = '';
  machine_ip: string = '';
  bean_level: number = 0;
  water_level: number = 0;

  ngOnInit() {
    // Initialization logic can go here
    this.getPagePoints(1, 5);
    if (this.tokenService.hasToken()) {
      console.log('用戶已登入');
    } else {
      console.log('用戶未登入');
    }
    // 監聽 token 變化
    this.tokenService.token$.subscribe(token => {
      if (token) {
        console.log('用戶已登入');
      } else {
        console.log('用戶已登出');
      }
    });
  }

  ngAfterViewInit() {
    // Logic that needs to run after the view has been initialized can go here
  }

  // 計算流水號的方法
  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }
  createDeviceModal() {
    this.createDeviceVisible = true;
  }
  createDevice() {
    this.deviceService.createDevice(this.deviceName, this.deviceLocation, this.deviceStatus, this.machine_id, this.machine_ip).subscribe({
      next: (res) => {
        // Handle successful creation
        this.createDeviceVisible = false;
        this.resetDeviceForm();
        this.getPagePoints(this.currentPage, this.pageSize);
      },
      error: (error) => {
        // Handle error
        console.error('Error creating device:', error);
      }
    });
  }
  updateDeviceModal(device: IApiResponseDevice) {
    this.editingDeviceId = device.id;
    this.deviceName = device.name;
    this.deviceLocation = device.location;
    this.deviceStatus = device.status;
    this.machine_id = device.machine_id;
    this.machine_ip = device.machine_ip;
    this.updateDeviceVisible = true;
  }
  updateDevice() {
    if (!this.editingDeviceId) return;
    this.deviceService.updateDevice(
      this.editingDeviceId,
      this.deviceName,
      this.deviceLocation,
      this.deviceStatus,
      this.machine_id,
      this.machine_ip
    ).subscribe({
      next: (res) => {
        // Handle successful update
        this.updateDeviceVisible = false;
        this.resetDeviceForm();
        this.getPagePoints(this.currentPage, this.pageSize);
      },
      error: (error) => {
        // Handle error
        this.resetDeviceForm();
        console.error('Error updating device:', error);
      }
    });
  }
  resetDeviceForm() {
    this.deviceName = '';
    this.deviceLocation = '';
    this.deviceStatus = '';
    this.machine_id = '';
    this.machine_ip = '';
  }
  // 更新選取的ID集合
  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }
  // 當前頁面數據變更時
  onCurrentPageDataChange(listOfCurrentPageData: readonly IApiResponseDevice[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }
  // 刷新選取狀態
  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({ id }) => id !== undefined);
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }
  // 單項選取狀態變更時
  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }
  // 全選狀態變更時
  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .filter(({ id }) => id !== undefined)
      .forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }
  // 發送請求，後續要修改為有用的功能或是拿掉
  sendRequest(): void {
    this.loading = true;
    const requestData = this.devicesList.filter(data => this.setOfCheckedId.has(String(data.id)));
    // console.log('Selected data:', requestData);
    setTimeout(() => {
      this.setOfCheckedId.clear();
      this.refreshCheckedStatus();
      this.loading = false;
    }, 1000);
  }
  // 當前頁面數據變更時
  onPageIndexChange(pageIndex: number): void {
    this.currentPage = pageIndex;
    this.getPagePoints(this.currentPage, this.pageSize);
  }
  // 一頁幾筆變更時，
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1; // 重置到第一頁
    this.getPagePoints(this.currentPage, this.pageSize);
  }
  // 取得分頁設備
  getPagePoints(page: number, perpage: number) {
    this.loading = true;
    this.deviceService.getPageDevice(page, perpage).subscribe({
      next: (res) => {
        // console.log('API Response:', res);
        if (res && res.data) {
          this.devicesList = res.data.data || [];
          this.total = res.data.total || 0;
          // 清除當前頁的選取狀態
          this.setOfCheckedId.clear();
          this.refreshCheckedStatus();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching page points:', error);
        this.devicesList = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }
  // 切換側邊欄展開/收起狀態
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

}