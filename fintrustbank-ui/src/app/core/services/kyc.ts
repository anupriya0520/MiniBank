import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class KycService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  submitKyc(formData: FormData) {
    return this.http.post<any>(`${this.api}/kyc/submit`, formData);
  }

  getMyKyc() {
    return this.http.get<any>(`${this.api}/kyc/my`);
  }
}