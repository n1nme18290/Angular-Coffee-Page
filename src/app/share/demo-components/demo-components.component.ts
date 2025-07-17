import { Component } from '@angular/core';
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
import { NzDrawerModule} from 'ng-zorro-antd/drawer';
import { NzRadioModule } from 'ng-zorro-antd/radio';


@Component({
  selector: 'app-demo-components',
  standalone: true,
  imports: [NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule
    , NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule,NzDrawerModule,
    NzRadioModule,],
  templateUrl: './demo-components.component.html',
  styleUrl: './demo-components.component.scss'
})
export class DemoComponentsComponent {
  passwordVisible = false;
  password?: string;

  selectedValue = null;

  onBack(): void {
    console.log('onBack');
  }

  visible = false;

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  

}
