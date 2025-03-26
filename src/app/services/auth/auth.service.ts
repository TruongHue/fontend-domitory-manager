import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7206/api/Account';

  constructor(private http: HttpClient,private router: Router) {}

  login(userCode: string, password: string): Observable<{ token: string; idAccount: string; role: string }> {
    return this.http.post<{ token: string; idAccount: string; role: string }>(
      `${this.apiUrl}/login`, 
      { userCode, password }
    );
  }

  register(data: FormData) {
    if (!data) {
      console.error("❌ FormData bị null hoặc undefined!");
      return throwError(() => new Error("Dữ liệu đăng ký không hợp lệ"));
    }
  
    return this.http.post(`${this.apiUrl}/register`, data);
  }
  
  
  

  logout() {
    localStorage.removeItem('token'); // Xóa token JWT
    localStorage.removeItem('role');  // Xóa role nếu có
    this.router.navigate(['/login']); // Chuyển hướng về trang login
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // Kiểm tra nếu có token
  }
}
