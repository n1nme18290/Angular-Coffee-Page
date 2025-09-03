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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { SidebarService } from '../../share/service/sidebar.service';
import { LogService } from '../../share/service/service';
// ✨ 新增: 引入點數歷史紀錄的介面
import { IApiResponsePoints, IApiResponsePointsHistory } from '../../share/service/model';

@Component({
  selector: 'app-historical-record',
  standalone: true,
  imports: [NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule,
    NzRadioModule, NzModalModule, CommonModule,
    NzTableModule, NzDividerModule, NzCheckboxModule, NzGridModule],
  templateUrl: './historical-record.component.html',
  styleUrl: './historical-record.component.scss'
})
export class HistoricalRecordComponent {
  constructor(
    //public sidebarService: SidebarService,
    public logService: LogService
  ) { }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

  selectedIndex = 0;
  Title01 = '使用者使用紀錄';
  Title02 = '異常歷史紀錄';
  Title03 = '設備使用紀錄';
  Title04 = '咖啡派送紀錄';
  Title05 = '點數資訊';

  getCurrentTitle(): string {
    switch (this.selectedIndex) {
      case 0: return this.Title01;
      case 1: return this.Title02;
      case 2: return this.Title03;
      case 3: return this.Title04;
      case 4: return this.Title05;
      default: return '';
    }
  }

  // 查詢指定會員的點數異動紀錄
  getMemberPointsHistory(memberId: string) {
    this.logService.getMemberLog(memberId, 1, 10).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          console.log('Member Points History:', response.data);
          return response.data;
        } else {
          console.error('Error fetching member points history:', response.message);
          return response.message;
        }
      },
      error: (error) => {
        console.error('Error fetching member points history:', error);
      }
    });
  }

  //點數資訊 (原有功能)
  router = inject(Router);
  sidebarService = inject(SidebarService);
  pointService = inject(PointService);

  pointsList: IApiResponsePoints[] = [];
  checked = false;
  loading = false;
  indeterminate = false;
  listOfCurrentPageData: readonly IApiResponsePoints[] = [];
  setOfCheckedId = new Set<string>();

  currentPage = 1;
  pageSize = 5;
  total = 0;

  // ✨ 新增: 點數歷史紀錄相關屬性
  pointsHistoryList: IApiResponsePointsHistory[] = [];
  historyLoading = false;
  historyChecked = false;
  historyIndeterminate = false;
  historyListOfCurrentPageData: readonly IApiResponsePointsHistory[] = [];
  historySetOfCheckedId = new Set<string>();

  ngOnInit() {
    // Initialization logic can go here
    this.getPagePoints(1, 5);
    // ✨ 新增: 初始化點數歷史紀錄
    this.getAllPointsHistory();
  }

  ngAfterViewInit() {
    // Logic that needs to run after the view has been initialized can go here
  }

  // 原有點數資訊功能 ---
  // 更新選取的ID集合
  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
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
  
  // 單項選取狀態變更時
  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }
  
  // 全選狀態變更時
  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .filter(({ balance }) => balance >= 0)
      .forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }
  
  // 發送請求，後續要修改為有用的功能或是拿掉
  sendRequest(): void {
    this.loading = true;
    const requestData = this.pointsList.filter(data => this.setOfCheckedId.has(String(data.id)));
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
  
  // 取得分頁點數
  getPagePoints(page: number, perpage: number) {
    this.loading = true;
    this.pointService.getPagePoints(page, perpage).subscribe({
      next: (res) => {
        // console.log('API Response:', res);
        if (res && res.data) {
          this.pointsList = res.data.data || [];
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

  // ✨ 新增: 點數歷史紀錄功能 ---
  // 取得所有點數歷史紀錄
  getAllPointsHistory(): void {
    this.historyLoading = true;
    this.logService.getAllLog().subscribe({
      next: (res) => {
        console.log('Points History API Response:', res);
        if (res && res.data) {
          this.pointsHistoryList = res.data.data || [];
          // 清除選取狀態
          this.historySetOfCheckedId.clear();
          this.refreshHistoryCheckedStatus();
        }
        this.historyLoading = false;
      },
      error: (error) => {
        console.error('Error fetching points history:', error);
        this.pointsHistoryList = [];
        this.historyLoading = false;
      }
    });
  }

  // 更新歷史紀錄選取的ID集合
  updateHistoryCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.historySetOfCheckedId.add(id);
    } else {
      this.historySetOfCheckedId.delete(id);
    }
  }

  // 當前頁面歷史紀錄數據變更時
  onHistoryCurrentPageDataChange(listOfCurrentPageData: readonly IApiResponsePointsHistory[]): void {
    this.historyListOfCurrentPageData = listOfCurrentPageData;
    this.refreshHistoryCheckedStatus();
  }

  // 刷新歷史紀錄選取狀態
  refreshHistoryCheckedStatus(): void {
    const listOfEnabledData = this.historyListOfCurrentPageData;
    this.historyChecked = listOfEnabledData.every(({ id }) => this.historySetOfCheckedId.has(id));
    this.historyIndeterminate = listOfEnabledData.some(({ id }) => this.historySetOfCheckedId.has(id)) && !this.historyChecked;
  }

  // 歷史紀錄單項選取狀態變更時
  onHistoryItemChecked(id: string, checked: boolean): void {
    this.updateHistoryCheckedSet(id, checked);
    this.refreshHistoryCheckedStatus();
  }

  // 歷史紀錄全選狀態變更時
  onHistoryAllChecked(checked: boolean): void {
    this.historyListOfCurrentPageData
      .forEach(({ id }) => this.updateHistoryCheckedSet(id, checked));
    this.refreshHistoryCheckedStatus();
  }

  // 發送歷史紀錄請求
  sendHistoryRequest(): void {
    this.historyLoading = true;
    const requestData = this.pointsHistoryList.filter(data => this.historySetOfCheckedId.has(String(data.id)));
    console.log('Selected history data:', requestData);
    setTimeout(() => {
      this.historySetOfCheckedId.clear();
      this.refreshHistoryCheckedStatus();
      this.historyLoading = false;
    }, 1000);
  }
}