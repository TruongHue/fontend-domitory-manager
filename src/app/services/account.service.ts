import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'https://localhost:7206/api/Account';

  constructor(private http: HttpClient) {}

  getInactiveAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inactive-accounts`);
  }

  getActiveAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active-accounts`);
  }

  getBlockedAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/blocked-accounts`);
  }

  putStatusActive(id:number):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/update-status-active/${id}`,{});
  }
  putStatusInActive(id:number):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/update-status-inactive/${id}`,{});
  }
  putStatusBlocked(id:number):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/update-status-blocked/${id}`,{});
  }
}
