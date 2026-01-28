import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private baseTokenKey = 'coffee_auth_token';
    private baseMemberIdKey = 'coffee_member_id';
    private baseAdminIdKey = 'coffee_admin_id';

    private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
    private memberIdSubject = new BehaviorSubject<string | null>(this.getMemberId());

    constructor() { }

    // 獲取當前用戶的 token key
    private getTokenKey(): string {
        const currentUserToken = `${this.baseTokenKey}`;
        return currentUserToken;
    }

    // 獲取當前用戶的 member ID key
    private getMemberIdKey(): string {
        const currentUserMemberId = `${this.baseMemberIdKey}`;
        return currentUserMemberId;
    }
    // 獲取當前管理員的 admin ID key
    private getAdminIdKey(): string {
        const currentUserAdminId = `${this.baseAdminIdKey}`;
        return currentUserAdminId;
    }

    // 獲取當前用戶 ID
    getCurrentUserId(name?: string): string | null {
        return localStorage.getItem(name ? `${this.baseMemberIdKey}_${name}` : this.baseMemberIdKey);
    }

    // 獲取當前管理員 ID
    getCurrentAdminId(name?: string): string | null {
        return localStorage.getItem(name ? `${this.baseAdminIdKey}_${name}` : this.baseAdminIdKey);
    }

    // Token 相關方法
    setToken(token: string): void {
        const tokenKey = this.getTokenKey();
        localStorage.setItem(tokenKey, token);
    }

    getToken(): string | null {
        const tokenKey = this.getTokenKey();
        return localStorage.getItem(tokenKey);
    }

    removeToken(): void {
        const tokenKey = this.getTokenKey();
        localStorage.removeItem(tokenKey);
    }

    hasToken(): boolean {
        return !!this.getToken();
    }

    // Member ID 相關方法
    setMemberId(memberId: string): void {
        const memberIdKey = this.getMemberIdKey();
        localStorage.setItem(memberIdKey, memberId);
    }

    setCurrentAdminId(adminId: string): void {
        const adminIdKey = this.getAdminIdKey();
        localStorage.setItem(adminIdKey, adminId);
    }

    getMemberId(): string {
        const memberIdKey = this.getMemberIdKey();
        return localStorage.getItem(memberIdKey) || '';
    }

    removeMemberId(): void {
        const memberIdKey = this.getMemberIdKey();
        localStorage.removeItem(memberIdKey);
        this.memberIdSubject.next(null);
    }

    hasMemberId(): boolean {
        return !!this.getMemberId();
    }

    // Admin ID 相關方法
    removeAdminId(): void {
        const adminIdKey = this.getAdminIdKey();
        localStorage.removeItem(adminIdKey);
        console.log('✅ Admin ID 已清除:', adminIdKey);
    }
    
    // Observable 以便訂閱 token 和 member ID 的變化
    get token$() {
        return this.tokenSubject.asObservable();
    }

    get memberId$() {
        return this.memberIdSubject.asObservable();
    }
}