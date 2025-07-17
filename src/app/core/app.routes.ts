import { Routes } from '@angular/router';
import { LogInComponent } from '../feature/log-in/log-in.component';
import { RegisterComponent } from '../feature/register/register.component';
import { PersonalInfoComponent } from '../feature/personal-info/personal-info.component';
import { DemoComponentsComponent } from '../share/demo-components/demo-components.component';

export const routes: Routes = [
    { path: '', redirectTo: '/log-in', pathMatch: 'full' },
    { path: 'log-in', component: LogInComponent },
    { path: 'register', component:RegisterComponent},
    { path: "personal-info", component:PersonalInfoComponent},
    { path: "demo-components", component:DemoComponentsComponent},
];
