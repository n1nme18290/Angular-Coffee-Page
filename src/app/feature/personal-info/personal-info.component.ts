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
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { SidebarService } from '../../share/sidebar.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule,
    NzRadioModule, NzModalModule, CommonModule, NzDividerModule,NzGridModule,NzCarouselModule],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss'
})
export class PersonalInfoComponent {
  constructor(public sidebarService: SidebarService) { }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

  userpoint = 175

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
    const messages = [
      `目前可兌換 ${this.coffeeCount} 杯咖啡`,
      `再 ${this.pointsToNextCoffee} 點即可再兌換一杯！`,
      '試試轉贈點數給朋友',
      '趕緊兌換咖啡吧！'
    ];
    return messages;
  }





}
