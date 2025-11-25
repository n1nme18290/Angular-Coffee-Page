import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { SidebarService } from '../../share/service/sidebar.service';
import { Observable, of, Subscription } from 'rxjs';
import { IApiResponse, IApiResponsePoints, IApiResponseMember, IApiResponsePointsHistory, IApiResponseGetPageProduct, IApiResponseGetProduct } from '../../share/service/model';
import { PointService, MemberService, AdminService, LogService, ProductService, } from '../../share/service/service';
//import { AuthTokenService } from '../../share/service/auth.service';


@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule,
    NzDropDownModule, FormsModule, NzSelectModule, NzSwitchModule, NzAvatarModule, NzInputNumberModule,
    NzTabsModule, NzPageHeaderModule, NzDrawerModule, NzRadioModule, NzModalModule, NzCardModule,
    CommonModule, NzDividerModule, NzGridModule, NzCarouselModule, NzQRCodeModule, NzTableModule, NzCollapseModule
  ],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss'
})

export class PersonalInfoComponent implements OnInit, OnDestroy {
  private memberIdSubscription?: Subscription;

  currentMemberId: string | null = null;

  constructor(
    public sidebarService: SidebarService,
    public pointService: PointService,
    public memberService: MemberService,
    public adminservice: AdminService,
    public logservice: LogService,
    public productService: ProductService,
    //public authTokenService: AuthTokenService
  ) { }

  // 訂閱
  // ngOnInit(): void {
  //   // 訂閱 memberId 變化
  //   this.memberIdSubscription = this.authTokenService.memberId$.subscribe(
  //     memberId => {
  //       if (memberId) {
  //         this.currentMemberId = memberId;
  //         this.loadUserData(memberId);
  //       } else {
  //         console.error('無法取得會員ID，請重新登入');
  //         // 可以導向登入頁面
  //       }
  //     }
  //   );
  // }
  ngOnInit(): void {
    // 實際 member id 如何取得 -> 夾帶在 header
    this.getPointByMemberId("9aa162f8-5ceb-4783-be85-274fed2ecb8e");
    this.getMember("9aa162f8-5ceb-4783-be85-274fed2ecb8e");
    this.getAllMembers();
    this.getMemberLog("9aa162f8-5ceb-4783-be85-274fed2ecb8e", 1, 10); // ✨ 修改: 調整為取得更多筆資料
    this.getMemPageProduct();
    // 載入商品清單
    this.loadProducts();
  }
  // 取消訂閱
  ngOnDestroy(): void {
    if (this.memberIdSubscription) {
      this.memberIdSubscription.unsubscribe();
    }
  }

