import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WaterbillService {
  private apiUrl = 'https://domitory-backend.onrender.com/api/Bill';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  // 📌 Thêm hóa đơn nước mới
  addWaterBill(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-water-bill`, data, { headers: this.getAuthHeaders() });
  }

  getWaterBillByIdRoom(IdRoom: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/water/${IdRoom}`, { headers: this.getAuthHeaders() });
  }
}
