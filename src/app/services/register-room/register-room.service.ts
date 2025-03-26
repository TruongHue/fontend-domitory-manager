import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterRoomService {
  private apiUrl = 'https://localhost:7206/api/RegisterRoom';

  constructor(private http: HttpClient) {}

  getAllRegisters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-all-registers`);
  }

  getActiveRegisters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-active-registers`);
  }

  // Lấy danh sách đăng ký đang hoạt động theo idRoom
  getActiveRegisterByIdRoom(idRoom: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-active-registers-byIdRoom/${idRoom}`);
  }
  getRegistersByUser(idStudent: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-registers-byUser/${idStudent}`);
  }

  // Lấy tất cả danh sách đăng ký theo idRoom
  getAllRegisterByIdRoom(idStudent: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-all-registers-byIdRoom/${idStudent}`);
  }
  createRegister(registerData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, registerData);
  }

  updatePaymentStatus(idRegister: number, newPaymentStatus: number) {
    return this.http.put<any>(`${this.apiUrl}/update-status-payment/${idRegister}/${newPaymentStatus}`, {});
}


}
