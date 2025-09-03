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
import { NzTableModule } from 'ng-zorro-antd/table';

import { SidebarService } from '../../share/service/sidebar.service';
import { Observable, of } from 'rxjs';
import { IApiResponse, IApiResponsePoints, IApiResponseMember, IApiResponsePointsHistory } from '../../share/service/model';
import { PointService, MemberService, AdminService, LogService, } from '../../share/service/service';


@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [
    NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule,
    NzDropDownModule, FormsModule, NzSelectModule, NzSwitchModule, NzAvatarModule,
    NzTabsModule, NzPageHeaderModule, NzDrawerModule, NzRadioModule, NzModalModule,
    CommonModule, NzDividerModule, NzGridModule, NzCarouselModule, NzQRCodeModule, NzTableModule
  ],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss'
})
export class PersonalInfoComponent {
  constructor(
    public sidebarService: SidebarService,
    public pointService: PointService,
    public memberService: MemberService,
    public adminservice: AdminService,
    public logservice: LogService,

  ) { }

  ngOnInit(): void {
    this.getPointByMemberId("ea1b587d-f6db-4dcb-b555-0b8f98c02a75");
    this.getMember("819b2267-3c0b-432c-8d78-d5339de62dc6");
    this.getAllMembers();
    this.getMemberLog("ea1b587d-f6db-4dcb-b555-0b8f98c02a75", 1, 10); // ✨ 修改: 調整為取得更多筆資料

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
        // console.log('Point data get balance:', response);
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


  // 依 id 查詢會員名稱  
  getMember(id: string) {
    this.memberService.getMember(id).subscribe({
      next: (response) => {
        // console.log('Member data get ID:', response);
        this.username = response.data.student_id;
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

  getMemberLog(memberId: string, page: number, perPage: number): void {
    this.memberHistoryLoading = true;
    this.logservice.getMemberLog(memberId, page, perPage).subscribe({
      next: (response) => {
        console.log('Member Log API Response:', response);
        if (response.isSuccess && response.data) {
          this.memberPointsHistoryList = response.data.data || [];
          console.log('Member points history loaded:', this.memberPointsHistoryList);
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

  usepointhandleOk(): void {
    this.usepointisVisible = false;

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




}