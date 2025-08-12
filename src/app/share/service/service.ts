import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IApiResponse, IApiResponsePages, IApiResponsePointsHistory } from './model';
import { IApiResponsePoints } from './model';

@Injectable({
  providedIn: 'root'
})
export class PointService {
  
  constructor() { }
  http = inject(HttpClient);
  url = 'http://10.25.1.172:5054';
  PointsUrl = "/Points/Points/";

  // 取得所有點數
  // getAllPoints(): Observable<IApiResponse<IApiResponsePoints[]>> {
  //   const apiUrl = `${this.url}${this.PointsUrl}get_all_points`;
  //   return this.http.get<IApiResponse<IApiResponsePoints[]>>(apiUrl);
  // }
  
  // 取得分頁點數
  getPagePoints(page: number, perpage: number): Observable<IApiResponse<IApiResponsePages<IApiResponsePoints>>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_page_points?page=${page}&per_page=${perpage}`;
    return this.http.get<IApiResponse<IApiResponsePages<IApiResponsePoints>>>(apiUrl);
  }

  // 取得單一點數
  getPointByMemberId(memberId: string): Observable<IApiResponse<IApiResponsePoints>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_member_points`;
    const requestBody = {
      memberId: memberId
    };
    return this.http.post<IApiResponse<IApiResponsePoints>>(apiUrl, requestBody);
  }

  // 轉贈點數
  addMemberpoints(memberId: string, targetMemberId: string, balance: number): Observable<IApiResponse<IApiResponsePoints>> {
    const apiUrl = `${this.url}${this.PointsUrl}add_member_points`;
    const requestBody = {
      memberId: memberId,
      targetMemberId: targetMemberId,
      balance: balance
    };
    return this.http.put<IApiResponse<IApiResponsePoints>>(apiUrl, requestBody);
  }


  // Log 相關API
  // 查詢指定會員的點數異動紀錄
  getMemberLog(memberId: string, page: number, perPage: number): Observable<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_member_log?page=${page}&perPage=${perPage}`;
    const requestBody = {
      memberId: memberId,
    };
    return this.http.post<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>>(apiUrl, requestBody);
  }
  getAllLog(): Observable<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_all_log`;
    return this.http.get<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>>(apiUrl);
  }
  // 分頁查詢點數異動紀錄
  getPageLog(page: number, perPage: number): Observable<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_page_log?page=${page}&perPage=${perPage}`;
    return this.http.get<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>>(apiUrl);
  }


}