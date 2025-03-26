import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistrationPeriodService {
  private apiUrl = 'https://localhost:7206/api/RegistrationPeriod';

  constructor(private http: HttpClient) {}

  getAllRegistrationPeriods(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/get-all-registration-periods`);
  }
  getRegistrationPeriodsActive(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-all-registration-periods-active`);
  }
  addRegistrationPeriod(period: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-registration-status`, period);
  }
  deleteRegistrationPeriod(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-registration-period/${id}`);
  }

  updateRegistrationPeriod(id: number, updatedPeriod: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-registration-period/${id}`, updatedPeriod);
  }
  

}
