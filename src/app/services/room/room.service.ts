import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private roomApiUrl = 'https://domitory-backend.onrender.com/api/Room';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.roomApiUrl, { headers: this.getAuthHeaders() });
  }

  postRoom(newRoom: any): Observable<any> {
    return this.http.post<any>(this.roomApiUrl, newRoom, { headers: this.getAuthHeaders() });
  }

  updateRoomStatus(IdRoom: string, newStatus: number): Observable<any> {
    return this.http.put<any>(`${this.roomApiUrl}/status`, { IdRoom, Status: newStatus }, { headers: this.getAuthHeaders() });
  }

  getRoomById(roomId: string): Observable<any> {
    return this.http.get<any>(`${this.roomApiUrl}/by-id/${roomId}`, { headers: this.getAuthHeaders() });
  }

  deleteRoom(IdRoom: string): Observable<any> {
    return this.http.delete<any>(`${this.roomApiUrl}/${IdRoom}`, { headers: this.getAuthHeaders() });
  }

  updateRoom(IdRoom: string, infoRoom: any): Observable<any> {
    return this.http.put<any>(`${this.roomApiUrl}/${IdRoom}`, infoRoom, { headers: this.getAuthHeaders() });
  }
}
