import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { SidebarService } from '../../share/service/sidebar.service';
import { DeviceService } from '../../share/service/service';
import { IApiResponseDevice } from '../../share/service/model';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TokenService } from '../../share/service/token.service';
import { PermissionService } from '../../share/service/permission.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { CommonHeaderComponent } from '../../share/common-header/common-header.component';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    CommonModule, NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule,
    NzDropDownModule, FormsModule, NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule,
    NzPageHeaderModule, NzDrawerModule, NzGridModule, NzRadioModule, NzModalModule, NzTableModule,
    NzDividerModule, NzCheckboxModule, NzCardModule, NzBadgeModule, NzSpinModule, NzTagModule, NzMenuModule,
    CommonHeaderComponent
  ],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})

export class EquipmentComponent {
  constructor() { }

  router = inject(Router);
  sidebarService = inject(SidebarService);
  deviceService = inject(DeviceService);
  tokenService = inject(TokenService);
  permissionService = inject(PermissionService);
  message = inject(NzMessageService);

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
  deleteDeviceVisible = false;
  updateDeviceVisible = false;
  cleanedDeviceVisible = false;
  deviceTotalCount: number = 0;
  deviceOnLineCount: number = 0;
  deviceFixCount: number = 0;
  deviceOffLineCount: number = 0;
  editingDeviceId: string | null = null;
  deviceName: string = '';
  deviceLocation: string = '';
  deviceStatus: string = '';
  machine_id: string = '';
  machine_ip: string = '';
  bean_level: number = 0;
  water_level: number = 0;

  // 搜尋和篩選相關
  searchName: string = '';
  filterStatus: string = '全部狀態';
  isMobile = false;

  /**
   * 獲取當前用戶名稱
   */
  get currentUsername(): string {
    return this.tokenService.getUsername();
  }

  /**
   * 檢查當前用戶是否有編輯權限
   * 只有 SuperAdmin 和 Admin 可以進行新增、編輯、刪除等操作
   * 維護人員和僅可檢視只能查看
   */
  get canEdit(): boolean {
    return this.permissionService.canEdit();
  }

  /**
   * 檢查當前用戶是否可以標記設備已清潔
   * SuperAdmin、Admin 和維護人員可以標記清潔狀態
   */
  get canMarkCleaned(): boolean {
    return this.permissionService.canMarkCleaned();
  }

  ngOnInit() {
    this.getPageDevices();
    this.getAllDevicesState();
    this.updateViewportState();
  }

  ngAfterViewInit() { }

  private updateViewportState(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewportState();
  }

  // 計算流水號的方法
  getSerialNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  // 搜尋設備
  searchDevices() {
    this.currentPage = 1;
    this.getPageDevices();
  }

  // 清除搜尋
  clearSearch() {
    this.searchName = '';
    this.filterStatus = '全部狀態';
    this.currentPage = 1;
    this.getPageDevices();
  }

  // 狀態篩選變更
  onStatusFilterChange(status: string) {
    this.filterStatus = status;
    this.currentPage = 1;
    this.getPageDevices();
  }


  // 新增設備Modal
  createDeviceModal() {
    this.createDeviceVisible = true;
  }

  // 新增設備
  createDevice() {
    this.deviceService.createDevice(this.deviceName, this.deviceLocation, this.deviceStatus, this.machine_id, this.machine_ip).subscribe({
      next: (res) => {
        this.createDeviceVisible = false;
        this.resetDeviceForm();
        this.message.success('設備新增成功');
        this.getPageDevices();
        this.getAllDevicesState();
      },
      error: (error) => {
        console.error('Error creating device:', error);
        this.message.error('設備新增失敗，請稍後再試');
      }
    });
  }
  // 刪除設備Modal
  deleteDeviceModal(device: IApiResponseDevice) {
    this.editingDeviceId = device.id;
    this.deleteDeviceVisible = true;
  }
  // 刪除設備
  deleteDevice() {
    if (!this.editingDeviceId) return;
    this.deviceService.deleteDevice(this.editingDeviceId).subscribe({
      next: (res) => {
        this.deleteDeviceVisible = false;
        this.message.success('設備刪除成功');
        this.getPageDevices();
        this.getAllDevicesState();
      },
      error: (error) => {
        console.error('Error deleting device:', error);
        this.message.error('設備刪除失敗，請稍後再試');
      }
    });
  }
  // 編輯設備Modal
  updateDeviceModal(device: IApiResponseDevice) {
    this.editingDeviceId = device.id;
    this.deviceName = device.name;
    this.deviceLocation = device.location;
    this.deviceStatus = device.status;
    this.machine_id = device.machine_id;
    this.machine_ip = device.machine_ip;
    this.updateDeviceVisible = true;
  }

