import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';

import * as echarts from 'echarts';

import { SidebarService } from '../../share/service/sidebar.service';
import { LogService } from '../../share/service/service';
import { IApiResponsePointsHistory } from '../../share/service/model';

@Component({
  selector: 'app-backend-management',
  standalone: true,
  imports: [
    NzLayoutModule, NzButtonModule, NzIconModule, NzInputModule, NzTypographyModule, NzDropDownModule, FormsModule,
    NzSelectModule, NzSwitchModule, NzAvatarModule, NzTabsModule, NzPageHeaderModule, NzDrawerModule,
    NzRadioModule, NzModalModule, CommonModule
  ],
  templateUrl: './backend-management.component.html',
  styleUrl: './backend-management.component.scss'
})
export class BackendManagementComponent implements AfterViewInit, OnDestroy {
  @ViewChild('echartContainer', { static: true }) chartEl!: ElementRef<HTMLDivElement>;
  private chartInstance?: echarts.ECharts;

  constructor(
    public sidebarService: SidebarService,
    private logService: LogService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChartData();
      window.addEventListener('resize', this.onResize);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
      this.chartInstance?.dispose();
    }
  }

  private loadChartData(): void {
    //取得所有點數異動紀錄
    this.logService.getAllLog().subscribe({
      next: (res: any) => {
        if (res && res.isSuccess && res.data) {
          const allData = res.data;

          const coffeeData = allData.filter((item: any) => 
            item.type === 'exchange_coffee' || item.type === 'exchange_product'
          );
          
          // 生成圖表
          this.processDataAndInitChart(coffeeData);
        } else {
          console.warn('No data or unsuccessful response');
          this.initChart({});
        }
      },
      error: (error) => {
        console.error('Error fetching points history:', error);
 
        this.initChart({});
      }
    });
  }

  private processDataAndInitChart(data: IApiResponsePointsHistory[]): void {
    // 月份
    const monthlyStats: { [key: string]: { americano: number; latte: number } } = {};

    data.forEach(item => {

      const dateStr = item.created_at;
      const month = dateStr.substring(5, 7);
      const monthKey = `${parseInt(month)}月`; 

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { americano: 0, latte: 0 };
      }

      //判斷咖啡類型
      const amount = Math.abs(item.amount);
      if (amount === 20) {
        monthlyStats[monthKey].americano++;
      } else if (amount === 25) {
        monthlyStats[monthKey].latte++;
      }
    });


    const chartData = this.convertToChartData(monthlyStats);
    this.initChart(chartData);
  }

  private convertToChartData(stats: { [key: string]: { americano: number; latte: number } }): any {
    // 排序月份
    const months = Object.keys(stats).sort((a, b) => {
      const monthA = parseInt(a.replace('月', ''));
      const monthB = parseInt(b.replace('月', ''));
      return monthA - monthB;
    });


    if (months.length === 0) {
      return {};
    }


    const source: any[] = [['product', '美式咖啡', '拿鐵']];
    
    months.forEach(month => {
      source.push([
        month,
        stats[month].americano,
        stats[month].latte
      ]);
    });

    return { source };
  }

  private initChart(dataset: any): void {
    try {
      this.chartInstance = echarts.init(this.chartEl.nativeElement);
      
      //沒有資料空圖表
      const hasData = dataset.source && dataset.source.length > 1;
      
      const option: echarts.EChartsOption = {
        title: {
          text: '咖啡兌換統計',
          left: 'center'
        },
        legend: {
          bottom: 10,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        dataset: hasData ? dataset : {
          source: [
            ['product', '美式咖啡', '拿鐵'],
            ['暫無資料', 0, 0]
          ]
        },
        xAxis: { 
          type: 'category',
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '兌換次數',
          minInterval: 1
        },
        series: [
          { 
            type: 'bar',
            itemStyle: {
              color: '#5470c6'
            }
          }, 
          { 
            type: 'bar',
            itemStyle: {
              color: '#91cc75'
            }
          }
        ]
      };
      
      this.chartInstance.setOption(option);
    } catch (e) {
      console.error('echarts init error', e);
    }
  }

  private onResize = () => {
    this.chartInstance?.resize();
  };

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}