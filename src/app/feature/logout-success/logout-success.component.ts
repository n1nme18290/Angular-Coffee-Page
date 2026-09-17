import { Component, OnInit } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
    selector: 'app-logout-success',
    standalone: true,
    imports: [NzResultModule],
    template: `
    <div class="logout-success-container">
      <nz-result
        nzStatus="success"
        nzTitle="登出成功">
        <div nz-result-extra>
          <p class="hint-text">您已成功登出系統，感謝使用！</p>
          <p class="hint-text">請手動關閉此瀏覽器分頁</p>
        </div>
      </nz-result>
    </div>
  `,
    styles: [`
    .logout-success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #27496D 100%);
    }
    
    ::ng-deep .ant-result {
      background: white;
      padding: 48px 32px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 600px;
      width: 100%;
    }
    
    .hint-text {
      margin-top: 16px;
      color: #8c8c8c;
      font-size: 18px;
    }
    
    /* 響應式設計 - 手機 */
    @media (max-width: 576px) {
      ::ng-deep .ant-result {
        padding: 32px 20px;
      }
      
      ::ng-deep .ant-result-title {
        font-size: 20px !important;
      }
      
      ::ng-deep .ant-result-subtitle {
        font-size: 18px !important;
      }
      
      .hint-text {
        font-size: 18px;
      }
    }
    
    /* 響應式設計 - 平板 */
    @media (min-width: 577px) and (max-width: 768px) {
      ::ng-deep .ant-result {
        padding: 40px 28px;
      }
      
      ::ng-deep .ant-result-title {
        font-size: 22px !important;
      }
    }
    
    /* 響應式設計 - 小螢幕桌面 */
    @media (min-width: 769px) and (max-width: 992px) {
      ::ng-deep .ant-result {
        padding: 44px 30px;
      }
    }
  `]
})
export class LogoutSuccessComponent implements OnInit {

    ngOnInit(): void {
        // 3 秒後自動嘗試關閉分頁
        setTimeout(() => {
            window.close();
        }, 3000);
    }
}
