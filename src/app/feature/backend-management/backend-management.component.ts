import {Component,AfterViewInit,ViewChild,ElementRef,OnDestroy,OnInit,Inject,PLATFORM_ID} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; 
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import * as echarts from 'echarts';
import { Observable } from 'rxjs'; 
import { SidebarService } from '../../share/service/sidebar.service';
import { LogService } from '../../share/service/service'; 

// ======================= API 回傳格式介面 =======================
interface IApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

// ======================= 圖表資料結構 =======================
interface WeeklyExchangeData {
  weeks: string[]; // 星期顯示文字
  counts: number[]; // 對應的咖啡兌換數量
}


@Component({
  selector: 'app-backend-management',
  standalone: true,
  imports: [
    NzLayoutModule,
    NzButtonModule,
    NzIconModule,
    NzTypographyModule,
    NzSpinModule,
    CommonModule
  ],
  templateUrl: './backend-management.component.html',
  styleUrl: './backend-management.component.scss'
})
export class BackendManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('echartContainer', { static: false }) chartEl?: ElementRef<HTMLDivElement>;
  private chartInstance?: echarts.ECharts;

// ======================= 狀態控制 =======================
  isLoading = false; // 是否載入中
  hasError = false; // 是否發生錯誤
  errorMessage = ''; // 錯誤訊息內容


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    public sidebarService: SidebarService,
    private logService: LogService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
  }


// ======================= View 初始化完成後 =======================
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initChart(); // 初始化圖表
        this.loadChartData(); // 取得 API 資料
      }, 100);

      window.addEventListener('resize', this.onResize);
    }
  }


// ======================= Component 銷毀 =======================
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
    }

    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

// ======================= 初始化圖表 =======================
  private initChart(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      if (!this.chartEl?.nativeElement) {
        console.error('圖表容器不存在');
        return;
      }

      // 建立 ECharts 實例
      this.chartInstance = echarts.init(this.chartEl.nativeElement);


      // 預設圖表設定
      const option: echarts.EChartsOption = {
        title: { //標題
          text: '本週咖啡兌換數量',
          left: 'center'
        },
        tooltip: { //圖表藍色長條狀註解
          trigger: 'axis',
          formatter: '{b}<br/>兌換數量: {c} 杯'
        },
        xAxis: { //橫軸
          type: 'category',
          name: '星期',
          data: ['載入中...'],
          axisLabel: {
            rotate: 0
          }
        },
        yAxis: { //縱軸
          type: 'value',
          name: '數量(杯)',
          minInterval: 1
        },
        series: [{
          type: 'bar',
          data: [0],
          itemStyle: {
            color: '#718eaaff'
          },
          label: {
            show: true,
            position: 'top'
          }
        }]
      };

      this.chartInstance.setOption(option);
    } catch (e) {
      console.error('echarts 初始化錯誤:', e);
      this.handleErrorDisplay('圖表初始化失敗');
    }
  }


// ======================= 取得圖表資料 =======================
  private loadChartData(deviceId?: string): void {
    this.isLoading = true;
    this.hasError = false;

    const apiCall: Observable<IApiResponse<Array<{weekOfDay: number, coffeeCount: number}>>> =
      this.logService.getWeeklyCoffeeExchange() as Observable<IApiResponse<Array<{weekOfDay: number, coffeeCount: number}>>>;

    apiCall.subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('data:', response.data);


        if (response.isSuccess && response.data) {
          const transformedData = this.transformApiData(response.data);
          
          if (isPlatformBrowser(this.platformId)) {
            this.updateChart(transformedData);
          }
        } else {
          this.handleErrorDisplay(response.message || '取得資料失敗');
          this.showNoData();
        }
      },
      error: (error: any) => {
        console.error('API 錯誤:', error);
        this.handleErrorDisplay('載入資料時發生錯誤');
        this.showNoData();
      }
    });
  }

// ======================= API 資料轉換 =======================
  private transformApiData(apiData: Array<{weekOfDay: number, coffeeCount: number}>): WeeklyExchangeData {
    const weekNames = ['一', '二', '三', '四', '五', '六', '日'];
    
    const weeks = apiData.map(item => weekNames[item.weekOfDay - 1] || `週${item.weekOfDay}`);
    const counts = apiData.map(item => item.coffeeCount);
    
    return { weeks, counts };
  }


// ======================= 錯誤處理 =======================
  private handleErrorDisplay(message: string): void {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = message;

    if (isPlatformBrowser(this.platformId)) {
      this.message.error(this.errorMessage);
    }
  }


// ======================= 無資料顯示 =======================
  private showNoData(): void {
    if (isPlatformBrowser(this.platformId) && this.chartInstance) {
      this.updateChart({ weeks: ['暫無資料'], counts: [0] });
    }
  }

// ======================= 更新圖表資料 =======================
  private updateChart(data: WeeklyExchangeData): void { 
    if (!isPlatformBrowser(this.platformId)) { 
      return; 
    }

    try {
      if (!this.chartInstance) {
        console.error('圖表實例不存在');
        return;
      }

      let weeks: string[] = data.weeks || [];
      let counts: number[] = data.counts || [];

      if (weeks.length === 0 || counts.length === 0) {
        weeks = ['暫無資料'];
        counts = [0];
      }

      const option: echarts.EChartsOption = {
        xAxis: {
          data: weeks
        },
        series: [{
          data: counts
        }]
      };

      this.chartInstance.setOption(option);

    } catch (error) {
      console.error('更新圖表錯誤:', error);
      if (isPlatformBrowser(this.platformId)) {
        this.message.error('圖表更新失敗');
      }
    }
  }


// ======================= 視窗縮放處理 =======================
  private onResize = () => {
    this.chartInstance?.resize();
  };


// ======================= 側邊欄切換 =======================
  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}