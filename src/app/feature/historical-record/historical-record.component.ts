import { Component ,inject} from '@angular/core';
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
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { PointService } from '../../share/service/service';
import { NzTableModule} from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { SidebarService } from '../../share/service/sidebar.service';
import { LogService } from '../../share/service/service';
import { IApiResponseGetPageDeviceLog, IApiResponsePoints, IApiResponsePointsHistory } from '../../share/service/model';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';


@Component({
  selector: 'app-historical-record',
  standalone: true,
  imports: [NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule,
    NzRadioModule, NzModalModule, CommonModule,NzSpinModule,
    NzTableModule, NzDividerModule, NzCheckboxModule, NzGridModule, NzCollapseModule, NzDatePickerModule],
  templateUrl: './historical-record.component.html',
  styleUrl: './historical-record.component.scss'
})
export class HistoricalRecordComponent {

  // 注入服務
  constructor(
    public logService: LogService) { }

//==================================== 共用服務 =====================================================
  router = inject(Router);
  sidebarService = inject(SidebarService); // 側邊欄控制
  pointService = inject(PointService); // 點數服務

// =================================== Tab切換 ===================================
  selectedIndex = 0;
  Title01 = '使用者使用紀錄';
  Title02 = '設備使用紀錄';
  Title03 = '會員點數資訊';

  // 取得目前標題
  getCurrentTitle(): string {
    switch (this.selectedIndex) {
      case 0: return this.Title01;
      case 1: return this.Title02;
      case 2: return this.Title03;
      default: return '';
    }
  }
  
  ngOnInit() {
    // 使用各自的 page/index 初始值
    this.getPagePoints();
    this.getPagePointsHistory();
    this.getPageDeviceLog();
  }

  // 控制側邊欄折疊
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

  // 計算流水號
  getSerialNumber(index: number): number {
    let page: number;
    let size: number;
    
    switch (this.selectedIndex) {
      case 0: // 使用者使用紀錄
        page = this.historyPageIndex;
        size = this.historyPageSize;
        break;
      case 1: // 設備使用紀錄
        page = this.devicePageIndex;
        size = this.devicePageSize;
        break;
      case 2: // 會員點數資訊
        page = this.currentPage;
        size = this.pageSize;
        break;
      default:
        page = 1;
        size = 5;
    }
    
    return (page - 1) * size + index + 1;
  }
 

//==================================== 使用者使用紀錄 =====================================================
  // 使用者使用紀錄相關屬性
  pointsHistoryList: IApiResponsePointsHistory[] = [];
  historyLoading = false;
  historyChecked = false;
  historyIndeterminate = false;
  historyListOfCurrentPageData: readonly IApiResponsePointsHistory[] = [];
  historySetOfCheckedId = new Set<string>();

  // 使用者使用紀錄分頁屬性
  historyPageIndex = 1;
  historyPageSize = 5;
  historyTotal = 0;

  // 使用者使用紀錄搜尋篩選
  historySearchName: string = '';
  historyFilterType: string = '全部類型';
  
  // 使用者分頁事件
  onHistoryPageIndexChange(pageIndex: number): void {
    this.historyPageIndex = pageIndex;
    this.getPagePointsHistory();
  }
  
  onHistoryPageSizeChange(pageSize: number): void {
    this.historyPageSize = pageSize;
    this.historyPageIndex = 1;
    this.getPagePointsHistory();
  }

  // 使用者搜尋
  searchHistory(): void {
    this.historyPageIndex = 1;
    this.getPagePointsHistory();
  }

  // 清除使用者搜尋
  clearHistorySearch(): void {
    this.historySearchName = '';
    this.historyFilterType = '全部類型';
    this.historyPageIndex = 1;
    this.getPagePointsHistory();
  }

  // 使用者類型篩選變更
  onHistoryTypeFilterChange(type: string): void {
    this.historyFilterType = type;
    this.historyPageIndex = 1;
    this.getPagePointsHistory();
  }

