import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {
  private apiUrl = 'https://domitory-backend.onrender.com/api/RegisterRoom/total-registered-students';
  private roomApiUrl = 'https://domitory-backend.onrender.com/api/Room'; // API lấy danh sách phòng
  private userApiUrl = 'https://domitory-backend.onrender.com/api/User'; // API lấy danh sách người dùng

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAllRegisterRoom(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }
  getAllRegistrationPeriod(): Observable<any[]> {
    return this.http.get<any[]>("https://domitory-backend.onrender.com/api/RegisterRoom/count-by-registration-period", { headers: this.getAuthHeaders() });
  }
  getAllRooms(): Observable<any[]> { 
    return this.http.get<any[]>(this.roomApiUrl, { headers: this.getAuthHeaders() }); // Gọi API lấy danh sách phòng
  }

  getAllUsers(): Observable<any[]> { 
    return this.http.get<any[]>(this.userApiUrl, { headers: this.getAuthHeaders() }); // Gọi API lấy danh sách sinh viên
  }
}
