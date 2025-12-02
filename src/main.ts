import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/core/app.config';
import { AppComponent } from './app/core/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/share/service/service';

// 合併現有配置與新的 HTTP 攔截器
const updatedAppConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};


bootstrapApplication(AppComponent, updatedAppConfig)
  .catch((err) => console.error(err));