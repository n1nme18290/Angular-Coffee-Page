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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';


import { SidebarService } from '../../share/sidebar.service';

@Component({
  selector: 'app-historical-record',
  standalone: true,
  imports: [NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule,
    NzRadioModule, NzModalModule, CommonModule,],
  templateUrl: './historical-record.component.html',
  styleUrl: './historical-record.component.scss'
})
export class HistoricalRecordComponent {
  constructor(public sidebarService: SidebarService) { }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }


  selectedIndex = 0;
  Title01 = '使用者使用紀錄';
  Title02 = '異常歷史紀錄';
  Title03 = '設備使用紀錄';
  Title04 = '咖啡派送紀錄';

  getCurrentTitle(): string {
    switch (this.selectedIndex) {
      case 0: return this.Title01;
      case 1: return this.Title02;
      case 2: return this.Title03;
      case 3: return this.Title04;
      default: return '';
    }
  }




}
