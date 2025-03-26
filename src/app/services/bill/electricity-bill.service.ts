import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectricityBillService {
  private apiUrl = 'https://localhost:7206/api/Bill/electricity';

  constructor(private http: HttpClient) {}

  // 📌 Lấy hóa đơn điện theo IdRoom
  getBillByRoomId(idRoom: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-electricity-bill/${idRoom}`)
    .pipe(
      tap((res) => console.log(`✅ Dữ liệu nhận từ API (roomId: ${idRoom}):`, res)),
      catchError((error) => {
        console.error(`❌ Lỗi khi gọi API hóa đơn điện (roomId: ${idRoom}):`, error);
        return of(null);
      })
    );
  }

  // 📌 Thêm hóa đơn điện mới
  addElectricBill(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-electricity-bill`, data);
  }


  getLatestElectricBill(roomId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/latest/${roomId}`)
      .pipe(
        tap((res) => console.log(`✅ Dữ liệu nhận từ API (roomId: ${roomId}):`, res)),
        catchError((error) => {
          console.error(`❌ Lỗi khi gọi API hóa đơn điện (roomId: ${roomId}):`, error);
          return of(null);
        })
      );
  }
  
  getElectricitiesBillByIdRoom(IdRoom: number): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/room/${IdRoom}`);
  }
}
