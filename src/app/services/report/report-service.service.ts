import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportServiceService {
  private apiUrl = 'https://localhost:7206/api/RegisterRoom/get-active-registers';
  private roomApiUrl = 'https://localhost:7206/api/Room'; // API lấy danh sách phòng
  private userApiUrl = 'https://localhost:7206/api/User'; // API lấy danh sách người dùng

  constructor(private http: HttpClient) {}

  getAllRegisterRoom(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
  getAllRooms(): Observable<any[]> { 
    return this.http.get<any[]>(this.roomApiUrl); // Gọi API lấy danh sách phòng
  }
  getAllUsers(): Observable<any[]> { 
    return this.http.get<any[]>(this.userApiUrl); // Gọi API lấy danh sách sinh viên
  }
}
