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


interface IApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
}

interface WeeklyExchangeData {
  weeks: string[]; 
  counts: number[]; 
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

  isLoading = false;
  hasError = false;
  errorMessage = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    public sidebarService: SidebarService,
    private logService: LogService,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initChart();
        this.loadChartData();
      }, 100);

      window.addEventListener('resize', this.onResize);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
    }

    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  private initChart(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      if (!this.chartEl?.nativeElement) {
        console.error('圖表容器不存在');
        return;
      }

      this.chartInstance = echarts.init(this.chartEl.nativeElement);

      const option: echarts.EChartsOption = {
        title: {
          text: '本週咖啡兌換數量',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>兌換數量: {c} 杯'
        },
        xAxis: {
          type: 'category',
          name: '星期',
          data: ['載入中...'],
          axisLabel: {
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '數量(杯)',
          minInterval: 1
        },
        series: [{
          type: 'bar',
          data: [0],
          itemStyle: {
            color: '#1890ff'
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

  private loadChartData(deviceId?: string): void {
    this.isLoading = true;
    this.hasError = false;

    const apiCall: Observable<IApiResponse<Array<{weekOfDay: number, coffeeCount: number}>>> =
      this.logService.getWeeklyCoffeeExchange(deviceId) as Observable<IApiResponse<Array<{weekOfDay: number, coffeeCount: number}>>>;

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

  private transformApiData(apiData: Array<{weekOfDay: number, coffeeCount: number}>): WeeklyExchangeData {
    const weekNames = ['一', '二', '三', '四', '五', '六', '日'];
    
    const weeks = apiData.map(item => weekNames[item.weekOfDay - 1] || `週${item.weekOfDay}`);
    const counts = apiData.map(item => item.coffeeCount);
    
    return { weeks, counts };
  }

  private handleErrorDisplay(message: string): void {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = message;

    if (isPlatformBrowser(this.platformId)) {
      this.message.error(this.errorMessage);
    }
  }

  private showNoData(): void {
    if (isPlatformBrowser(this.platformId) && this.chartInstance) {
      this.updateChart({ weeks: ['暫無資料'], counts: [0] });
    }
  }

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

  private onResize = () => {
    this.chartInstance?.resize();
  };

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}