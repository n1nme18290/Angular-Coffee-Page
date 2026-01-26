import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable, Type } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IApiResponse, IApiResponseAdmin, IApiResponseAdminLogin, IApiResponseDevice, IApiResponseMember, IApiResponseNormal, IApiResponsePages, IApiResponsePointsHistory, IApiResponseGetProduct, IApiResponseGetPageProduct, IApiResponseProductList, IApiResponseGetPageDeviceLog, IApiResponseMemberSSOLogin, IApiResponseSecurityRole, IApiResponseDeviceState, IApiResponseNormal2 } from './model';
import { IApiResponsePoints } from './model';
import { TokenService } from '../service/token.service';

@Injectable({
  providedIn: 'root'
})
// 基底服務類別
export abstract class BaseService {
  protected http = inject(HttpClient);
  // 建升的伺服器
  // protected readonly url = 'http://10.25.1.101:5054';
  // 峻嘉的伺服器
  protected readonly url = 'http://163.17.136.69:11538';
  protected readonly PointsUrl = "/Points/Points/";
  protected readonly LogUrl = "/Logs/Log/";
  protected readonly ProductUrl = "/Product/Product/";
  protected readonly AdminUrl = "/Admin/Admin/";
  protected readonly AuthUrl = "/Auth/Auth/";
  protected readonly MemberUrl = "/Member/Member/";
  protected readonly DeviceUrl = "/Device/Device/";
  protected readonly SecurityUrl = "/Security/Role/";
  protected readonly AccessUrl = "/Security/Access/";
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  // 不需要 token 的 API 路徑
  const excludePaths = [
    '/Auth/Auth/admin_login',
    '/Auth/Auth/sso_login'
  ];

  // 檢查是否為排除的路徑
  const shouldExclude = excludePaths.some(path => req.url.includes(path));

  // 如果有 token 且不在排除路徑中，加入 Authorization header
  if (token && !shouldExclude) {
    const authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
@Injectable({
  providedIn: 'root'
})
// Points 相關API
export class PointService extends BaseService {
  constructor() {
    super();
  }
  // 取得所有點數
  getAllPoints(): Observable<IApiResponse<IApiResponsePoints[]>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_all_points`;
    return this.http.get<IApiResponse<IApiResponsePoints[]>>(apiUrl);
  }
  // 取得分頁點數
  getPagePoints(page: number, perpage: number): Observable<IApiResponse<IApiResponsePages<IApiResponsePoints>>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_page_points?page=${page}&per_page=${perpage}`;
    return this.http.get<IApiResponse<IApiResponsePages<IApiResponsePoints>>>(apiUrl);
  }
  // 取得單一點數
  getPointByMemberId(memberId: string): Observable<IApiResponse<IApiResponsePoints>> {
    const apiUrl = `${this.url}${this.PointsUrl}get_member_points`;
    const requestBody = {
      id: memberId
    };
    return this.http.post<IApiResponse<IApiResponsePoints>>(apiUrl, requestBody);
  }
  // 轉贈點數
  addMemberpoints(memberId: string, targetMemberId: string, balance: number): Observable<IApiResponse<IApiResponsePoints>> {
    const apiUrl = `${this.url}${this.PointsUrl}add_member_points`;
    const requestBody = {
      memberId: memberId,
      studentId: targetMemberId,
      balance: balance
    };
    return this.http.put<IApiResponse<IApiResponsePoints>>(apiUrl, requestBody);
  }
  // 兌換商品
  exchangeProduct(memberId: string, productId: string, quantity: number): Observable<IApiResponse<IApiResponsePoints>> {
    const apiUrl = `${this.url}${this.PointsUrl}exchange_product`;
    const requestBody = {
      memberId: memberId,
      productId: productId,
      quantity: quantity
    };
    return this.http.put<IApiResponse<IApiResponsePoints>>(apiUrl, requestBody);
  }
}

// Log 相關API
@Injectable({
  providedIn: 'root'
})
export class LogService extends BaseService {
  constructor() {
    super();
  }
  // 查詢指定會員的點數異動紀錄
  getMemberLog(memberId: string, page: number, perPage: number): Observable<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>> {
    const apiUrl = `${this.url}${this.LogUrl}get_member_log?page=${page}&perPage=${perPage}`;
    const requestBody = {
      id: memberId,
    };
    return this.http.post<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>>(apiUrl, requestBody);
  }
  // 查詢所有點數異動紀錄
  getAllLog(): Observable<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>> {
    const apiUrl = `${this.url}${this.LogUrl}get_all_log`;
    return this.http.get<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>>(apiUrl);
  }
  // 分頁查詢點數異動紀錄 新
  searchPointLog(
    page: number,
    perPage: number,
    name?: string,
    type?: string
  ): Observable<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>> {
    const apiUrl = `${this.url}${this.LogUrl}search_point_log?page=${page}&perPage=${perPage}`;

    const body: any = {};
    if (name) body.name = name;
    if (type) body.type = type;

    return this.http.post<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>>(apiUrl, body);
  }


