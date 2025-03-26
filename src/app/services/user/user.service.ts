import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://localhost:7206/api/User';
      constructor(private http: HttpClient) { }
    
      getUsers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
      }

      getUsersById(id: number): Observable<any> {
        if (!id) {
          console.error('❌ Lỗi: ID không hợp lệ!');
          return throwError(() => new Error('ID không hợp lệ!'));
        }
      
        return this.http.get<any>(`${this.apiUrl}/by-id/${id}`).pipe(
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
