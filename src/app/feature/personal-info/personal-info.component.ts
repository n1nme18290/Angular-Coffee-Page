import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { MemberService, PointService, LogService, AuthService } from '../../share/service/service';
import { IApiResponseMember, IApiResponsePointsHistory } from '../../share/service/model';
import { SidebarService } from '../../share/service/sidebar.service';
import { TokenService } from '../../share/service/token.service';
import { PermissionService } from '../../share/service/permission.service';

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
  private logService = inject(LogService);
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  // ✅ Tabs 控制
  selectedTabIndex = 0;

  // 使用者資訊
  username: string = '';
  email: string = '';
  userpoint: number = 0;
  memberId: string = '';

  // Modal 控制
  addpointisVisible = false;

  // 表單值
  addpointselectedValue: string = '';
  pointvalue: number = 0;

  // 點數異動紀錄
  memberPointsHistoryList: IApiResponsePointsHistory[] = [];
  memberHistoryLoading = false;

  // ✅ 響應式 Modal 寬度
  modalWidth: string = '600px';

  constructor() {
    // 初始化時設定 Modal 寬度
    this.updateModalWidth();
  }

  ngOnInit() {
    // 先取得會員 ID
    this.memberId = this.tokenService.getCurrentUserId() || '';
    
    if (!this.memberId) {
      console.error('❌ 無法取得會員 ID');
      this.message.error('無法取得會員資訊,請重新登入');
      return;
    }

    // 載入資料
    this.loadMemberInfo();
    this.loadMemberPoints();
    this.loadMemberLog();
  }

  // ✅ 監聽視窗大小變化
  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    this.updateModalWidth();
  }

  // ✅ 動態更新 Modal 寬度
  private updateModalWidth() {
    const width = window.innerWidth;
    
    if (width <= 375) {
      // 極小手機
      this.modalWidth = '95%';
    } else if (width <= 767) {
      // 一般手機
      this.modalWidth = '90%';
    } else if (width <= 1024) {
      // 平板
      this.modalWidth = '500px';
    } else {
      // 桌面
      this.modalWidth = '600px';
    }
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

  // Modal 方法
  addpointModal() {
    this.addpointselectedValue = '';
    this.pointvalue = 0;
    this.addpointisVisible = true;
  }

  addpointhandleOk(receiverId: string, points: number) {
    // ✅ 驗證輸入
    if (!receiverId || receiverId.trim() === '') {
      this.message.warning('請輸入轉贈對象學號');
      return;
    }

    if (!points || points <= 0) {
      this.message.warning('請輸入有效的點數數量');
      return;
    }

    if (points > this.userpoint) {
      this.message.error('點數不足，無法轉贈');
      return;
    }

    // ✅ 防止轉贈給自己
    if (receiverId.trim() === this.memberId) {
      this.message.warning('無法轉贈點數給自己');
      return;
    }

    // ✅ 呼叫轉贈點數 API
    this.pointsService.addMemberpoints(this.memberId, receiverId.trim(), points).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.message.success('點數轉贈成功！');
          this.addpointisVisible = false;
          
          // 重置表單
          this.addpointselectedValue = '';
          this.pointvalue = 0;
          
          // 重新載入點數和紀錄
          this.loadMemberPoints();
          this.loadMemberLog();
        } else {
          this.message.error(res.message || '點數轉贈失敗');
        }
      },
      error: (err) => {
        console.error('❌ 點數轉贈錯誤:', err);
        
        // ✅ 更詳細的錯誤處理
        if (err.status === 404) {
          this.message.error('找不到該學號的使用者');
        } else if (err.status === 400) {
          this.message.error('轉贈資料有誤，請檢查後重試');
        } else {
          this.message.error('點數轉贈時發生錯誤');
        }
      }
    });
  }

  addpointhandleCancel() {
    this.addpointisVisible = false;
    // ✅ 重置表單
    this.addpointselectedValue = '';
    this.pointvalue = 0;
  }

  LogOut() {
    this.authService.logout();
    this.permissionService.clearPermissions();
    this.router.navigate(['/log-in']);
  }
}