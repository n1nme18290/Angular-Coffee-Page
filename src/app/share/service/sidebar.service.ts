import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isCollapsed = false;

  // 切換側邊欄展開/收起狀態
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}