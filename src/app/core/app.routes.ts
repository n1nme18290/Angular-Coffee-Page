import { Routes } from '@angular/router';
import { authGuard } from '../feature/auth/auth-guard';
import { permissionGuard } from '../feature/auth/permission-guard';

import { SsoEntryComponent } from '../feature/sso-entry/sso-entry.component';
import { SsoErrorComponent } from '../feature/sso-error/sso-error.component';
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
  // SSO 入口 - 預設首頁
  { path: '', component: SsoEntryComponent },
  
  // SSO 錯誤頁面
  { path: 'sso-error', component: SsoErrorComponent },
  
  // 後門登入
  { 
    path: 'backdoor/admin-login', 
    component: LogInComponent,
  },
  {
    path: '',
    component: MainPageComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: 'personal-info',
        component: PersonalInfoComponent,
        canActivate: [permissionGuard],
      },
      { 
        path: 'point-information',
        component: PointInformationComponent,
        // canActivate: [permissionGuard],
      },
      { path: 'equipment',
        component: EquipmentComponent,
        // canActivate: [permissionGuard],
        children: [
          { path: 'equipment/equipment-information', component: EquipmentInformationComponent },
        ]
      },
      {
        path: 'backend-management',
        component: BackendManagementComponent,
        // canActivate: [permissionGuard],
      },
      {
        path: 'historical-record',
        component: HistoricalRecordComponent,
        // canActivate: [permissionGuard],
      },
      { 
        path: 'permission-management',
        component: PermissionManagementComponent,
        // canActivate: [permissionGuard],
      },
      {
        path: 'test-page',
        component: TestPageComponent,
      }
    ]
  }
  // { path: 'demo-components', component: DemoComponentsComponent },
  // { path: 'equipment/equipment-information', component: EquipmentInformationComponent },
];