  // 使用者使用紀錄 - 當前頁面數據變更時
  onHistoryCurrentPageDataChange(listOfCurrentPageData: readonly IApiResponsePointsHistory[]): void {
    this.historyListOfCurrentPageData = listOfCurrentPageData;
    this.refreshHistoryCheckedStatus();
  }
  
  // 使用者使用紀錄更新選取的ID集合
  updateHistoryCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.historySetOfCheckedId.add(id);
    } else {
      this.historySetOfCheckedId.delete(id);
    }
  }
  
  // 取得使用者使用紀錄
  getPagePointsHistory(): void {
    this.historyLoading = true;
    
    // 準備搜尋條件
    const name = this.historySearchName && this.historySearchName.trim() ? this.historySearchName.trim() : undefined;
    const type = this.historyFilterType !== '全部類型' ? this.historyFilterType : undefined;
    
    this.logService.searchPointLog(this.historyPageIndex, this.historyPageSize, name, type).subscribe({
      next: (res) => {
        console.log('Points History API Response:', res);
        if (res && res.data) {
          this.pointsHistoryList = res.data.data || [];
          this.historyTotal = res.data.total || 0;
          this.historySetOfCheckedId.clear();
          this.refreshHistoryCheckedStatus();
        }
        this.historyLoading = false;
      },
      error: (error) => {
        console.error('Error fetching points history:', error);
        this.pointsHistoryList = [];
        this.historyTotal = 0;
        this.historyLoading = false;
      }
    });
  }

  // 單項選取狀態變更時
  onHistoryItemChecked(id: string, checked: boolean): void {
    this.updateHistoryCheckedSet(id, checked);
    this.refreshHistoryCheckedStatus();
  }
  
  // 刷新選取狀態
  refreshHistoryCheckedStatus(): void {
    const listOfEnabledData = this.historyListOfCurrentPageData;
    this.historyChecked = listOfEnabledData.every(({ id }) => this.historySetOfCheckedId.has(id));
    this.historyIndeterminate = listOfEnabledData.some(({ id }) => this.historySetOfCheckedId.has(id)) && !this.historyChecked;
  }

//==================================== 設備使用紀錄 =====================================================
  // 設備操作紀錄相關屬性
  deviceLogList: IApiResponseGetPageDeviceLog[] = [];
  deviceLogLoading = false;
  deviceLogChecked = false;
  deviceLogIndeterminate = false;
  
  // 設備分頁屬性
  devicePageIndex = 1;
  devicePageSize = 5;
  deviceTotal = 0;
  
  // 設備搜尋篩選 (改為搜尋操作內容)
  deviceSearchOperation: string = ''; 
  deviceFilterType: string = '全部類型';

  // 設備分頁事件
  onDevicePageIndexChange(pageIndex: number): void {
    this.devicePageIndex = pageIndex;
    this.getPageDeviceLog();
  }
  
  onDevicePageSizeChange(pageSize: number): void {
    this.devicePageSize = pageSize;
    this.devicePageIndex = 1;
    this.getPageDeviceLog();
  }

  // 設備搜尋
  searchDevice(): void {
    this.devicePageIndex = 1;
    this.getPageDeviceLog();
  }

  // 清除設備搜尋
  clearDeviceSearch(): void {
    this.deviceSearchOperation = '';
    this.deviceFilterType = '全部類型';
    this.devicePageIndex = 1;
    this.getPageDeviceLog();
  }

  // 設備類型篩選變更
  onDeviceTypeFilterChange(type: string): void {
    this.deviceFilterType = type;
    this.devicePageIndex = 1;
    this.getPageDeviceLog();
  }

  // 取得設備操作紀錄 (使用前端篩選操作內容)
  getPageDeviceLog(): void {
    this.deviceLogLoading = true;
    

    const operationType = this.deviceFilterType !== '全部類型' ? this.deviceFilterType : null;
    
    this.logService.getPageDeviceLog(
      this.devicePageIndex, 
      this.devicePageSize, 
      null,              // device_name 暫不使用
      operationType,     // type 參數
      null               // sortOrder 參數
    ).subscribe({
      next: (res) => {
        console.log('Device Log API Response:', res);
        if (res && res.data) {
          let dataList = res.data.data || [];
          
          // 前端篩選：操作內容搜尋
          if (this.deviceSearchOperation && this.deviceSearchOperation.trim()) {
            const searchLower = this.deviceSearchOperation.toLowerCase().trim();
            dataList = dataList.filter(item => 
              item.operation && item.operation.toLowerCase().includes(searchLower)
            );
          }
          
          this.deviceLogList = dataList;
          this.deviceTotal = res.data.total || 0;
        }
        this.deviceLogLoading = false;
      },
      error: (error) => {
        console.error('Error fetching device log:', error);
        this.deviceLogList = [];
        this.deviceTotal = 0;
        this.deviceLogLoading = false;
      }
    });
  }

