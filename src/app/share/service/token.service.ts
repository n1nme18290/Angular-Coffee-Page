import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private platformId = inject(PLATFORM_ID);
    private baseTokenKey = 'coffee_auth_token';
    private baseMemberIdKey = 'coffee_member_id';
    private baseAdminIdKey = 'coffee_admin_id';
    private baseUsernameKey = 'coffee_username';

    private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
    private memberIdSubject = new BehaviorSubject<string | null>(this.getMemberId());

    constructor() { }

    private get storage(): Storage | null {
        return isPlatformBrowser(this.platformId) ? localStorage : null;
    }

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
        return this.storage?.getItem(name ? `${this.baseMemberIdKey}_${name}` : this.baseMemberIdKey) ?? null;
    }

    // 獲取當前管理員 ID
    getCurrentAdminId(name?: string): string | null {
        return this.storage?.getItem(name ? `${this.baseAdminIdKey}_${name}` : this.baseAdminIdKey) ?? null;
    }

    // Token 相關方法
    setToken(token: string): void {
        this.storage?.setItem(this.getTokenKey(), token);
    }

    getToken(): string | null {
        return this.storage?.getItem(this.getTokenKey()) ?? null;
    }

    removeToken(): void {
        this.storage?.removeItem(this.getTokenKey());
    }

    hasToken(): boolean {
        return !!this.getToken();
    }

    // Member ID 相關方法
    setMemberId(memberId: string): void {
        this.storage?.setItem(this.getMemberIdKey(), memberId);
    }

    setCurrentAdminId(adminId: string): void {
        this.storage?.setItem(this.getAdminIdKey(), adminId);
    }

    getMemberId(): string {
        return this.storage?.getItem(this.getMemberIdKey()) || '';
    }

    removeMemberId(): void {
        this.storage?.removeItem(this.getMemberIdKey());
        this.memberIdSubject.next(null);
    }

    hasMemberId(): boolean {
        return !!this.getMemberId();
    }

    // Admin ID 相關方法
    removeAdminId(): void {
        this.storage?.removeItem(this.getAdminIdKey());
    }

    // Username 相關方法
    setUsername(username: string): void {
        this.storage?.setItem(this.baseUsernameKey, username);
    }

    getUsername(): string {
        return this.storage?.getItem(this.baseUsernameKey) || '使用者';
    }

    removeUsername(): void {
        this.storage?.removeItem(this.baseUsernameKey);
    }
    
    // Observable 以便訂閱 token 和 member ID 的變化
    get token$() {
        return this.tokenSubject.asObservable();
    }

    get memberId$() {
        return this.memberIdSubject.asObservable();
    }
}