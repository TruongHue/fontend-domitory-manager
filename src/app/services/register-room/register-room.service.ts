import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class RegisterRoomService {
  private apiUrl = 'https://domitory-backend.onrender.com/api/RegisterRoom';
  private tokenbackup = '';
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log(token);
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAllRegisters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  getActiveRegisters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-active-registers`, { headers: this.getAuthHeaders() });
  }

  getActiveRegisterByIdRoom(idRoom: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-active-registers-byIdRoom/${idRoom}`, { headers: this.getAuthHeaders() });
  }

  getRegistersByUser(idStudent: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history/${idStudent}`, { headers: this.getAuthHeaders() });
  }

  getAllRegisterByIdRoom(idStudent: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-all-registers-byIdRoom/${idStudent}`, { headers: this.getAuthHeaders() });
  }

  createRegister(registerData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, registerData, { headers: this.getAuthHeaders() });
  }

  fetchStudents(idRoom: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/students-paybill/${idRoom}`, { headers: this.getAuthHeaders() });
  }

  updatePaymentStatus(idRegister: string, data: any): Observable<any> {
    console.log('Updating payment status for:', idRegister, 'with data:', data,'token',Token);
    return this.http.put(`${this.apiUrl}/update-payment-status/${idRegister}`, data, { headers: this.getAuthHeaders() });
  }

  updateStatus(idRegister: string, data: any): Observable<any> {
    console.log('Updating status for:', idRegister, 'with data:', data);
    return this.http.put(`${this.apiUrl}/update-status/${idRegister}`, data, { headers: this.getAuthHeaders() });
  }

  deleteRegister(idRegister: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-register/${idRegister}`, { headers: this.getAuthHeaders() });
  }

  getAllRegisterRoombyIdRoomActive(idRoom: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/students-in-room/${idRoom}`, { headers: this.getAuthHeaders() });
  }
}
