import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomBillService {
  private apiUrl = 'https://domitory-backend.onrender.com/api/Bill';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAllBillElectricAndWaterByRoomId(idRoom: string): Observable<any> {
    console.log(idRoom);
    return this.http.get<any[]>(`${this.apiUrl}/all/bills/${idRoom}`, { headers: this.getAuthHeaders() });
  }

  getLatestElectricBillByIdRoom(idRoom: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/electricity/${idRoom}`, { headers: this.getAuthHeaders() });
  }

  getPriceWaterElectricities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/price`, { headers: this.getAuthHeaders() });
  }

  deletePriceWaterElectricities(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/price/${id}`, { headers: this.getAuthHeaders() });
  }

  addOrUpdatePrice(price: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/price/add-or-update-price`, price, { headers: this.getAuthHeaders() });
  }

  // 🛠 Thanh toán hóa đơn điện
  payElectricBill(billId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/electricity/pay/${billId}`, data, { headers: this.getAuthHeaders() });
  }

  // 🛠 Thanh toán hóa đơn nước
  payWaterBill(billId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/water/pay/${billId}`, data, { headers: this.getAuthHeaders() });
  }

  // 🗑 Xóa hóa đơn điện
  deleteElectricBill(billId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/electric/${billId}`, { headers: this.getAuthHeaders() });
  }

  // 🗑 Xóa hóa đơn nước
  deleteWaterBill(billId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/water/${billId}`, { headers: this.getAuthHeaders() });
  }

  checkHasUnpaidBill(idRoom: string): Observable<{ hasUnpaidBill: boolean }> {
    const url = `${this.apiUrl}/room/${idRoom}/has-unpaid-bill`;
    console.log('📌 [checkHasUnpaidBill] URL gọi API:', url);
    return this.http.get<{ hasUnpaidBill: boolean }>(url, { headers: this.getAuthHeaders() });
  }

  getlatestElectricity(idRoom: string): Observable<any> {
    console.log("Gửi request lấy hóa đơn điện mới nhất cho phòng:", idRoom);
    return this.http.get<any>(`${this.apiUrl}/latestElectricity/${idRoom}`, { headers: this.getAuthHeaders() });
  }

  addElectricityBill(requestPayload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add/electricity`, requestPayload, { headers: this.getAuthHeaders() });
  }

  getlatestWater(idRoom: string): Observable<any> {
    console.log("Gửi request lấy hóa đơn nước mới nhất cho phòng:", idRoom);
    return this.http.get<any>(`${this.apiUrl}/latestWater/${idRoom}`, { headers: this.getAuthHeaders() });
  }

  addWaterBill(requestPayload: any): Observable<any> {
    console.log(requestPayload);
    return this.http.post<any>(`${this.apiUrl}/add/water`, requestPayload, { headers: this.getAuthHeaders() });
  }
}
