import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectricityBillService {
  private apiUrl = 'https://domitory-backend.onrender.com/api/Bill';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  // 📌 Thêm hóa đơn điện mới
  addElectricBill(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-electricity-bill`, data, { headers: this.getAuthHeaders() });
  }

  getElectricitiesBillByIdRoom(IdRoom: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/electricity/${IdRoom}`, { headers: this.getAuthHeaders() });
  }
}