  // 分頁查詢點數異動紀錄
  // getPageLog(page: number, perPage: number): Observable<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>> {
  //   const apiUrl = `${this.url}${this.LogUrl}get_page_log?page=${page}&perPage=${perPage}`;
  //   return this.http.get<IApiResponse<IApiResponsePages<IApiResponsePointsHistory>>>(apiUrl);
  // }


  // 分頁查詢設備操作紀錄
  getPageDeviceLog(
  page: number, 
  perpage: number, 
  deviceName?: string | null,
  operationType?: string | null,
  sortOrder?: 'asc' | 'desc' | null
) {
  // 準備 query parameters
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('perPage', String(perpage));
  
  // 準備 request body
  const requestBody: any = {};
  
  if (deviceName) {
    requestBody.device_name = deviceName;
  }
  
  if (operationType) {
    requestBody.type = operationType;
  }
  
  const apiUrl = `${this.url}${this.LogUrl}get_device_log?${params.toString()}`;
  
  return this.http.post<IApiResponse<IApiResponsePages<IApiResponseGetPageDeviceLog>>>(
    apiUrl, 
    requestBody
  );
}
  // getPageDeviceLog(page: number, perPage: number): Observable<IApiResponse<IApiResponsePages<IApiResponseGetPageDeviceLog>>> {
  //   const apiUrl = `${this.url}${this.LogUrl}get_device_log?page=${page}&perPage=${perPage}`;
  //   return this.http.get<IApiResponse<IApiResponsePages<IApiResponseGetPageDeviceLog>>>(apiUrl);
  // }

