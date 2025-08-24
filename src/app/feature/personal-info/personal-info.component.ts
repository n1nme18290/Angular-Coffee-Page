import { Component } from '@angular/core';
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
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';

import { SidebarService } from '../../share/service/sidebar.service';
import { Observable, of } from 'rxjs';
import { IApiResponse, IApiResponsePoints, IApiResponseMember, } from '../../share/service/model';
import { PointService, MemberService } from '../../share/service/service';


@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule,
    NzDropDownModule, FormsModule, NzSelectModule, NzSwitchModule, NzAvatarModule,
    NzTabsModule, NzPageHeaderModule, NzDrawerModule, NzRadioModule, NzModalModule,
    CommonModule, NzDividerModule, NzGridModule, NzCarouselModule, NzQRCodeModule
  ],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss'
})
export class PersonalInfoComponent {
  constructor(
    public sidebarService: SidebarService,
    public pointService: PointService,
    public memberService: MemberService

  ) { }

  ngOnInit(): void {
    this.getPointByMemberId("ea1b587d-f6db-4dcb-b555-0b8f98c02a75");
    this.getMember("272d8f6e-1578-4a4e-8848-62bf0e0755c1")
    // this.addMemberpoints("ea1b587d-f6db-4dcb-b555-0b8f98c02a75", "e9a3c47b-be77-486f-beeb-0551518d6948", 10);
  }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();

  }

  username: any;
  userpoint: any;
  Date = '25/10/31';

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
  getPointByMemberId(memberId: string) {
    this.pointService.getPointByMemberId(memberId).subscribe({
      next: (response) => {
        console.log('Point data:', response);
        //return response;
        this.userpoint = response.data.balance;
      },
      error: (error) => {
        console.error('Error fetching point data:', error);
      }
    });
  }

  // 增加點數或轉贈點數
  addMemberpoints(memberId: string, targetMemberId: string, balance: number) {
    this.pointService.addMemberpoints(memberId, targetMemberId, balance).subscribe({
      next: (response) => {
        console.log('Add member points response:', response);
        alert('轉贈成功！');
      },
      error: (error) => {
        console.error('Error adding member points:', error);
        alert('轉贈失敗，請稍後再試');
        this.userpoint += balance;
      }
    });
  }

  // 依 id 查詢會員 / 顯示會員名稱
  members: IApiResponseMember[] = [];
  isLoading = false;
  selectedMember: string | null = null;

    // 搜尋會員 (只更新下拉選單)
  getMember(id: string) {
    if (!id) {
      this.members = [];
      return;
    }
    this.isLoading = true;
    this.memberService.getMember(id).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.members = [response.data]; // 下拉選單的資料
        } else {
          this.members = [];
        }
      },
      error: () => {
        this.isLoading = false;
        this.members = [];
      }
    });
  }

  //選重的會員
  onSelectMember(memberId: string) {
    this.memberService.getMember(memberId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.username = response.data.name;
        }
      },
      error: () => {
        this.username = null;
      }
    });
  }


  // 轉贈點數彈跳視窗
  addpointisVisible = false;
  addpointselectedValue: string | null = null;
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

  usepointhandleOk(): void {
    this.usepointisVisible = false;

  }

  usepointhandleCancel(): void {
    this.usepointisVisible = false;
  }




}
