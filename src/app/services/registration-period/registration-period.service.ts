import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationPeriodService {
  private apiUrl = 'https://domitory-backend.onrender.com/api/RegistrationPeriod';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAllRegistrationPeriods(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-all-registration-periods`, { headers: this.getAuthHeaders() });
  }

  getRegistrationPeriodsActive(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-all-registration-periods-active`, { headers: this.getAuthHeaders() });
  }

  addRegistrationPeriod(period: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-registration-period`, period, { headers: this.getAuthHeaders() });
  }

  deleteRegistrationPeriod(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-registration-period/${id}`, { headers: this.getAuthHeaders() });
  }

  updateRegistrationPeriod(id: string, updatedPeriod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-registration-period/${id}`, updatedPeriod, { headers: this.getAuthHeaders() });
  }

  updateRegistrationStatusPeriod(id: string, updatedPeriod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-registration-period-status/${id}`, updatedPeriod, { headers: this.getAuthHeaders() });
  }
}