  // 取得本月每週咖啡兌換數量
  getWeeklyCoffeeExchange(deviceId?: string): Observable<IApiResponse<any>> {
    let apiUrl = `${this.url}${this.LogUrl}get_weekly_coffee_exchange`;

    if (deviceId) {
      apiUrl += `?device_id=${deviceId}`;
    }

    return this.http.get<IApiResponse<any>>(apiUrl);
  }
}

// Product 相關Api，應該用不到了
@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService {
  constructor() {
    super();
  }
  // 建立商品品項
  // createProduct(name: string, description: string, category: string, points_required: number, status: number): Observable<IApiResponse<IApiResponsePoints>> {
  //   const apiUrl = `${this.url}${this.ProductUrl}create_product`;
  //   const requestBody = {
  //     name: name,
  //     description: description,
  //     category: category,
  //     points_required: points_required,
  //     status: status
  //   };
  //   return this.http.post<IApiResponse<IApiResponsePoints>>(apiUrl, requestBody);
  // }
  // 分頁查詢商品項目
  // getPageProduct(page: number, perPage: number): Observable<IApiResponse<IApiResponsePages<IApiResponseGetPageProduct>>> {
  //   const apiUrl = `${this.url}${this.ProductUrl}get_page_product?page=${page}&perPage=${perPage}`;
  //   return this.http.get<IApiResponse<IApiResponsePages<IApiResponseGetPageProduct>>>(apiUrl);
  // }
  // 分頁查詢會員所有商品數量
  // getMemPageProduct(memberId: string, page: number, perPage: number): Observable<IApiResponseProductList> {
  //   const apiUrl = `${this.url}${this.ProductUrl}get_mem_page_product?page=${page}&perPage=${perPage}`;
  //   return this.http.post<IApiResponseProductList>(
  //     apiUrl,
  //     `"${memberId}"`,  // 直接傳送 JSON 字串格式
  //     {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     }
  //   );
  // }
}
// Admin 相關API
@Injectable({
  providedIn: 'root'
})
export class AdminService extends BaseService {
  constructor() {
    super();
  }
  // 取得所有管理員
  getAllAdmins(): Observable<IApiResponse<IApiResponseAdmin>> {
    const apiUrl = `${this.url}${this.AdminUrl}get_all_admins`;
    return this.http.get<IApiResponse<IApiResponseAdmin>>(apiUrl);
  }
  // 分頁取得管理員
  getPageAdmins(page: number, pageSize: number): Observable<IApiResponse<IApiResponsePages<IApiResponseAdmin>>> {
    const params = {
      page: page.toString(),
      per_page: pageSize.toString()
    };
    return this.http.get<IApiResponse<any>>(`${this.url}${this.AdminUrl}get_page_admins`, { params });
  }
  // 依 id 查詢管理員
  getAdmin(id: string): Observable<IApiResponse<IApiResponseAdmin>> {
    const apiUrl = `${this.url}${this.AdminUrl}get_admin`;
    const requestBody = {
      id: id

    };
    return this.http.post<IApiResponse<IApiResponseAdmin>>(apiUrl, requestBody);
  }
  // 建立管理員
  createAdmin(name: string, email: string, password: string, permission: number, status: string): Observable<IApiResponse<IApiResponseAdmin>> {
    const apiUrl = `${this.url}${this.AdminUrl}create_admin`;
    const requestBody = {
      name: name,
      email: email,
      password: password,
      permission: permission,
      status: status
    };
    return this.http.post<IApiResponse<IApiResponseAdmin>>(apiUrl, requestBody);
  }
  // 更新管理員
  updateAdmin(id: string, name: string, email: string, permission: number, status: string): Observable<IApiResponse<IApiResponseAdmin>> {
    const apiUrl = `${this.url}${this.AdminUrl}update_admin`;
    const requestBody = {
      id: id,
      name: name,
      email: email,
      permission: permission,
      status: status
    };
    return this.http.put<IApiResponse<IApiResponseAdmin>>(apiUrl, requestBody);
  }
  // 變更密碼
  changePassword(id: string, newPassword: string): Observable<IApiResponseNormal> {
    const apiUrl = `${this.url}${this.AdminUrl}change_password`;
    const requestBody = {
      id: id,
      newPassword: newPassword
    };
    return this.http.put<IApiResponseNormal>(apiUrl, requestBody);
  }
  // 設定帳號狀態（啟用/停用）
  setAdminStatus(id: string, status: string): Observable<IApiResponse<IApiResponseAdmin>> {
    const apiUrl = `${this.url}${this.AdminUrl}set_status`;
    const requestBody = {
      id: id,
      status: status
    };
    return this.http.put<IApiResponse<IApiResponseAdmin>>(apiUrl, requestBody);
  }
}
// Auth 相關API
@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  constructor(private tokenService: TokenService) {
    super();
  }
  // Admin 登入
  // 帳：admin@example.com 密：P@ssw0rd
  adminLogin(email: string, password: string): Observable<IApiResponse<IApiResponseAdminLogin>> {
    const apiUrl = `${this.url}${this.AuthUrl}admin_login`;
    const requestBody = {
      email: email,
      password: password
    };
    return this.http.post<IApiResponse<IApiResponseAdminLogin>>(apiUrl, requestBody);
  }
  loginAndSaveToken(email: string, password: string): Observable<IApiResponse<IApiResponseAdminLogin>> {
    return new Observable(observer => {
      this.adminLogin(email, password).subscribe({
        next: (response) => {
          // 如果登入成功且有 jwt token
          if (response.isSuccess && response.data) {
            // 儲存 token
            if (response.data.jwt) {
              this.tokenService.setToken(response.data.jwt);
            }
            // 儲存 admin_id
            if (response.data.admin_id) {
              this.tokenService.setMemberId(response.data.admin_id);
            }
          }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
  // SSO 登入 -暫定
  ssoLogin(): Observable<IApiResponse<IApiResponseMemberSSOLogin>> {
    const ssoUrl = this.url + this.AuthUrl + 'sso_login';
    const requestBody = {
      "provider": "member",
      // "student_id": "1811432008",
      "student_id": "s1811432018",
    }
    return this.http.post<IApiResponse<IApiResponseMemberSSOLogin>>(ssoUrl, requestBody);
  }
  ssoLoginAndSaveToken(): Observable<IApiResponse<IApiResponseMemberSSOLogin>> {
    return new Observable(observer => {
      this.ssoLogin().subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            // 儲存 sso_token
            if (response.data.jwt) {
              this.tokenService.setToken(response.data.jwt);
            }
            // 儲存 member_id
            if (response.data.member_id) {
              this.tokenService.setMemberId(response.data.member_id);
            }
            // 儲存 admin_id
            if (response.data.admin_id) {
              this.tokenService.setCurrentAdminId(response.data.admin_id);
            }
          }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
  // 登出
  logout(): void {
    this.tokenService.removeToken();
    this.tokenService.removeMemberId();
  }
}
// Member 相關API
@Injectable({
  providedIn: 'root'
})
export class MemberService extends BaseService {
  constructor() {
    super();
  }
  // 取得所有會員
  getAllMembers(): Observable<IApiResponse<IApiResponsePages<IApiResponseMember>>> {
    const apiUrl = `${this.url}${this.MemberUrl}get_all_members`;
    return this.http.get<IApiResponse<IApiResponsePages<IApiResponseMember>>>(apiUrl);
  }
  // 分頁取得會員
  getPageMembers(page: number, pageSize: number): Observable<IApiResponse<IApiResponsePages<IApiResponseMember>>> {
    const params = {
      page: page.toString(),
      per_page: pageSize.toString()
    };
    const apiUrl = `${this.url}${this.MemberUrl}get_page_members`;
    return this.http.get<IApiResponse<IApiResponsePages<IApiResponseMember>>>(apiUrl, { params });
  }
  // 依 id 查詢會員
  getMember(id: string): Observable<IApiResponse<IApiResponseMember>> {
    const apiUrl = `${this.url}${this.MemberUrl}get_member`;
    const requestBody = {
      id: id
    };
    return this.http.post<IApiResponse<IApiResponseMember>>(apiUrl, requestBody);
  }
  // 更新會員
  updateMember(id: string, student_id: string, card_id: string, title: string, identityLev: string, name: string, email: string, status: string): Observable<IApiResponse<IApiResponseMember>> {
    const apiUrl = `${this.url}${this.MemberUrl}update_member`;
    const requestBody = {
      id: id,
      student_id: student_id,
      card_id: card_id,
      title: title,
      identityLev: identityLev,
      name: name,
      email: email,
      status: status
    };
    return this.http.put<IApiResponse<IApiResponseMember>>(apiUrl, requestBody);
  }
  setMemberStatus(id: string, status: string): Observable<IApiResponse<IApiResponseMember>> {
    const apiUrl = `${this.url}${this.MemberUrl}set_status`;
    const requestBody = {
      id: id,
      status: status
    };
    return this.http.put<IApiResponse<IApiResponseMember>>(apiUrl, requestBody);
  }
}
// Device 相關API
@Injectable({
  providedIn: 'root'
})
export class DeviceService extends BaseService {
  constructor() {
    super();
  }
  // 創建新設備
  createDevice(name: string, location: string, status: string, machine_id: string, machine_ip: string): Observable<IApiResponse<IApiResponseDevice>> {
    const apiUrl = `${this.url}${this.DeviceUrl}create_device`;
    const requestBody = {
      name: name,
      location: location,
      status: status,
      machine_id: machine_id,
      machine_ip: machine_ip
    };
    return this.http.post<IApiResponse<IApiResponseDevice>>(apiUrl, requestBody);
  }
  // 刪除設備
  deleteDevice(deviceId: string): Observable<IApiResponseNormal2> {
    const apiUrl = `${this.url}${this.DeviceUrl}delete_device`;
    const requestBody = {
      deviceId: deviceId
    };
    return this.http.put<IApiResponseNormal2>(apiUrl, requestBody);
  }
  // 更新設備資訊
  updateDevice(device_id: string, name: string, location: string, status: string, machine_id: string, machine_ip: string): Observable<IApiResponse<IApiResponseDevice>> {
    const apiUrl = `${this.url}${this.DeviceUrl}update_device`;
    const requestBody = {
      device_id: device_id,
      name: name,
      location: location,
      status: status,
      machine_id: machine_id,
      machine_ip: machine_ip,
    };
    return this.http.put<IApiResponse<IApiResponseDevice>>(apiUrl, requestBody);
  }
  // 取得所有設備狀態
  getAllDeviceState(): Observable<IApiResponse<IApiResponseDeviceState>> {
    const apiUrl = `${this.url}${this.DeviceUrl}get_state_num`;
    return this.http.get<IApiResponse<IApiResponseDeviceState>>(apiUrl);
  }
  // 分頁查詢設備項目
  getPageDevice(
    page: number,
    perPage: number,
    device_name?: string,
    device_location?: string,
    state?: string
  ): Observable<IApiResponse<IApiResponsePages<IApiResponseDevice>>> {
    const apiUrl = `${this.url}${this.DeviceUrl}get_page_device?page=${page}&perPage=${perPage}`;

    const body: any = {};
    if (device_name) body.device_name = device_name;
    if (device_location) body.device_location = device_location;
    if (state) body.state = state;

    return this.http.post<IApiResponse<IApiResponsePages<IApiResponseDevice>>>(apiUrl, body);
  }


  // 查詢單一設備狀態
  getOneDevice(id: string): Observable<IApiResponse<IApiResponseDevice>> {
    const apiUrl = `${this.url}${this.DeviceUrl}get_one_device`;
    const requestBody = {
      id: id
    };
    return this.http.post<IApiResponse<IApiResponseDevice>>(apiUrl, requestBody);
  }
  // 設備清潔狀態更新
  deviceCleaned(deviceId: string, memberId: string): Observable<IApiResponseNormal> {
    const apiUrl = `${this.url}${this.DeviceUrl}device_cleaning_button`;
    const requestBody = {
      deviceId: deviceId,
      memberId: memberId
    };
    return this.http.put<IApiResponseNormal>(apiUrl, requestBody);
  }
}

// Security 相關API
@Injectable({
  providedIn: 'root'
})
export class SecurityService extends BaseService {
  constructor() {
    super();
  }
  // 取得所有權限角色（與 getRolePermission 回傳相同結構）
  getAllRolesList(): Observable<IApiResponse<IApiResponseSecurityRole[]>> {
    const apiUrl = `${this.url}${this.SecurityUrl}list`;
    return this.http.get<IApiResponse<IApiResponseSecurityRole[]>>(apiUrl);
  }
  // 創建權限角色
  createRole(name: string, description: string, status: string): Observable<IApiResponse<IApiResponseSecurityRole[]>> {
    const apiUrl = `${this.url}${this.SecurityUrl}create`;
    const requestBody = {
      name: name,
      description: description,
      status: status
    };
    return this.http.post<IApiResponse<IApiResponseSecurityRole[]>>(apiUrl, requestBody);
  }
  // 修改權限角色
  updateRole(id: string, name: string, description: string, status: string): Observable<IApiResponse<null>> {
    const apiUrl = `${this.url}${this.SecurityUrl}update`;
    const requestBody = {
      id: id,
      name: name,
      description: description,
      status: status
    };
    return this.http.put<IApiResponse<null>>(apiUrl, requestBody);
  }
  // 設定權限
  // setPermissions(role_id: string, permissions: string[], replace: boolean): Observable<IApiResponse<any>> {
  //   const apiUrl = `${this.url}${this.SecurityUrl}set_permissions`;
  //   const requestBody = {
  //     role_id: role_id,
  //     permissions: permissions,
  //     replace: replace
  //   };
  //   return this.http.put<IApiResponse<any>>(apiUrl, requestBody);
  // }
  // 取得管理員的所有角色（包含 is_owned 狀態）
  getRolePermission(adminId: string): Observable<IApiResponse<IApiResponseSecurityRole[]>> {
    const apiUrl = `${this.url}${this.AccessUrl}get_roles_status_by_admin?admin_id=${adminId}`;
    return this.http.get<IApiResponse<IApiResponseSecurityRole[]>>(apiUrl);
  }
  // 為管理員分配角色
  assignRolesToAdmin(adminId: string, roleIds: string[]): Observable<IApiResponse<any>> {
    const apiUrl = `${this.url}${this.SecurityUrl}assign_roles`;
    const requestBody = {
      admin_id: adminId,
      role_ids: roleIds
    };
    return this.http.post<IApiResponse<any>>(apiUrl, requestBody);
  }
}