import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://domitory-backend.onrender.com/api/Account';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active-account-students`, { headers: this.getAuthHeaders() });
  }

  getUsersById(id: string): Observable<any> {
    if (!id) {
      console.error('❌ Lỗi: ID không hợp lệ!');
      return throwError(() => new Error('ID không hợp lệ!'));
    }

    return this.http.get<any>(`${this.apiUrl}/account-student-id/${id}`, { headers: this.getAuthHeaders() }).pipe(
      tap((user) => {
        if (!user) {
          console.warn(`⚠️ Không tìm thấy người dùng với ID: ${id}`);
        } else {
          console.log(`✅ Dữ liệu nhận từ API (ID: ${id}):`, user);
        }
      }),
      catchError((error) => {
        console.error(`❌ Lỗi khi gọi API người dùng (ID: ${id}):`, error);
        return throwError(() => new Error('Không thể lấy thông tin người dùng!'));
      })
    );
  }
}