  // 編輯設備
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
        this.updateDeviceVisible = false;
        this.resetDeviceForm();
        this.message.success('設備更新成功');
        this.getPageDevices();
        this.getAllDevicesState();
      },
      error: (error) => {
        console.error('Error updating device:', error);
        this.message.error('設備更新失敗，請稍後再試');
        this.resetDeviceForm();
      }
    });
  }

  // 重置設備表單
  resetDeviceForm() {
    this.deviceName = '';
    this.deviceLocation = '';
    this.deviceStatus = '';
    this.machine_id = '';
    this.machine_ip = '';
  }
  // 設備清潔按鈕Modal
  deviceCleanedModal(device: IApiResponseDevice) {
    this.cleanedDeviceVisible = true;
    this.editingDeviceId = device.id;
  }

  // 設備清潔狀態更新
  deviceCleaned() {
    const memberId = this.tokenService.getMemberId() || '';
    const deviceId = this.editingDeviceId || '';
    this.deviceService.deviceCleaned(deviceId, memberId).subscribe({
      next: (res) => {
        this.getPageDevices();
      },
      error: (error) => {
        console.error('Error updating device cleaned status:', error);
      },
      complete: () => {
        this.cleanedDeviceVisible = false;
      }
    });
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
  // onCurrentPageDataChange(listOfCurrentPageData: readonly IApiResponseDevice[]): void {
  //   this.listOfCurrentPageData = listOfCurrentPageData;
  //   this.refreshCheckedStatus();
  // }
  // 刷新選取狀態
  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({ id }) => id !== undefined);
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }
  // 單項選取狀態變更時
  // onItemChecked(id: string, checked: boolean): void {
  //   this.updateCheckedSet(id, checked);
  //   this.refreshCheckedStatus();
  // }
  // 全選狀態變更時
  // onAllChecked(checked: boolean): void {
  //   this.listOfCurrentPageData
  //     .filter(({ id }) => id !== undefined)
  //     .forEach(({ id }) => this.updateCheckedSet(id, checked));
  //   this.refreshCheckedStatus();
  // }
  // 發送請求，後續要修改為有用的功能或是拿掉
  // sendRequest(): void {
  //   this.loading = true;
  //   const requestData = this.devicesList.filter(data => this.setOfCheckedId.has(String(data.id)));
  //   // console.log('Selected data:', requestData);
  //   setTimeout(() => {
  //     this.setOfCheckedId.clear();
  //     this.refreshCheckedStatus();
  //     this.loading = false;
  //   }, 1000);
  // }
  // 當前頁面數據變更時
  onPageIndexChange(pageIndex: number): void {
    this.currentPage = pageIndex;
    this.getPageDevices();
  }

  // 一頁幾筆變更時
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getPageDevices();
  }

  // 取得所有設備狀態
  getAllDevicesState() {
    this.loading = true;
    this.deviceService.getAllDeviceState().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.deviceTotalCount = res.data.total || 0;
          this.deviceOnLineCount = res.data.online || 0;
          this.deviceFixCount = res.data.maintenance || 0;
          this.deviceOffLineCount = res.data.offline || 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching all devices:', error);
        this.deviceOnLineCount = 0;
        this.deviceFixCount = 0;
        this.deviceOffLineCount = 0;
        this.loading = false;
      }
    });
  }

  // 取得分頁設備
  getPageDevices() {
    this.loading = true;

    // 準備篩選參數 (只在有值時才傳入，避免傳空字串)
    const deviceName = this.searchName && this.searchName.trim() ? this.searchName.trim() : undefined;
    const deviceLocation = undefined; // 目前沒有使用地點篩選
    const state = this.filterStatus !== '全部狀態' ? this.filterStatus : undefined;

    this.deviceService.getPageDevice(this.currentPage, this.pageSize, deviceName, deviceLocation, state).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.devicesList = res.data.data || [];
          this.total = res.data.total || 0;
          // 清除當前頁的選取狀態
          // this.setOfCheckedId.clear();
          // this.refreshCheckedStatus();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching page devices:', error);
        this.devicesList = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  // 表單驗證
  isFormValid(): boolean {
    return !!(
      this.deviceName?.trim() &&
      this.deviceLocation?.trim() &&
      this.deviceStatus?.trim() &&
      this.machine_id?.trim() &&
      this.machine_ip?.trim()
    );
  }

  // 取得狀態顏色
  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      '運作中': 'success',
      '維護中': 'warning',
      '離線': 'error',
      '正常': 'success',
      '異常': 'error'
    };
    return statusMap[status] || 'default';
  }

  // 取得狀態圖示
  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      '運作中': 'check-circle',
      '維護中': 'tool',
      '離線': 'close-circle',
      '正常': 'check-circle',
      '異常': 'warning'
    };
    return iconMap[status] || 'info-circle';
  }

  // 統計方法
  getTotalDeviceCount(): number {
    return this.deviceTotalCount;
  }
  getActiveDeviceCount(): number {
    return this.deviceOnLineCount;
  }

  getMaintenanceDeviceCount(): number {
    return this.deviceFixCount;
  }

  getOfflineDeviceCount(): number {
    return this.deviceOffLineCount;
  }

  // 切換側邊欄展開/收起狀態
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

  // 展開控制
  expandSet = new Set<string>();

  // 展開狀態變更處理
  onExpandChange(id: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
  //清除按鈕邏輯
  clearEqipmentSearch(): void {
  this.searchName = '';
  this.filterStatus = '全部狀態';
  this.currentPage = 1;
  this.getPageDevices();
}
}