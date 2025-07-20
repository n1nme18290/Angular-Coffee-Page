import { Routes } from '@angular/router';
import { DemoComponentsComponent } from '../share/demo-components/demo-components.component';

import { LogInComponent } from '../feature/log-in/log-in.component';
import { RegisterComponent } from '../feature/register/register.component';
import { PersonalInfoComponent } from '../feature/personal-info/personal-info.component';

import { EquipmentComponent } from '../feature/equipment/equipment.component';
import { EquipmentInformationComponent } from '../feature/equipment-information/equipment-information.component';

import { UserHistoryComponent } from '../feature/user-history/user-history.component';
import { AbnormalHistoryComponent } from '../feature/abnormal-history/abnormal-history.component';
import { EquipmentHistoryComponent } from '../feature/equipment-history/equipment-history.component';


export const routes: Routes = [
    { path: '', redirectTo: '/log-in', pathMatch: 'full' },
    { path: "demo-components", component:DemoComponentsComponent},

    { path: 'log-in', component: LogInComponent },
    { path: 'register', component:RegisterComponent},
    { path: "personal-info", component:PersonalInfoComponent},

    { path: "equipment", component:EquipmentComponent},
    { path: "equipment-information", component:EquipmentInformationComponent},

    { path: "user-history", component:UserHistoryComponent},
    { path: "abnormal-history", component:AbnormalHistoryComponent},
    { path: "equipment-history", component:EquipmentHistoryComponent},
];
