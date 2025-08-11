import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // 新增這個

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

import { SidebarService } from '../../share/sidebar.service';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    RouterOutlet, CommonModule, // 新增 CommonModule
    NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, 
    NzDropDownModule, FormsModule, NzSelectModule, NzSwitchModule, NzAvatarModule, 
    NzTabsModule, NzPageHeaderModule, NzDrawerModule, NzRadioModule
  ],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent {
  constructor(public sidebarService: SidebarService, private router: Router) { }

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }

  //連結
  GoEquipmentInformation(){
    this.router.navigate(['/equipment/equipment-information']);
  }



}