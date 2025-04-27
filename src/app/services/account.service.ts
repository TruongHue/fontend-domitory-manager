import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'https://domitory-backend.onrender.com/api/Account';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({
      'Authorization': `Bearer ${token}`
    }) : new HttpHeaders();
  }

  addAccount(accountData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-account`, accountData, { headers: this.getAuthHeaders() });
  }

  importExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import-excel`, formData, { headers: this.getAuthHeaders() });
  }

  getAllStaffs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/All-account-staff`, { headers: this.getAuthHeaders() });
  }

  DeleteStaffs(idStaff: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-account/${idStaff}`, { headers: this.getAuthHeaders() });
  }

  getInactiveAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inactive-account-students`, { headers: this.getAuthHeaders() });
  }

  getActiveAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active-account-students`, { headers: this.getAuthHeaders() });
  }

  getBlockedAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/blocked-account-students`, { headers: this.getAuthHeaders() });
  }

  getWaitAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/wait-account-students`, { headers: this.getAuthHeaders() });
  }

  putStatus(id: string, status: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/account-student/status/${id}`, status, { headers: this.getAuthHeaders() });
  }
}
