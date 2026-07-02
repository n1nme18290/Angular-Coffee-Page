import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isCollapsed = false;
  showSidebar = true; // ✅ 新增：控制側邊欄顯示

  constructor() { }

  // 切換側邊欄展開/收起狀態
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // ✅ 新增：切換方法（兼容舊寫法）
  toggle(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  // ✅ 新增：收起側邊欄
  collapse(): void {
    this.isCollapsed = true;
  }

  // ✅ 新增：展開側邊欄
  expand(): void {
    this.isCollapsed = false;
  }

  // ✅ 新增：設定側邊欄顯示狀態
  setShowSidebar(show: boolean): void {
    this.showSidebar = show;
  }

  // ✅ 新增：取得側邊欄顯示狀態
  getShowSidebar(): boolean {
    return this.showSidebar;
  }
}