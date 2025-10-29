import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
export class BackendManagementComponent implements AfterViewInit {
  @ViewChild('echartContainer', { static: true }) chartEl!: ElementRef<HTMLDivElement>;
  private chartInstance?: echarts.ECharts;

  constructor(public sidebarService: SidebarService) { }

  ngAfterViewInit(): void {
    this.initChart();
    window.addEventListener('resize', this.onResize);
  }

  private initChart(): void {
    try {
      this.chartInstance = echarts.init(this.chartEl.nativeElement);
      const option = {
        legend: {},
        tooltip: {},
        dataset: {
          source: [
            ['product', '2015', '2016', '2017'],
            ['Matcha Latte', 43.3, 85.8, 93.7],
            ['Milk Tea', 83.1, 73.4, 55.1],
            ['Cheese Cocoa', 86.4, 65.2, 82.5],
            ['Walnut Brownie', 72.4, 53.9, 39.1]
          ]
        },
        xAxis: { type: 'category' },
        yAxis: {},
        series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }]
      };
      this.chartInstance.setOption(option);
    } catch (e) {
      console.error('echarts init error', e);
    }
  }

  RandomDataset(): void {
    if (!this.chartInstance) return;
    this.chartInstance.setOption({
      dataset: {
        source: [
          ['product', '2015', '2016', '2017'],
          ['Matcha Latte', ...this.getRandomValues()],
          ['Milk Tea', ...this.getRandomValues()],
          ['Cheese Cocoa', ...this.getRandomValues()],
          ['Walnut Brownie', ...this.getRandomValues()]
        ]
      }
    });
  }

  private getRandomValues(): number[] {
    const res: number[] = [];
    for (let i = 0; i < 3; i++) res.push(Math.random() * 100);
    return res;
  }

  private onResize = () => {
    this.chartInstance?.resize();
  };

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}