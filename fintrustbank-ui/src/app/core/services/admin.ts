import { Injectable } from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}
  getUsers(
    page: number,
    pageSize: number,
    search?: string,
    isActive?: boolean | null
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search)
      params = params.set('search', search);

    if (isActive !== null && isActive !== undefined)
      params = params.set('isActive', isActive);

    return this.http.get(`${this.api}/admin/users`, { params });
  }
   toggleUser(userId: number, reason?: string) {
  return this.http.patch(
    `${this.api}/admin/users/${userId}/toggle-status`,
    null
  );
}
  getAccounts(
    page: number,
    pageSize: number,
    search?: string,
    status?: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search)
      params = params.set('search', search);

    if (status)
      params = params.set('status', status);

return this.http.get(`${this.api}/admin/accounts`, { params });  }
  getAccountById(accountId: number): Observable<any> {

   return this.http.get(`${this.api}/admin/accounts/${accountId}`);
  }
  toggleAccount(accountId: number, reason?: string) {
  return this.http.patch(
    `${this.api}/admin/accounts/${accountId}/toggle`,
    JSON.stringify(reason ?? null),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
  getAccountTransactions(
    accountId: number,
    page: number,
    pageSize: number
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get(`${this.api}/admin/accounts/${accountId}/transactions`, { params });

  }
  getTransactions(
    page: number,
    pageSize: number,
    flagged?: boolean | null,
    search?: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (flagged !== null && flagged !== undefined)
      params = params.set('flagged', flagged);

    if (search)
      params = params.set('search', search);

return this.http.get(`${this.api}/admin/transactions`, { params });

  }
  getTransactionById(transactionId: number): Observable<any> {

   return this.http.get(`${this.api}/admin/transactions/${transactionId}`);
  }
  getAuditLogs(
  page: number,
  pageSize: number,
  action?: string,
  search?: string
) {

  let params = new HttpParams()
    .set('page', page)
    .set('pageSize', pageSize);

  if (action)
    params = params.set('action', action);

  if (search)
    params = params.set('search', search);

return this.http.get(`${this.api}/admin/audit-logs`, { params });
}

  getDashboard() {
    return this.http.get<any>(`${this.api}/admin/dashboard`);
  }
  
  getPendingKyc() {
    return this.http.get<any>(`${this.api}/admin/kyc/pending`);
  }
  getAllKyc() {
    return this.http.get<any>(`${this.api}/admin/kyc`);
  }
  reviewKyc(kycId: number, data: any) {
    return this.http.put<any>(`${this.api}/admin/kyc/${kycId}/review`, data);
  }
  getKycDocument(kycId: number): string {
    return `${this.api}/admin/kyc/document/${kycId}`;
  }
  downloadKycDocument(kycId: number) {
    return this.http.get(`${this.api}/admin/kyc/document/${kycId}`, {
      responseType: 'blob'
    });
  }

  getAllUsers(page:number,pageSize:number) {
  return this.http.get<any>(`${this.api}/admin/users`,{
    params:{page,pageSize}
  });
}

  
  getTransactionsByUser(userId: number) {
    return this.http.get<any>(`${this.api}/admin/users/${userId}/transactions`);
  }
  getTransactionsByAccount(accountId: number) {
    return this.http.get<any>(`${this.api}/admin/accounts/${accountId}/transactions`);
  }

  deactivateAccount(accountId: number, reason?: string) {
    return this.http.put<any>(`${this.api}/admin/accounts/${accountId}/deactivate`, { reason });
  }
  activateAccount(accountId: number, reason?: string) {
    return this.http.put<any>(`${this.api}/admin/accounts/${accountId}/activate`, { reason });
  }

  getLargeTransactions(minAmount = 100000, take = 100) {
    return this.http.get<any>(`${this.api}/admin/transactions/large?minAmount=${minAmount}&take=${take}`);
  }
  flagTransaction(transactionId: number, data: { reason: string }) {
    return this.http.put<any>(`${this.api}/admin/transactions/${transactionId}/flag`, data);
  }
}