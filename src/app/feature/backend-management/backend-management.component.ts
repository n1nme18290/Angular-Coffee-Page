import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
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
    NzSpinModule, CommonModule, CommonHeaderComponent, NzRadioModule, NzDatePickerModule, FormsModule
  ],
  templateUrl: './backend-management.component.html',
  styleUrl: './backend-management.component.scss'
})
export class BackendManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chart2Container', { static: false }) chart2El?: ElementRef<HTMLDivElement>;
  @ViewChild('chart3Container', { static: false }) chart3El?: ElementRef<HTMLDivElement>;

  private chart2Instance?: echarts.ECharts;
  private chart3Instance?: echarts.ECharts;

  chart2Loading = false;
  chart3Loading = false;

  sharedRange: 'day' | 'week' | 'month' = 'week';
  sharedDateRange: [Date, Date] | null = null;

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
        this.initChart2();
        this.initChart3();
        this.loadAllCharts();
      }, 300);
      window.addEventListener('resize', this.onResize);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onResize);
    }
    this.chart2Instance?.dispose();
    this.chart3Instance?.dispose();
  }

  // ======================= 初始化圖表 =======================

  private twoLevelOption(yUnit: string): echarts.EChartsOption {
    return {
      legend: { data: ['教職員', '學生'], top: 4 },
      tooltip: { trigger: 'axis' },
      axisPointer: { link: [{ xAxisIndex: 'all' }] },
      grid: [
        { top: 36,    left: 56, right: 16, height: '35%' },
        { top: '56%', left: 56, right: 16, bottom: 32   }
      ],
      xAxis: [
        { type: 'category', gridIndex: 0, data: ['載入中...'], axisLabel: { show: false } },
        { type: 'category', gridIndex: 1, data: ['載入中...'] }
      ],
      yAxis: [
        { type: 'value', gridIndex: 0, name: `總計(${yUnit})`, minInterval: 1, nameTextStyle: { fontSize: 11 } },
        { type: 'value', gridIndex: 1, name: `分類(${yUnit})`, minInterval: 1, nameTextStyle: { fontSize: 11 } }
      ],
      series: [
        { name: '總計', type: 'bar', xAxisIndex: 0, yAxisIndex: 0, data: [0],
          itemStyle: { color: '#718eaa' }, label: { show: true, position: 'top' } },
        { name: '教職員', type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: [0],
          itemStyle: { color: '#5b8db8' }, label: { show: true, position: 'top' } },
        { name: '學生',   type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: [0],
          itemStyle: { color: '#f4a261' }, label: { show: true, position: 'top' } }
      ]
    } as echarts.EChartsOption;
  }

  private initChart2(): void {
    if (!isPlatformBrowser(this.platformId) || !this.chart2El?.nativeElement) return;
    this.chart2Instance = echarts.init(this.chart2El.nativeElement);
    this.chart2Instance.setOption(this.twoLevelOption('杯'));
    this.chart2Instance.resize();
  }

  private initChart3(): void {
    if (!isPlatformBrowser(this.platformId) || !this.chart3El?.nativeElement) return;
    this.chart3Instance = echarts.init(this.chart3El.nativeElement);
    this.chart3Instance.setOption(this.twoLevelOption('點'));
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

  loadAllCharts(): void {
    this.loadChart2Data();
    this.loadChart3Data();
  }

  private getSharedDates(): { startDate?: string; endDate?: string } {
    if (!this.sharedDateRange) return {};
    return {
      startDate: this.toDateString(this.sharedDateRange[0]),
      endDate:   this.toDateString(this.sharedDateRange[1])
    };
  }

  // 圖表二：{label, staff_count, student_count, total_count}
  loadChart2Data(): void {
    this.chart2Loading = true;
    const { startDate, endDate } = this.getSharedDates();
    this.logService.getExchangeByIdentity(this.sharedRange, startDate, endDate).subscribe({
      next: (res) => {
        this.chart2Loading = false;
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const labels       = res.data.map((item: any) => this.formatXAxisLabel(item.label ?? '', this.sharedRange));
          const totalValues  = res.data.map((item: any) => item.total_count   ?? 0);
          const staffValues  = res.data.map((item: any) => item.staff_count   ?? 0);
          const studentValues = res.data.map((item: any) => item.student_count ?? 0);
          this.chart2Instance?.setOption({
            xAxis: [{ data: labels }, { data: labels }],
            series: [{ data: totalValues }, { data: staffValues }, { data: studentValues }]
          });
        } else {
          this.chart2Instance?.setOption({
            xAxis: [{ data: ['暫無資料'] }, { data: ['暫無資料'] }],
            series: [{ data: [0] }, { data: [0] }, { data: [0] }]
          });
        }
        this.chart2Instance?.resize();
      },
      error: (err) => {
        console.error('Chart2 error:', err);
        this.chart2Loading = false;
        this.chart2Instance?.setOption({
          xAxis: [{ data: ['載入失敗'] }, { data: ['載入失敗'] }],
          series: [{ data: [0] }, { data: [0] }, { data: [0] }]
        });
        this.chart2Instance?.resize();
      }
    });
  }

  // 圖表三：{label, staff_points, student_points, total_points}
  loadChart3Data(): void {
    this.chart3Loading = true;
    const { startDate, endDate } = this.getSharedDates();
    this.logService.getPointsIssuedByRange(this.sharedRange, startDate, endDate).subscribe({
      next: (res) => {
        this.chart3Loading = false;
        if (res?.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
          const labels        = res.data.map((item: any) => this.formatXAxisLabel(item.label ?? '', this.sharedRange));
          const totalValues   = res.data.map((item: any) => item.total_points   ?? 0);
          const staffValues   = res.data.map((item: any) => item.staff_points   ?? 0);
          const studentValues = res.data.map((item: any) => item.student_points ?? 0);
          this.chart3Instance?.setOption({
            xAxis: [{ data: labels }, { data: labels }],
            series: [{ data: totalValues }, { data: staffValues }, { data: studentValues }]
          });
        } else {
          this.chart3Instance?.setOption({
            xAxis: [{ data: ['暫無資料'] }, { data: ['暫無資料'] }],
            series: [{ data: [0] }, { data: [0] }, { data: [0] }]
          });
        }
        this.chart3Instance?.resize();
      },
      error: (err) => {
        console.error('Chart3 error:', err);
        this.chart3Loading = false;
        this.chart3Instance?.setOption({
          xAxis: [{ data: ['載入失敗'] }, { data: ['載入失敗'] }],
          series: [{ data: [0] }, { data: [0] }, { data: [0] }]
        });
        this.chart3Instance?.resize();
      }
    });
  }

  private toDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // ======================= 視窗縮放 =======================

  private onResize = (): void => {
    this.chart2Instance?.resize();
    this.chart3Instance?.resize();
  };

  toggleCollapsed(): void {
    this.sidebarService.toggleCollapsed();
  }
}
