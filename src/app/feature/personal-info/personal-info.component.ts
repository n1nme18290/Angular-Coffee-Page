import { Component, OnInit, inject } from '@angular/core';
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
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MemberService, PointService, LogService } from '../../share/service/service';
import { IApiResponseMember, IApiResponsePointsHistory } from '../../share/service/model';
import { SidebarService } from '../../share/service/sidebar.service';
import { TokenService } from '../../share/service/token.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzTypographyModule,
    NzDropDownModule,
    FormsModule,
    NzSelectModule,
    NzSwitchModule,
    NzAvatarModule,
    NzTabsModule,
    NzPageHeaderModule,
    NzDrawerModule,
    NzGridModule,
    NzRadioModule,
    NzModalModule,
    NzTableModule,
    NzDividerModule,
    NzCheckboxModule,
    NzCardModule,
    NzBadgeModule,
    NzCarouselModule,
    NzCollapseModule,
    NzInputNumberModule,
    NzSpinModule
  ],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss'
})
export class PersonalInfoComponent implements OnInit {
  // ✅ 注入服務
  public sidebarService = inject(SidebarService);
  private memberService = inject(MemberService);
  private pointsService = inject(PointService);
  private logService = inject(LogService); // ✅ 新增 LogService
  private tokenService = inject(TokenService);
  private message = inject(NzMessageService);

  // 輪播訊息
  carouselMessages = [
    '🎉 歡迎使用咖啡點數系統',
    '☕ 每消費一次即可累積點數',
    '🎁 20 點即可兌換一杯免費咖啡'
  ];

  // 使用者資訊
  username: string = '';
  email: string = '';
  userpoint: number = 0;
  memberId: string = '';

  // Modal 控制
  reviseisVisible = false;
  addpointisVisible = false;
  passwordVisible = false;

  // 表單值
  namevalue: string = '';
  passwordvalue: string = '';
  addpointselectedValue: string = '';
  pointvalue: number = 0;

  // 折疊面板
  rulepanels = [
    {
      active: true,
      name: '點數使用與規則說明',
      disabled: false
    }
  ];

  pointpanels = [
    {
      active: true,
      name: '點數異動紀錄',
      disabled: false
    }
  ];

  // 點數異動紀錄
  memberPointsHistoryList: IApiResponsePointsHistory[] = [];
  memberHistoryLoading = false;

  constructor() {}

  ngOnInit() {
    // 先取得會員 ID
    this.memberId = this.tokenService.getCurrentUserId() || '';
    
    if (!this.memberId) {
      console.error('❌ 無法取得會員 ID');
      this.message.error('無法取得會員資訊，請重新登入');
      return;
    }

    // 載入資料
    this.loadMemberInfo();
    this.loadMemberPoints();
    this.loadMemberLog(); // ✅ 使用正確的方法
  }

  // ✅ 切換側邊欄
  toggleCollapsed() {
    this.sidebarService.toggleCollapsed();
  }

  // 載入會員基本資訊
  loadMemberInfo() {
    this.memberService.getMember(this.memberId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.username = res.data.name || '';
          this.email = res.data.email || '';
          console.log('✅ 會員資訊載入成功');
        } else {
          console.error('❌ 會員資訊載入失敗:', res.message);
          this.message.error(res.message || '載入會員資訊失敗');
        }
      },
      error: (err) => {
        console.error('❌ 載入會員資訊錯誤:', err);
        this.message.error('載入會員資訊時發生錯誤');
      }
    });
  }

  // ✅ 載入會員點數
  loadMemberPoints() {
    this.pointsService.getPointByMemberId(this.memberId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.userpoint = res.data.balance || 0;
          console.log('✅ 會員點數載入成功:', this.userpoint);
        } else {
          console.warn('⚠️ 查無點數資料:', res.message);
          this.userpoint = 0;
        }
      },
      error: (err) => {
        console.error('❌ 載入會員點數錯誤:', err);
        this.userpoint = 0;
      }
    });
  }

  // ✅ 載入會員點數異動紀錄（使用 LogService）
  loadMemberLog(page: number = 1, perPage: number = 10) {
    if (!this.memberId) {
      console.error('❌ 無法取得會員ID');
      return;
    }

    this.memberHistoryLoading = true;
    this.logService.getMemberLog(this.memberId, page, perPage).subscribe({
      next: (response) => {
        console.log('📋 Member Log API Response:', response);
        
        if (response.isSuccess && response.data) {
          // 處理分頁結構的資料
          this.memberPointsHistoryList = response.data.data || [];
          console.log('✅ 點數異動紀錄載入成功:', this.memberPointsHistoryList.length);
        } else {
          console.warn('⚠️ 查無異動紀錄:', response.message);
          this.memberPointsHistoryList = [];
        }
        
        this.memberHistoryLoading = false;
      },
      error: (error) => {
        console.error('❌ 載入點數異動紀錄失敗:', error);
        this.memberPointsHistoryList = [];
        this.memberHistoryLoading = false;
        this.message.error('載入點數異動紀錄時發生錯誤');
      }
    });
  }

  // 根據事件類型返回圖示
  getEventIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'earn': 'plus-circle',
      'transfer_in': 'arrow-down',
      'transfer_out': 'arrow-up',
      'exchange': 'shopping',
      'redeem': 'gift',
      'refund': 'undo',
      'admin_adjust': 'tool',
      'expire': 'clock-circle'
    };
    return iconMap[type] || 'file-text';
  }

  // Modal 方法
  reviseModal() {
    this.namevalue = this.username;
    this.passwordvalue = '';
    this.reviseisVisible = true;
  }

  revisehandleOk() {
    if (!this.namevalue && !this.passwordvalue) {
      this.message.warning('請至少填寫一項要修改的內容');
      return;
    }

    // TODO: 呼叫 API 更新會員資訊
    console.log('修改個人資料:', { name: this.namevalue, password: this.passwordvalue });
    this.message.success('個人資料修改成功');
    this.reviseisVisible = false;
    
    // 重新載入會員資訊
    if (this.namevalue) {
      this.username = this.namevalue;
    }
  }

  revisehandleCancel() {
    this.reviseisVisible = false;
  }

  addpointModal() {
    this.addpointselectedValue = '';
    this.pointvalue = 0;
    this.addpointisVisible = true;
  }

  addpointhandleOk(receiverId: string, points: number) {
    if (!receiverId || !points || points <= 0) {
      this.message.warning('請填寫完整的轉贈資訊');
      return;
    }

    if (points > this.userpoint) {
      this.message.error('點數不足，無法轉贈');
      return;
    }

    // ✅ 呼叫轉贈點數 API
    this.pointsService.addMemberpoints(this.memberId, receiverId, points).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.message.success('點數轉贈成功！');
          this.addpointisVisible = false;
          
          // 重新載入點數和紀錄
          this.loadMemberPoints();
          this.loadMemberLog();
        } else {
          this.message.error(res.message || '點數轉贈失敗');
        }
      },
      error: (err) => {
        console.error('❌ 點數轉贈錯誤:', err);
        this.message.error('點數轉贈時發生錯誤');
      }
    });
  }

  LogOut() {
    this.tokenService.removeToken();
    this.tokenService.removeMemberId();
    window.location.reload();
  }

  addpointhandleCancel() {
    this.addpointisVisible = false;
  }

  // Modal Footer Template
  revisemodalFooter = null;
}