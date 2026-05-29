import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHistory(accountId:number,page:number,pageSize:number){
  return this.http.get(
    `${this.api}/accounts/${accountId}/transactions/history`,
    { params:{ page, pageSize } }
  );
}

  withdraw(accountId: number, data: any) {
    return this.http.post<any>(`${this.api}/accounts/${accountId}/transactions/withdraw`, data);
  }

  transferToAccount(accountId: number, data: any) {
    return this.http.post<any>(`${this.api}/accounts/${accountId}/transactions/transfer/account`, data);
  }

  transferToPhone(accountId: number, data: any) {
    return this.http.post<any>(`${this.api}/accounts/${accountId}/transactions/transfer/phone`, data);
  }
  deposit(accountId: number, data: any) {
      return this.http.post<any>(`${this.api}/accounts/${accountId}/transactions/deposit`, data);
    }

  transferToBeneficiary(accountId: number, data: any) {
    return this.http.post<any>(`${this.api}/accounts/${accountId}/transactions/transfer/beneficiary`, data);
  }
}