  // 載入用戶相關資料
  private loadUserData(memberId: string): void {
    this.getPointByMemberId(memberId);
    this.getMember(memberId);
    this.getAllMembers();
    this.getMemberLog(memberId, 1, 5);
    this.loadProducts();
  }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();

  }

  username: string = '';
  userpoint: number = 0;
  Date = '25/10/31';

  productList: IApiResponseGetPageProduct[] = [];
  memberProductList: IApiResponseGetProduct[] = [];



  // 輪換通知
  get coffeeCount(): number {
    return Math.floor(this.userpoint / 100);
  }
  get pointsToNextCoffee(): number {
    return 100 - (this.userpoint % 100);
  }
  get isExact(): boolean {
    return this.userpoint % 100 === 0;
  }
  get carouselMessages(): string[] {
    return [
      `目前可兌換 ${this.coffeeCount} 杯咖啡`,
      `再 ${this.pointsToNextCoffee} 點即可再兌換一杯！`,
      '試試轉贈點數給朋友',
      '趕緊兌換咖啡吧！'
    ];
  }

  // 透過 MemberId 取得點數
  getPointByMemberId(memberId?: string) {
    const targetId = memberId || this.currentMemberId;
    if (!targetId) {
      console.error('無法取得會員ID');
      return;
    }

    this.pointService.getPointByMemberId(targetId).subscribe({
      next: (response) => {
        this.userpoint = response.data.balance;
      },
      error: (error) => {
        console.error('Error fetching point data:', error);
      }
    });
  }

  // 增加點數或轉贈點數
  addMemberpoints(targetMemberId: string, balance: number) {
    if (!this.currentMemberId) {
      console.error('無法取得會員ID');
      return;
    }

    this.pointService.addMemberpoints(this.currentMemberId, targetMemberId, balance).subscribe({
      next: (response) => {
        console.log('Add member points response:', response);
        alert('轉贈成功！');
        // 重新載入點數和異動紀錄
        this.getPointByMemberId();
        this.getMemberLog();
      },
      error: (error) => {
        console.error('Error adding member points:', error);
        alert('轉贈失敗，請稍後再試');
      }
    });
  }

  // 依 id 查詢會員名稱  
  getMember(id?: string) {
    const targetId = id || this.currentMemberId;
    if (!targetId) {
      console.error('無法取得會員ID');
      return;
    }

    this.memberService.getMember(targetId).subscribe({
      next: (response) => {
        this.username = response.data.name;
      },
      error: (error) => {
        console.error('Error fetching member:', error);
      }
    });
  }

  //取得所有成員
  members: IApiResponseMember[] = [];

  getAllMembers() {
    this.memberService.getAllMembers().subscribe({
      next: (response) => {
        // console.log("Member data:", response);
        this.members = (response as any).data || [];
      },
      error: (error) => {
        console.error("error get all member:", error);
        this.members = [];
      }
    });
  }

  //點數異動紀錄 -- 查詢指定會員的點數異動紀錄

  memberPointsHistoryList: IApiResponsePointsHistory[] = [];
  memberHistoryLoading = false;

  // 取得會員點數異動紀錄
  getMemberLog(memberId?: string, page: number = 1, perPage: number = 5): void {
    const targetId = memberId || this.currentMemberId;
    if (!targetId) {
      console.error('無法取得會員ID');
      return;
    }
    this.memberHistoryLoading = true;
    this.logservice.getMemberLog(targetId, page, perPage).subscribe({
      next: (response) => {
        console.log('Member Log API Response:', response);
        if (response.isSuccess && response.data) {
          this.memberPointsHistoryList = response.data.data || [];
        } else {
          console.error('Error fetching member log:', response.message);
          this.memberPointsHistoryList = [];
        }
        this.memberHistoryLoading = false;
      },
      error: (error) => {
        console.error('Error fetching member log:', error);
        this.memberPointsHistoryList = [];
        this.memberHistoryLoading = false;
      }
    });
  }
  // 轉贈點數彈跳視窗
  addpointisVisible = false;
  addpointselectedValue: string = '';
  pointvalue?: number;

  addpointModal(): void {
    this.addpointisVisible = true;
  }

  addpointhandleOk(): void {
    this.addpointisVisible = false;
  }


  addpointhandleCancel(): void {
    this.addpointisVisible = false;
  }

  // 兌換點數彈跳視窗
  usepointisVisible = false;
  usepointselectedValue: string | null = null;
  capvalue?: number;

  usepointModal(): void {
    this.usepointisVisible = true;
  }

  usepointhandleCancel(): void {
    this.usepointisVisible = false;
  }

  //修改資料彈窗
  reviseisVisible = false;
  reviseselectedValue: string | null = null;
  passwordvalue?: string;
  namevalue?: string;

  reviseModal(): void {
    this.reviseisVisible = true;
  }

  revisehandleOk(): void {
    this.reviseisVisible = false;

  }

  revisehandleCancel(): void {
    this.reviseisVisible = false;
  }

  // 載入商品清單
  loadProducts(): void {
    this.productService.getPageProduct(1, 5).subscribe({
      next: (response) => {
        if (response && response.data && response.data.data) {
          this.productList = response.data.data;
        }
      },
      error: (error) => {
        console.error('載入商品失敗:', error);
        this.productList = [];
      }
    });
  }
  // 取得商品列表
  getPageProduct(): void {
    this.productService.getPageProduct(1, 5).subscribe({
      next: (response) => {
        this.productList = response.data.data || [];
      },
      error: (error) => {
        console.error('Error fetching product data:', error);
      }
    });
  }

  exchangeConfirmVisible = false;
  selectedProduct: IApiResponseGetPageProduct | null = null;
  exchangeQuantity: number = 1;
  // 點擊飲品卡片
  onDrinkSelect(product: IApiResponseGetPageProduct): void {
    console.log('你點擊了:', product);
    this.selectedProduct = product;
    this.exchangeQuantity = 1;

    // 檢查點數是否足夠
    if (this.userpoint < product.points_required) {
      alert(`點數不足！需要 ${product.points_required} 點，您目前有 ${this.userpoint} 點`);
      return;
    }

    // 顯示兌換確認彈窗
    this.exchangeConfirmVisible = true;
  }
  // 增加數量
  increaseQuantity(): void {
    if (!this.selectedProduct) return;
    const maxQuantity = Math.floor(this.userpoint / this.selectedProduct.points_required);
    if (this.exchangeQuantity < maxQuantity) {
      this.exchangeQuantity++;
    }
  }
  // 減少數量
  decreaseQuantity(): void {
    if (this.exchangeQuantity > 1) {
      this.exchangeQuantity--;
    }
  }// 計算總點數
  getTotalPoints(): number {
    if (!this.selectedProduct) return 0;
    return this.selectedProduct.points_required * this.exchangeQuantity;
  }
  // 計算最大可兌換數量
  getMaxQuantity(): number {
    if (!this.selectedProduct) return 0;
    return Math.floor(this.userpoint / this.selectedProduct.points_required);
  }
  // 檢查數量是否有效
  isQuantityValid(): boolean {
    return this.exchangeQuantity >= 1 && this.exchangeQuantity <= this.getMaxQuantity();
  }
  // 確認兌換
  confirmExchange(productId: string, pointsRequired: number): void {
    if (!this.selectedProduct || !this.isQuantityValid()) {
      alert('請選擇有效的兌換數量');
      return;
    }
    this.currentMemberId = '9aa162f8-5ceb-4783-be85-274fed2ecb8e'; // 測試用
    this.pointService.exchangeProduct(this.currentMemberId, productId, this.exchangeQuantity).subscribe({
      next: (response) => {
        console.log('兌換成功:', response);
        alert(`成功兌換 ${this.exchangeQuantity} 張「${this.selectedProduct?.name}」！`);
        this.exchangeConfirmVisible = false;
        this.selectedProduct = null;
        this.exchangeQuantity = 1;

        // 重新載入資料
        this.getPointByMemberId("9aa162f8-5ceb-4783-be85-274fed2ecb8e");
        this.getMemberLog("9aa162f8-5ceb-4783-be85-274fed2ecb8e", 1, 10);
      },
      error: (error) => {
        console.error('兌換失敗:', error);
        alert('兌換失敗，請稍後再試');
      }
    });
  }
  // 取消兌換確認
  cancelExchange(): void {
    this.exchangeConfirmVisible = false;
    this.selectedProduct = null;
    this.exchangeQuantity = 1;
  }

  // 取得會員商品列表
  getMemPageProduct(): void {
    this.currentMemberId = '9aa162f8-5ceb-4783-be85-274fed2ecb8e'; // 測試用
    this.productService.getMemPageProduct(1, 5, this.currentMemberId).subscribe({
      next: (response) => {
        this.memberProductList = response.data || [];
        console.log('會員商品列表:', this.memberProductList);
      },
      error: (error) => {
        console.error('Error fetching member product data:', error);
      }
    });
  }

  //異動折疊
  pointpanels = [
    {
      active: true,
      name: '點數異動紀錄',
      disabled: false
    }
  ]
  rulepanels = [
    {
      active: true,
      name: '點數使用與規則說明',
      disabled: false
    }
  ]
}