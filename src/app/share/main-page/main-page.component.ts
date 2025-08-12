import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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

import { SidebarService } from '../service/sidebar.service';
@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterOutlet, NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule,
    NzRadioModule,],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {


  //連結
  constructor(private router: Router, public sidebarService: SidebarService) { }


  GoLogIn() {
    this.router.navigate(['/log-in']);
  }
  GoPersonalInfo() {
    this.router.navigate(['/personal-info']);
  }
  GoPointInformation() {
    this.router.navigate(['/point-information']);
  }
  GoEquipment() {
    this.router.navigate(['/equipment']);
  }
  GoEquipmentInformation() {
    this.router.navigate(['/equipment-information']);
  }

  GoBackendManagement() {
    this.router.navigate(['/backend-management'])
  }
  GoHistoricalRecord(){
    this.router.navigate(['/historical-record'])
  }
  GoPermissionManagement(){
    this.router.navigate(['/permission-management'])
  }






}
