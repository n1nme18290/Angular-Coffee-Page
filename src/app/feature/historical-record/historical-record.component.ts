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
    NzRadioModule, NzModalModule, CommonModule,
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
    //點數
    this.getPagePoints(this.currentPage, this.pageSize);
    //使用者使用
    this.getPagePointsHistory(this.historyPageIndex, this.historyPageSize);
    //設備
    this.getPageDeviceLog(this.devicePageIndex, this.devicePageSize);
  }

  // 控制側邊欄折疊
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

  // 計算流水號
  getSerialNumber(index: number): number {
    const isDeviceTab = this.selectedIndex === 1;
    const page = isDeviceTab ? this.devicePageIndex : this.currentPage;
    const size = isDeviceTab ? this.devicePageSize : this.pageSize;
    return (page - 1) * size + index + 1;
  }
 

//==================================== 使用者使用紀錄 =====================================================
  // 使用者使用紀錄相關屬性
  pointsHistoryList: IApiResponsePointsHistory[] = [];//使用者歷史紀錄列表
  historyLoading = false;
  historyChecked = false;//全選狀態
  historyIndeterminate = false;//半選狀態
  historyListOfCurrentPageData: readonly IApiResponsePointsHistory[] = [];
  historySetOfCheckedId = new Set<string>();

  // 使用者使用紀錄分頁屬性
  historyPageIndex = 1; //分頁索引
  historyPageSize = 5; //每頁筆數
  historyTotal = 0; //總筆數

  // 使用者使用紀錄日期篩選
  historyFilterVisible = false;
  historySelectedDate: Date | null = null;
  historyFilteredDate: string | null = null;
  
  // 使用者分頁事件
  onHistoryPageIndexChange(pageIndex: number): void {
    this.historyPageIndex = pageIndex;
    this.getPagePointsHistory(this.historyPageIndex, this.historyPageSize);
  }
  onHistoryPageSizeChange(pageSize: number): void {
    this.historyPageSize = pageSize;
    this.historyPageIndex = 1;
    this.getPagePointsHistory(this.historyPageIndex, this.historyPageSize);
  }

  // 使用者使用紀錄 - 當前頁面歷史紀錄數據變更時
  onHistoryCurrentPageDataChange(listOfCurrentPageData: readonly IApiResponsePointsHistory[]): void {
    this.historyListOfCurrentPageData = listOfCurrentPageData;
    this.refreshHistoryCheckedStatus();
  }
  // 使用者使用紀錄更新歷史紀錄選取的ID集合
  updateHistoryCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.historySetOfCheckedId.add(id);
    } else {
      this.historySetOfCheckedId.delete(id);
    }
  }
  
  //使用者使用紀錄日期
  getPagePointsHistory(page: number, perpage: number): void {
    this.historyLoading = true;
    this.logService.getPageLog(page, perpage).subscribe({
      next: (res) => {
        console.log('Points History API Response:', res);
        if (res && res.data) {
          let dataList = res.data.data || [];
          
          // 如果有日期篩選,進行前端過濾
          if (this.historyFilteredDate) {
            dataList = dataList.filter((item: IApiResponsePointsHistory) => {
              const itemDate = item.created_at.split(' ')[0];
              return itemDate === this.historyFilteredDate;
            });
          }
          this.pointsHistoryList = dataList;
          this.historyTotal = res.data.total || 0;
          // 清除選取狀態
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
  filterHistoryByDate(): void { //日期篩選
    if (this.historySelectedDate) {
      this.historyFilteredDate = this.historySelectedDate.toLocaleDateString('en-CA');
      this.historyPageIndex = 1;
      this.getPagePointsHistory(this.historyPageIndex, this.historyPageSize);
    }
    this.historyFilterVisible = false;
  }

  resetHistoryDate(): void { //重製日期篩選
    this.historySelectedDate = null;
    this.historyFilteredDate = null;
    this.historyPageIndex = 1;
    this.getPagePointsHistory(this.historyPageIndex, this.historyPageSize);
    this.historyFilterVisible = false;
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
  // 設備使用紀錄日期篩選
  deviceFilterVisible = false;
  deviceSelectedDate: Date | null = null;
  deviceFilteredDate: string | null = null;

  // 設備分頁事件
  onDevicePageIndexChange(pageIndex: number): void {
    this.devicePageIndex = pageIndex;
    this.getPageDeviceLog(this.devicePageIndex, this.devicePageSize);
  }
  onDevicePageSizeChange(pageSize: number): void {
    this.devicePageSize = pageSize;
    this.devicePageIndex = 1;
    this.getPageDeviceLog(this.devicePageIndex, this.devicePageSize);
  }

// 設備操作紀錄日期
  getPageDeviceLog(page: number, perpage: number): void {
    this.deviceLogLoading = true;
    this.logService.getPageDeviceLog(page, perpage).subscribe({
      next: (res) => {
        console.log('Device Log API Response:', res);
        if (res && res.data) {
          let dataList = res.data.data || [];
          
          // 如果有日期篩選,進行前端過濾
          if (this.deviceFilteredDate) {
            dataList = dataList.filter((item: IApiResponseGetPageDeviceLog) => {
              const itemDate = item.created_at.split(' ')[0];
              return itemDate === this.deviceFilteredDate;
            });
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
  filterDeviceByDate(): void {
    if (this.deviceSelectedDate) {
      this.deviceFilteredDate = this.deviceSelectedDate.toLocaleDateString('en-CA');
      this.devicePageIndex = 1;
      this.getPageDeviceLog(this.devicePageIndex, this.devicePageSize);
    }
    this.deviceFilterVisible = false;
  }

  resetDeviceDate(): void {
    this.deviceSelectedDate = null;
    this.deviceFilteredDate = null;
    this.devicePageIndex = 1;
    this.getPageDeviceLog(this.devicePageIndex, this.devicePageSize);
    this.deviceFilterVisible = false;
  }

//================================ 會員點數資訊 =================================================
   // 點數資訊相關屬性
  pointsList: IApiResponsePoints[] = [];
  checked = false;
  loading = false;
  indeterminate = false;
  listOfCurrentPageData: readonly IApiResponsePoints[] = [];
  setOfCheckedId = new Set<string>();
  //點數資訊分頁屬性
  currentPage = 1;
  pageSize = 5;
  total = 0;
  // 點數使用紀錄日期篩選
  pointsFilterVisible = false;
  pointsSelectedDate: Date | null = null;
  pointsFilteredDate: string | null = null;
  
   // 點數分頁事件
  onPageIndexChange(pageIndex: number): void {
    this.currentPage = pageIndex;
    this.getPagePoints(this.currentPage, this.pageSize);
  }
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1; // 重置到第一頁
    this.getPagePoints(this.currentPage, this.pageSize);
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

  //點數使用紀錄日期
  getPagePoints(page: number, perpage: number) {
    this.loading = true;
    this.pointService.getPagePoints(page, perpage).subscribe({
      next: (res) => {
        // console.log('API Response:', res);
        if (res && res.data) {
          let dataList = res.data.data || [];
          
          // 如果有日期篩選,進行前端過濾
          if (this.pointsFilteredDate) {
            dataList = dataList.filter((item: IApiResponsePoints) => {
              const itemDate = item.updated_at.split(' ')[0];
              return itemDate === this.pointsFilteredDate;
            });
          }
          
          this.pointsList = dataList;
          this.total = res.data.total || 0;
          // 清除當前頁的選取狀態
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
      this.getPagePoints(this.currentPage, this.pageSize);
    }
    this.pointsFilterVisible = false;
  }

  resetPointsDate(): void {
    this.pointsSelectedDate = null;
    this.pointsFilteredDate = null;
    this.currentPage = 1;
    this.getPagePoints(this.currentPage, this.pageSize);
    this.pointsFilterVisible = false;
  }
}


//==================================== 目前無用到資訊 =====================================================

  // // 查詢指定會員的點數異動紀錄
  // getMemberPointsHistory(memberId: string) {
  //   this.logService.getMemberLog(memberId, 1, 10).subscribe({
  //     next: (response) => {
  //       if (response.isSuccess) {
  //         console.log('Member Points History:', response.data);
  //         return response.data;
  //       } else {
  //         console.error('Error fetching member points history:', response.message);
  //         return response.message;
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error fetching member points history:', error);
  //     }
  //   });
  // }
  
  // 點數使用紀錄
  // 更新選取的ID集合
  // updateCheckedSet(id: string, checked: boolean): void {
  //   if (checked) {
  //     this.setOfCheckedId.add(id);
  //   } else {
  //     this.setOfCheckedId.delete(id);
  //   }
  // }


  // // 單項選取狀態變更時
  // onItemChecked(id: string, checked: boolean): void {
  //   this.updateCheckedSet(id, checked);
  //   this.refreshCheckedStatus();
  // }

  // // 全選狀態變更時
  // onAllChecked(checked: boolean): void {
  //   this.listOfCurrentPageData
  //     .filter(({ balance }) => balance >= 0)
  //     .forEach(({ id }) => this.updateCheckedSet(id, checked));
  //   this.refreshCheckedStatus();
  // }


  // // 發送請求,後續要修改為有用的功能或是拿掉
  // sendRequest(): void {
  //   this.loading = true;
  //   const requestData = this.pointsList.filter(data => this.setOfCheckedId.has(String(data.id)));
  //   // console.log('Selected data:', requestData);
  //   setTimeout(() => {
  //     this.setOfCheckedId.clear();
  //     this.refreshCheckedStatus();
  //     this.loading = false;
  //   }, 1000);
  // }




  // 歷史紀錄全選狀態變更時
  // onHistoryAllChecked(checked: boolean): void {
  //   this.historyListOfCurrentPageData
  //     .forEach(({ id }) => this.updateHistoryCheckedSet(id, checked));
  //   this.refreshHistoryCheckedStatus();
  // }

  // 發送歷史紀錄請求
  // sendHistoryRequest(): void {
  //   this.historyLoading = true;
  //   const requestData = this.pointsHistoryList.filter(data => this.historySetOfCheckedId.has(String(data.id)));
  //   console.log('Selected history data:', requestData);
  //   setTimeout(() => {
  //     this.historySetOfCheckedId.clear();
  //     this.refreshHistoryCheckedStatus();
  //     this.historyLoading = false;
  //   }, 1000);
  // }
