import { Routes } from '@angular/router';
import { ComponentsComponent } from './components/components.component';
import { LogInComponent } from './log-in/log-in.component';
import { RegisterComponent } from './register/register.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';

export const routes: Routes = [
    { path: 'components', component: ComponentsComponent },
    { path: 'log-in', component: LogInComponent },
    { path: 'register', component:RegisterComponent},
    { path: "personal-info", component:PersonalInfoComponent},
];
