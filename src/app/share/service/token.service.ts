import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private tokenKey = 'coffee_auth_token';
    private tokenSubject = new BehaviorSubject<string | null>(this.getToken());

    constructor() { }

    // 儲存 token
    setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
        this.tokenSubject.next(token);
    }

    // 取得 token
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    // 移除 token
    removeToken(): void {
        localStorage.removeItem(this.tokenKey);
        this.tokenSubject.next(null);
    }

    // 檢查是否有 token
    hasToken(): boolean {
        return !!this.getToken();
    }

    // 監聽 token 變化
    get token$() {
        return this.tokenSubject.asObservable();
    }
}