//================================ 會員點數資訊 =================================================
  // 點數資訊相關屬性
  pointsList: IApiResponsePoints[] = [];
  checked = false;
  loading = false;
  indeterminate = false;
  listOfCurrentPageData: readonly IApiResponsePoints[] = [];
  setOfCheckedId = new Set<string>();
  
  // 點數資訊分頁屬性
  currentPage = 1;
  pageSize = 5;
  total = 0;
  
  // 點數資訊搜尋篩選
  pointsSearchName: string = '';
  
  // 點數使用紀錄日期篩選
  pointsFilterVisible = false;
  pointsSelectedDate: Date | null = null;
  pointsFilteredDate: string | null = null;
  
  // 點數分頁事件
  onPageIndexChange(pageIndex: number): void {
    this.currentPage = pageIndex;
    this.getPagePoints();
  }
  
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.getPagePoints();
  }

  // 點數搜尋
  searchPoints(): void {
    this.currentPage = 1;
    this.getPagePoints();
  }

  // 清除點數搜尋
  clearPointsSearch(): void {
    this.pointsSearchName = '';
    this.currentPage = 1;
    this.getPagePoints();
  }

  // 當前頁面數據變更時
  onCurrentPageDataChange(listOfCurrentPageData: readonly IApiResponsePoints[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }
  
  // 刷新選取狀態
  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData.filter(({ balance }) => balance >= 0);
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate = listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  // 取得點數資訊
  getPagePoints() {
    this.loading = true;
    this.pointService.getPagePoints(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        if (res && res.data) {
          let dataList = res.data.data || [];
          
          // 前端篩選：名稱搜尋
          if (this.pointsSearchName && this.pointsSearchName.trim()) {
            const searchLower = this.pointsSearchName.toLowerCase().trim();
            dataList = dataList.filter(item => 
              item.member_name.toLowerCase().includes(searchLower)
            );
          }
          
          // 前端篩選:日期篩選
          if (this.pointsFilteredDate) {
            dataList = dataList.filter((item: IApiResponsePoints) => {
              const itemDate = item.updated_at.split(' ')[0];
              return itemDate === this.pointsFilteredDate;
            });
          }
          
          this.pointsList = dataList;
          this.total = dataList.length;
          this.setOfCheckedId.clear();
          this.refreshCheckedStatus();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching page points:', error);
        this.pointsList = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }
  
  filterPointsByDate(): void {
    if (this.pointsSelectedDate) {
      this.pointsFilteredDate = this.pointsSelectedDate.toLocaleDateString('en-CA');
      this.currentPage = 1;
      this.getPagePoints();
    }
    this.pointsFilterVisible = false;
  }

  resetPointsDate(): void {
    this.pointsSelectedDate = null;
    this.pointsFilteredDate = null;
    this.currentPage = 1;
    this.getPagePoints();
    this.pointsFilterVisible = false;
  }
}