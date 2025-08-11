import { Routes } from '@angular/router';
import { DemoComponentsComponent } from '../share/demo-components/demo-components.component';

import { LogInComponent } from '../feature/log-in/log-in.component';
import { RegisterComponent } from '../feature/register/register.component';

import { PersonalInfoComponent } from '../feature/personal-info/personal-info.component';
import { PointInformationComponent } from '../feature/point-information/point-information.component';

import { EquipmentComponent } from '../feature/equipment/equipment.component';
import { EquipmentInformationComponent } from '../feature/equipment-information/equipment-information.component';

import { BackendManagementComponent } from '../feature/backend-management/backend-management.component';
import { HistoricalRecordComponent } from '../feature/historical-record/historical-record.component';
import { PermissionManagementComponent } from '../feature/permission-management/permission-management.component';

import { TestPageComponent } from '../share/test-page/test-page.component';
import { MainPageComponent } from '../share/main-page/main-page.component';


export const routes: Routes = [
  { path: '', redirectTo: '/personal-info', pathMatch: 'full' },

  { path: 'log-in', component: LogInComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'demo-components', component: DemoComponentsComponent },
  { path: 'equipment/equipment-information', component: EquipmentInformationComponent },

  {
    path: '',
    component: MainPageComponent,
    children: [
      { path: 'personal-info', component: PersonalInfoComponent },
      { path: 'point-information', component: PointInformationComponent },
      { path: 'equipment',component: EquipmentComponent,},
      { path: 'backend-management', component: BackendManagementComponent },
      { path: 'historical-record', component: HistoricalRecordComponent },
      { path: 'permission-management', component: PermissionManagementComponent },
      { path: 'test-page', component: TestPageComponent }
    ]
  }
];
