import { Routes } from '@angular/router';
import { authGuard } from '../feature/auth/auth-guard';
import { permissionGuard } from '../feature/auth/permission-guard';

import { SsoEntryComponent } from '../feature/sso-entry/sso-entry.component';
import { SsoErrorComponent } from '../feature/sso-error/sso-error.component';
import { LogoutSuccessComponent } from '../feature/logout-success/logout-success.component';
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
  // SSO 入口 - 預設首頁（公開路由）
  { path: '', component: SsoEntryComponent },
  
  // SSO 錯誤頁面（公開路由）
  { path: 'sso-error', component: SsoErrorComponent },
  
  // 登出成功頁面（公開路由）
  { path: 'logout-success', component: LogoutSuccessComponent },
  
  // 後門登入（公開路由）
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
        // personal-info 為公開路由，所有登入用戶都可訪問（頁面 3）
      },
      // { 
      //   path: 'point-information',
      //   component: PointInformationComponent,
      //   canActivate: [permissionGuard], // 需要權限：Admin、僅可檢視（頁面 4）
      // },
      { 
        path: 'equipment',
        component: EquipmentComponent,
        canActivate: [permissionGuard], // 需要權限：Admin、維護人員（頁面 6）
        children: [
          { path: 'equipment/equipment-information', component: EquipmentInformationComponent },
        ]
      },
      {
        path: 'backend-management',
        component: BackendManagementComponent,
        canActivate: [permissionGuard], // 需要權限：Admin、維護人員、僅可檢視（頁面 8）
      },
      {
        path: 'historical-record',
        component: HistoricalRecordComponent,
        canActivate: [permissionGuard], // 需要權限：Admin、維護人員（tab2）、僅可檢視（頁面 7）
      },
      { 
        path: 'permission-management',
        component: PermissionManagementComponent,
        canActivate: [permissionGuard], // 需要權限：Admin（頁面 5）
      },
      // {
      //   path: 'test-page',
      //   component: TestPageComponent,
      // }
    ]
  }
  // { path: 'demo-components', component: DemoComponentsComponent },
  // { path: 'equipment/equipment-information', component: EquipmentInformationComponent },
];