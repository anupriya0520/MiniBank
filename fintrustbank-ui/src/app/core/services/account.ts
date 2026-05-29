import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyAccounts() {
    return this.http.get<any>(`${this.api}/accounts`);
  }

  setTransferPin(accountId: number, data: any) {
    return this.http.post<any>(`${this.api}/accounts/${accountId}/set-transfer-pin`, data);
  }

  updateTransferPin(accountId: number, data: any) {
    return this.http.put<any>(`${this.api}/accounts/${accountId}/update-transfer-pin`, data);
  }

  getBeneficiaries(accountId: number) {
    return this.http.get<any>(`${this.api}/accounts/${accountId}/beneficiaries`);
  }

  addBeneficiary(accountId: number, data: any) {
    return this.http.post<any>(`${this.api}/accounts/${accountId}/beneficiaries`, data);
  }
  createAccount(data: any) {
  return this.http.post<any>(`${this.api}/accounts/create`, data);
}
viewBalance(accountId: number, pin: string) {
  return this.http.post(
    `${environment.apiUrl}/accounts/${accountId}/view-balance`,
    { pin }
  );
}
  deleteBeneficiary(accountId: number, beneficiaryId: number) {
    return this.http.delete<any>(`${this.api}/accounts/${accountId}/beneficiaries/${beneficiaryId}`);
  }
}