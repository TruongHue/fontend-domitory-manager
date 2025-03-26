import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomBillService {
  private apiUrl = 'https://localhost:7206/api/Bill';

  constructor(private http: HttpClient) {}

  getBillByRoomId(idRoom: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Room/${idRoom}`);
  }
  getPriceWaterElectricities(): Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}/price`);
  }
  addOrUpdatePrice(price: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/price/add-or-update-price`, price);
  }
   // 🛠 Thanh toán hóa đơn điện
   payElectricBill(billId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/electricity/pay/${billId}`, {});
  }

  // 🛠 Thanh toán hóa đơn nước
  payWaterBill(billId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/water/pay/${billId}`, {});
  }

  // 🗑 Xóa hóa đơn điện
  deleteElectricBill(billId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/electricity/${billId}`);
  }

  // 🗑 Xóa hóa đơn nước
  deleteWaterBill(billId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/water/${billId}`);
  }
  
  checkHasUnpaidBill(idRoom: number) {
    return this.http.get<{ hasUnpaidBill: boolean }>(`${this.apiUrl}/room/${idRoom}/has-unpaid-bill`);
  }
  
}
