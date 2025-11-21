// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthTokenService {
    private http = inject(HttpClient);
    private memberIdSubject = new BehaviorSubject<string | null>(null);
    public memberId$ = this.memberIdSubject.asObservable();

    constructor() {
        this.initializeMemberIdFromToken();
    }

    // 從 SSO token 中提取 memberId
    private initializeMemberIdFromToken(): void {
        const token = this.getTokenFromHeader();
        if (token) {
            const memberId = this.extractMemberIdFromToken(token);
            this.memberIdSubject.next(memberId);
        }
    }

    // 從 localStorage 或 sessionStorage 取得 token
    private getTokenFromHeader(): string | null {
        // 根據您的 SSO 實作方式調整
        return localStorage.getItem('sso_token') ||
            sessionStorage.getItem('sso_token') ||
            this.getCookieValue('sso_token');
    }

    // 從 cookie 取得 token
    private getCookieValue(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    }

    // 解析 JWT token 取得 memberId
    private extractMemberIdFromToken(token: string): string | null {
        try {
            // 如果是 JWT token
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.memberId || payload.sub || payload.user_id || null;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    // 取得當前 memberId
    getCurrentMemberId(): string | null {
        return this.memberIdSubject.value;
    }

    // 設定 memberId (如果需要手動設定)
    setMemberId(memberId: string): void {
        this.memberIdSubject.next(memberId);
    }

    // 清除 memberId (登出時使用)
    clearMemberId(): void {
        this.memberIdSubject.next(null);
    }

    // 取得 HTTP Headers (包含 authorization)
    getAuthHeaders(): HttpHeaders {
        const token = this.getTokenFromHeader();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }
}