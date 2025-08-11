import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IApiResponse, IApiResponsePagePoints } from './model';
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
  getAllPoints(): Observable<IApiResponse<IApiResponsePoints[]>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_all_points`;
    return this.http.get<IApiResponse<IApiResponsePoints[]>>(apiUrl);
  }
  
  // 取得分頁點數
  getPagePoints(page: number, perpage: number): Observable<IApiResponse<IApiResponsePagePoints<IApiResponsePoints>>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_page_points?page=${page}&per_page=${perpage}`;
    return this.http.get<IApiResponse<IApiResponsePagePoints<IApiResponsePoints>>>(apiUrl);
  }

}