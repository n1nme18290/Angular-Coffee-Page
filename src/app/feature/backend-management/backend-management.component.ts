import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';
import { SidebarService } from '../../share/service/sidebar.service';
import { LogService } from '../../share/service/service';
import { TokenService } from '../../share/service/token.service';
import { CommonHeaderComponent } from '../../share/common-header/common-header.component';

@Component({
  selector: 'app-backend-management',
  standalone: true,
  imports: [
    NzLayoutModule, NzButtonModule, NzIconModule, NzTypographyModule,
    NzSpinModule, CommonModule, CommonHeaderComponent, NzRadioModule, FormsModule
  ],
  templateUrl: './backend-management.component.html',
  styleUrl: './backend-management.component.scss'
})
export class BackendManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chart1Container', { static: false }) chart1El?: ElementRef<HTMLDivElement>;
  @ViewChild('chart2Container', { static: false }) chart2El?: ElementRef<HTMLDivElement>;
  @ViewChild('chart3Container', { static: false }) chart3El?: ElementRef<HTMLDivElement>;

  private chart1Instance?: echarts.ECharts;
  private chart2Instance?: echarts.ECharts;
  private chart3Instance?: echarts.ECharts;

  chart1Loading = false;
  chart2Loading = false;
  chart3Loading = false;

  chart1Range: 'day' | 'week' | 'month' = 'week';
  chart2Range: 'day' | 'week' | 'month' = 'week';
  chart3Range: 'day' | 'week' | 'month' = 'week';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public sidebarService: SidebarService,
    private logService: LogService,
    private message: NzMessageService,
    private tokenService: TokenService
  ) {}

  get currentUsername(): string {
    return this.tokenService.getUsername();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initChart1();
        this.initChart2();
        this.initChart3();
        this.loadChart1Data();
        this.loadChart2Data();
        this.loadChart3Data();
      }, 300);
      window.addEventListener('resize', this.onResize);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
    }
    this.chart1Instance?.dispose();
    this.chart2Instance?.dispose();
    this.chart3Instance?.dispose();
  }

  // ======================= 初始化圖表 =======================

  private initChart1(): void {
    if (!isPlatformBrowser(this.platformId) || !this.chart1El?.nativeElement) return;
    this.chart1Instance = echarts.init(this.chart1El.nativeElement);
    this.chart1Instance.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>兌換數量: {c} 杯' },
      grid: { top: 42, left: 12, right: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'category', data: ['載入中...'] },
      yAxis: { type: 'value', name: '數量(杯)', minInterval: 1 },
      series: [{
        type: 'bar', data: [0],
        itemStyle: { color: '#718eaa' },
        label: { show: true, position: 'top' }
      }]
    } as echarts.EChartsOption);
    this.chart1Instance.resize();
  }

  private initChart2(): void {
    if (!isPlatformBrowser(this.platformId) || !this.chart2El?.nativeElement) return;
    this.chart2Instance = echarts.init(this.chart2El.nativeElement);
    // 單系列：X軸為身分別（教職員/學生），各 bar 不同顏色
    this.chart2Instance.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>兌換數量: {c} 杯' },
      grid: { top: 42, left: 12, right: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'category', data: ['載入中...'] },
      yAxis: { type: 'value', name: '數量(杯)', minInterval: 1 },
      series: [{
        type: 'bar', data: [0],
        itemStyle: {
          color: (params: any) => ['#5b8db8', '#f4a261'][params.dataIndex % 2]
        },
        label: { show: true, position: 'top' }
      }]
    } as echarts.EChartsOption);
    this.chart2Instance.resize();
  }

  private initChart3(): void {
    if (!isPlatformBrowser(this.platformId) || !this.chart3El?.nativeElement) return;
    this.chart3Instance = echarts.init(this.chart3El.nativeElement);
    this.chart3Instance.setOption({
      tooltip: { trigger: 'axis', formatter: '{b}<br/>發放數量: {c} 點' },
      grid: { top: 42, left: 12, right: 8, bottom: 8, containLabel: true },
      xAxis: { type: 'category', data: ['載入中...'] },
      yAxis: { type: 'value', name: '數量(點)', minInterval: 1 },
      series: [{
        type: 'bar', data: [0],
        itemStyle: { color: '#2a9d8f' },
        label: { show: true, position: 'top' }
      }]
    } as echarts.EChartsOption);
    this.chart3Instance.resize();
  }

  // ======================= 載入資料 =======================

  // "YYYY-Wnn" → "MM/DD~MM/DD"（往前推七天至今日）
  // "YYYY-MM-DD" → "週X"
  private formatWeekLabel(label: string): string {
    if (/^\d{4}-W\d{1,2}$/.test(label)) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return `${this.toMMDD(start)} ~ ${this.toMMDD(today)}`;
    }
    const parts = label.split('-');
    if (parts.length === 3) {
      const date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      return ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][date.getDay()];
    }
    return label;
  }

  private toMMDD(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${m}-${d}`;
  }

  private formatXAxisLabel(label: string, range: 'day' | 'week' | 'month'): string {
    if (range === 'week') return this.formatWeekLabel(label);
    if (range === 'day') {
      // "YYYY-MM-DD" → "MM-DD"
      const parts = label.split('-');
      if (parts.length === 3) return `${parts[1]}-${parts[2]}`;
    }
    return label;
  }

  // 圖表一：{label, total_count}
  loadChart1Data(): void {
    this.chart1Loading = true;
    this.logService.getExchangeSummary(this.chart1Range).subscribe({
      next: (res) => {
        this.chart1Loading = false;
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const labels = res.data.map((item: any) => this.formatXAxisLabel(item.label ?? '', this.chart1Range));
          const values = res.data.map((item: any) => item.total_count ?? 0);
          this.chart1Instance?.setOption({ xAxis: { data: labels }, series: [{ data: values }] });
        } else {
          this.chart1Instance?.setOption({ xAxis: { data: ['暫無資料'] }, series: [{ data: [0] }] });
        }
        this.chart1Instance?.resize();
      },
      error: (err) => {
        console.error('Chart1 error:', err);
        this.chart1Loading = false;
        this.chart1Instance?.setOption({ xAxis: { data: ['載入失敗'] }, series: [{ data: [0] }] });
        this.chart1Instance?.resize();
      }
    });
  }

  // 圖表二：{identity_type, total_count}
  loadChart2Data(): void {
    this.chart2Loading = true;
    this.logService.getExchangeByIdentity(this.chart2Range).subscribe({
      next: (res) => {
        this.chart2Loading = false;
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const labels = res.data.map((item: any) => item.identity_type ?? '');
          const values = res.data.map((item: any) => item.total_count ?? 0);
          this.chart2Instance?.setOption({ xAxis: { data: labels }, series: [{ data: values }] });
        } else {
          this.chart2Instance?.setOption({ xAxis: { data: ['暫無資料'] }, series: [{ data: [0] }] });
        }
        this.chart2Instance?.resize();
      },
      error: (err) => {
        console.error('Chart2 error:', err);
        this.chart2Loading = false;
        this.chart2Instance?.setOption({ xAxis: { data: ['載入失敗'] }, series: [{ data: [0] }] });
        this.chart2Instance?.resize();
      }
    });
  }

  // 圖表三：{label, total_points}
  loadChart3Data(): void {
    this.chart3Loading = true;
    this.logService.getPointsIssuedByRange(this.chart3Range).subscribe({
      next: (res) => {
        this.chart3Loading = false;
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const labels = res.data.map((item: any) => this.formatXAxisLabel(item.label ?? '', this.chart3Range));
          const values = res.data.map((item: any) => item.total_points ?? 0);
          this.chart3Instance?.setOption({ xAxis: { data: labels }, series: [{ data: values }] });
        } else {
          this.chart3Instance?.setOption({ xAxis: { data: ['暫無資料'] }, series: [{ data: [0] }] });
        }
        this.chart3Instance?.resize();
      },
      error: (err) => {
        console.error('Chart3 error:', err);
        this.chart3Loading = false;
        this.chart3Instance?.setOption({ xAxis: { data: ['載入失敗'] }, series: [{ data: [0] }] });
        this.chart3Instance?.resize();
      }
    });
  }

  // ======================= 視窗縮放 =======================

  private onResize = (): void => {
    this.chart1Instance?.resize();
    this.chart2Instance?.resize();
    this.chart3Instance?.resize();
  };

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}
