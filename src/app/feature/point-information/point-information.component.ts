import { Component, inject } from '@angular/core';
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
<<<<<<< HEAD
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { NzCarouselModule } from 'ng-zorro-antd/carousel';
=======
import { PointService } from '../../share/service/service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';

>>>>>>> 667877c58115e0fefb9c8ead7357aa9fec09ac7d

import { SidebarService } from '../../share/sidebar.service';
import { Observable } from 'rxjs';
import { IApiResponsePoints } from '../../share/service/model';
@Component({
  selector: 'app-point-information',
  standalone: true,
  imports: [NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule,
<<<<<<< HEAD
    NzRadioModule, NzModalModule, CommonModule, NzGridModule, NzDividerModule, NzCarouselModule,
  ],
=======
    NzRadioModule, NzModalModule, CommonModule, NzTableModule, NzDividerModule],
>>>>>>> 667877c58115e0fefb9c8ead7357aa9fec09ac7d
  templateUrl: './point-information.component.html',
  styleUrl: './point-information.component.scss'
})
export class PointInformationComponent {
<<<<<<< HEAD
  constructor(public sidebarService: SidebarService) { }
=======
  constructor() { }

  router = inject(Router);
  sidebarService = inject(SidebarService);
  pointService = inject(PointService);

  pointsList: IApiResponsePoints[] = [];

  ngOnInit() {
    // Initialization logic can go here
    this.getAllPoints();
  }

  ngAfterViewInit() {
    // Logic that needs to run after the view has been initialized can go here
  }

  // 取得所有點數
  getAllPoints() {
    this.pointService.getAllPoints().subscribe(
      (res) => {
        this.pointsList = res.data;
      },
    );
  }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

>>>>>>> 667877c58115e0fefb9c8ead7357aa9fec09ac7d

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

  
}
